from typing import List, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.core.database import get_db
from app.models.product import Product, Category, Review
from app.schemas.product import (
    ProductResponse,
    ProductListResponse,
    ProductCreate,
    ProductUpdate,
    ReviewCreate,
    ReviewResponse,
)
from app.api.deps import get_current_user_optional, get_current_admin_user

router = APIRouter()


def format_product(p: Product) -> dict:
    """Format product model to schema dict."""
    return {
        "id": p.id,
        "name": p.name,
        "price": p.price,
        "originalPrice": p.original_price,
        "discountPercent": p.discount_percent,
        "priceValue": p.price_value,
        "category": p.category,
        "rating": p.rating,
        "reviewCount": p.review_count or len(p.reviews or []),
        "description": p.description,
        "image": p.image,
        "images": p.images or [p.image],
        "highlights": p.highlights or [],
        "specs": p.specs or {},
        "stock": p.stock,
        "is_featured": p.is_featured,
        "reviews": [
            {
                "id": r.id,
                "userName": r.user_name,
                "rating": r.rating,
                "comment": r.comment,
                "date": r.date or r.created_at.strftime("%d %b %Y") if r.created_at else "",
                "created_at": r.created_at,
            }
            for r in (p.reviews or [])
        ],
    }


@router.get("", response_model=ProductListResponse)
def get_products(
    category: Optional[str] = Query(None, description="Filter by category name"),
    search: Optional[str] = Query(None, description="Search query by name or description"),
    sort: Optional[str] = Query("Default", description="Sort option: 'Price: Low to High', 'Price: High to Low', 'Rating: High to Low', or 'Default'"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """List products with filtering, search, sorting, and pagination."""
    query = db.query(Product).filter(Product.is_active == True)

    if category and category.strip() and category.lower() != "all":
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(or_(Product.name.ilike(s), Product.description.ilike(s), Product.category.ilike(s)))

    # Sorting
    if sort == "Price: Low to High" or sort == "price_asc":
        query = query.order_by(asc(Product.price_value))
    elif sort == "Price: High to Low" or sort == "price_desc":
        query = query.order_by(desc(Product.price_value))
    elif sort == "Rating: High to Low" or sort == "rating_desc":
        query = query.order_by(desc(Product.rating))
    else:
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    pages = (total + limit - 1) // limit if limit > 0 else 1

    return ProductListResponse(
        items=[format_product(p) for p in products],
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/featured", response_model=List[ProductResponse])
def get_featured_products(db: Session = Depends(get_db)):
    """Get list of featured products."""
    products = db.query(Product).filter(Product.is_active == True, Product.is_featured == True).limit(10).all()
    if not products:
        products = db.query(Product).filter(Product.is_active == True).limit(6).all()
    return [format_product(p) for p in products]


@router.get("/{id}", response_model=ProductResponse)
def get_product(id: str, db: Session = Depends(get_db)):
    """Get single product details by ID."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{id}' not found",
        )
    return format_product(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    p_in: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Create a new product (Admin only)."""
    product = Product(
        name=p_in.name,
        price=p_in.price,
        original_price=p_in.originalPrice,
        discount_percent=p_in.discountPercent or 0,
        price_value=p_in.priceValue,
        category=p_in.category,
        rating=p_in.rating or 5.0,
        review_count=p_in.reviewCount or 0,
        description=p_in.description,
        image=p_in.image,
        images=p_in.images or [p_in.image],
        highlights=p_in.highlights or [],
        specs=p_in.specs or {},
        stock=p_in.stock or 100,
        is_featured=p_in.is_featured or False,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return format_product(product)


@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: str,
    p_in: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Update a product (Admin only)."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = p_in.model_dump(exclude_unset=True)
    if "originalPrice" in update_data:
        update_data["original_price"] = update_data.pop("originalPrice")
    if "discountPercent" in update_data:
        update_data["discount_percent"] = update_data.pop("discountPercent")
    if "priceValue" in update_data:
        update_data["price_value"] = update_data.pop("priceValue")
    if "reviewCount" in update_data:
        update_data["review_count"] = update_data.pop("reviewCount")

    for key, value in update_data.items():
        setattr(product, key, value)

    db.add(product)
    db.commit()
    db.refresh(product)
    return format_product(product)


@router.delete("/{id}")
def delete_product(
    id: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Delete a product (Admin only)."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/{id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(
    id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    """Add a customer review to a product."""
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user_name = review_in.userName or (current_user.name if current_user else "Verified Buyer")
    user_id = current_user.id if current_user else None

    today_str = datetime.now(timezone.utc).strftime("%d %b %Y")
    review = Review(
        product_id=id,
        user_id=user_id,
        user_name=user_name,
        rating=review_in.rating,
        comment=review_in.comment,
        date=today_str,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate product average rating
    all_reviews = db.query(Review).filter(Review.product_id == id).all()
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        product.rating = round(avg_rating, 1)
        product.review_count = len(all_reviews)
        db.add(product)
        db.commit()

    return ReviewResponse(
        id=review.id,
        userName=review.user_name,
        rating=review.rating,
        comment=review.comment,
        date=review.date,
        created_at=review.created_at,
    )
