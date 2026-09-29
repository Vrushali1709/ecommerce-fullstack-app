from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemResponse, CartItemAdd, CartItemUpdate
from app.api.deps import get_current_user
from app.api.products import format_product

router = APIRouter()


def build_cart_response(user_id: str, db: Session) -> CartResponse:
    """Helper to query user's cart and calculate totals."""
    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    formatted_items = []
    cart_count = 0
    total_price = 0.0

    for item in items:
        if item.product and item.product.is_active:
            prod_schema = format_product(item.product)
            formatted_items.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": prod_schema,
            })
            cart_count += item.quantity
            total_price += item.product.price_value * item.quantity

    return CartResponse(
        items=formatted_items,
        cart_count=cart_count,
        total_price=round(total_price, 2),
    )


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the current user's shopping cart."""
    return build_cart_response(current_user.id, db)


@router.post("/items", response_model=CartResponse)
def add_to_cart(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Add a product to cart or increment quantity."""
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == payload.product_id,
    ).first()

    if cart_item:
        cart_item.quantity += payload.quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=payload.product_id,
            quantity=max(1, payload.quantity),
        )
        db.add(cart_item)

    db.commit()
    return build_cart_response(current_user.id, db)


@router.patch("/items/{product_id}", response_model=CartResponse)
def update_cart_item(
    product_id: str,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update item quantity in cart. If quantity <= 0, remove item."""
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id,
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = payload.quantity
        db.add(cart_item)

    db.commit()
    return build_cart_response(current_user.id, db)


@router.delete("/items/{product_id}", response_model=CartResponse)
def remove_from_cart(
    product_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Remove a product from cart."""
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id,
    ).first()

    if cart_item:
        db.delete(cart_item)
        db.commit()

    return build_cart_response(current_user.id, db)


@router.delete("", response_model=CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Clear entire cart for the current user."""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return build_cart_response(current_user.id, db)
