from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="category_rel", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=True)
    price = Column(String(50), nullable=False)  # Formatted string e.g. "₹2,499"
    original_price = Column(String(50), nullable=True)  # Formatted e.g. "₹4,999"
    discount_percent = Column(Integer, default=0)
    price_value = Column(Float, nullable=False, index=True)  # Numeric value e.g. 2499.0
    category = Column(String(100), index=True, nullable=False)  # Category name string
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    image = Column(String(500), nullable=False)  # Primary image URL
    images = Column(JSON, default=list)  # List of image URLs
    highlights = Column(JSON, default=list)  # List of bullet point highlights
    specs = Column(JSON, default=dict)  # Key-value dictionary of specs
    stock = Column(Integer, default=100)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    category_rel = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=False)
    date = Column(String(100), nullable=True)  # Formatted date string e.g. "24 Sep 2026"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
