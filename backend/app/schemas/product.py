from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ReviewBase(BaseModel):
    userName: str
    rating: float = Field(..., ge=1, le=5)
    comment: str
    date: Optional[str] = None


class ReviewCreate(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: str
    userName: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    userName: str
    rating: float
    comment: str
    date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    slug: str
    product_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    price: str
    originalPrice: Optional[str] = None
    discountPercent: Optional[int] = 0
    priceValue: float
    category: str
    rating: Optional[float] = 5.0
    reviewCount: Optional[int] = 0
    description: str
    image: str
    images: Optional[List[str]] = []
    highlights: Optional[List[str]] = []
    specs: Optional[Dict[str, str]] = {}
    stock: Optional[int] = 100
    is_featured: Optional[bool] = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[str] = None
    originalPrice: Optional[str] = None
    discountPercent: Optional[int] = None
    priceValue: Optional[float] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    reviewCount: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    highlights: Optional[List[str]] = None
    specs: Optional[Dict[str, str]] = None
    stock: Optional[int] = None
    is_featured: Optional[bool] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    price: str
    originalPrice: Optional[str] = None
    discountPercent: Optional[int] = 0
    priceValue: float
    category: str
    rating: float
    reviewCount: Optional[int] = 0
    description: str
    image: str
    images: List[str] = []
    highlights: List[str] = []
    specs: Dict[str, str] = {}
    reviews: Optional[List[ReviewResponse]] = []
    stock: Optional[int] = 100
    is_featured: Optional[bool] = False

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int
