from typing import List, Optional
from pydantic import BaseModel
from app.schemas.product import ProductResponse


class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    cart_count: int
    total_price: float
