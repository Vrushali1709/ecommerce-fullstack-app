from typing import List
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.cart import CartItem
from app.schemas.order import (
    OrderResponse,
    OrderCreate,
    OrderUpdateStatus,
    OrderItemSchema,
    CustomerDetailsSchema,
)
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter()


def format_order(o: Order) -> OrderResponse:
    """Format Order model to response schema."""
    return OrderResponse(
        id=o.id,
        order_number=o.order_number,
        date=o.date,
        status=o.status,
        subtotal=o.subtotal,
        delivery=o.delivery,
        total=o.total,
        paymentMethod=o.payment_method,
        payment_status=o.payment_status,
        customer=CustomerDetailsSchema(
            name=o.customer_name,
            phone=o.customer_phone,
            address=o.customer_address,
            city=o.customer_city,
            pincode=o.customer_pincode,
        ),
        items=[
            OrderItemSchema(
                id=item.id,
                product_id=item.product_id,
                name=item.name,
                price=item.price,
                category=item.category,
                image=item.image,
                quantity=item.quantity,
            )
            for item in (o.items or [])
        ],
        created_at=o.created_at,
    )


@router.get("", response_model=List[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all orders placed by the current user."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [format_order(o) for o in orders]


@router.get("/{id}", response_model=OrderResponse)
def get_order(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    """Get order details by order ID or order number."""
    order = db.query(Order).filter((Order.id == id) | (Order.order_number == id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order(order)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    """Create a new order from checkout."""
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Generate unique order number e.g. ORD-2026-9281
    order_num = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    date_formatted = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")

    order = Order(
        order_number=order_num,
        user_id=current_user.id if current_user else None,
        date=date_formatted,
        status="Confirmed",
        subtotal=order_in.subtotal,
        delivery=order_in.delivery,
        total=order_in.total,
        payment_method=order_in.paymentMethod,
        payment_status="Completed" if order_in.paymentMethod != "Cash on Delivery" else "Pending",
        customer_name=order_in.customer.name,
        customer_phone=order_in.customer.phone,
        customer_address=order_in.customer.address,
        customer_city=order_in.customer.city,
        customer_pincode=order_in.customer.pincode,
    )
    db.add(order)
    db.flush()

    for item in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            name=item.name,
            price=item.price,
            category=item.category,
            image=item.image,
            quantity=item.quantity,
        )
        db.add(order_item)

    # If logged in user, clear user's cart in DB
    if current_user:
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    db.commit()
    db.refresh(order)
    return format_order(order)


@router.patch("/{id}/status", response_model=OrderResponse)
def update_order_status(
    id: str,
    status_in: OrderUpdateStatus,
    db: Session = Depends(get_db),
):
    """Update order status or payment status."""
    order = db.query(Order).filter((Order.id == id) | (Order.order_number == id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_in.status
    if status_in.payment_status:
        order.payment_status = status_in.payment_status

    db.add(order)
    db.commit()
    db.refresh(order)
    return format_order(order)
