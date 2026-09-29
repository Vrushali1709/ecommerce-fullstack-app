from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class OrderItemSchema(BaseModel):
    id: Optional[str] = None
    product_id: Optional[str] = None
    name: str
    price: str
    category: Optional[str] = None
    image: str
    quantity: int

    class Config:
        from_attributes = True


class CustomerDetailsSchema(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    pincode: str


class OrderCreate(BaseModel):
    items: List[OrderItemSchema]
    customer: CustomerDetailsSchema
    subtotal: float
    delivery: float = 0.0
    total: float
    paymentMethod: str  # Cash on Delivery, UPI, Card


class OrderUpdateStatus(BaseModel):
    status: str
    payment_status: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: str
    date: str
    status: str
    subtotal: float
    delivery: float
    total: float
    paymentMethod: str
    payment_status: str
    customer: CustomerDetailsSchema
    items: List[OrderItemSchema]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
