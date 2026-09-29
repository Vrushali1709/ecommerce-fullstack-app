from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistResponse
from app.schemas.product import ProductResponse
from app.api.deps import get_current_user
from app.api.products import format_product

router = APIRouter()


@router.get("", response_model=WishlistResponse)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all products in the current user's wishlist."""
    items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    products = []
    for item in items:
        if item.product and item.product.is_active:
            products.append(format_product(item.product))

    return WishlistResponse(
        items=products,
        count=len(products),
    )


@router.post("/{product_id}", response_model=WishlistResponse)
def toggle_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Toggle a product in wishlist (adds if not present, removes if already present)."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first()

    if existing:
        db.delete(existing)
    else:
        wishlist_item = WishlistItem(
            user_id=current_user.id,
            product_id=product_id,
        )
        db.add(wishlist_item)

    db.commit()
    return get_wishlist(db=db, current_user=current_user)


@router.delete("/{product_id}", response_model=WishlistResponse)
def remove_from_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Remove a product from wishlist."""
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    return get_wishlist(db=db, current_user=current_user)


@router.get("/check/{product_id}")
def check_in_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Check if a specific product is in the user's wishlist."""
    exists = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first() is not None
    return {"in_wishlist": exists}
