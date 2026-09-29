from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.product import Category, Product
from app.schemas.product import CategoryResponse, CategoryCreate
from app.api.deps import get_current_admin_user

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all product categories with product counts."""
    categories = db.query(Category).all()
    result = []
    for cat in categories:
        count = db.query(Product).filter(
            (Product.category_id == cat.id) | (Product.category == cat.name)
        ).count()
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image": cat.image,
            "product_count": count,
        }
        result.append(cat_dict)
    return result


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Create a new category (Admin only)."""
    slug = cat_in.slug or cat_in.name.lower().replace(" ", "-")
    existing = db.query(Category).filter((Category.name == cat_in.name) | (Category.slug == slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists",
        )
    cat = Category(
        name=cat_in.name,
        slug=slug,
        description=cat_in.description,
        image=cat_in.image,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image=cat.image,
        product_count=0,
    )
