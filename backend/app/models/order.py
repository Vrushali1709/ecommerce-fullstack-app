from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    date = Column(String(100), nullable=False)  # e.g. "29 Sep 2026, 12:30 PM"
    status = Column(String(50), default="Confirmed", nullable=False)  # Confirmed, Processing, Shipped, Delivered, Cancelled
    subtotal = Column(Float, nullable=False)
    delivery = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)  # Cash on Delivery, UPI, Card
    payment_status = Column(String(50), default="Completed", nullable=False)  # Pending, Completed, Failed
    
    # Customer snapshot at checkout
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_address = Column(String(500), nullable=False)
    customer_city = Column(String(100), nullable=False)
    customer_pincode = Column(String(20), nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    price = Column(String(50), nullable=False)
    category = Column(String(100), nullable=True)
    image = Column(String(500), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="items")
