from typing import List
from pydantic import BaseModel
from app.schemas.product import ProductResponse


class WishlistToggle(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    product_id: str
    product: ProductResponse

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    items: List[ProductResponse]
    count: int
