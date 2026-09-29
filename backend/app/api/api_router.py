from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.categories import router as categories_router
from app.api.cart import router as cart_router
from app.api.wishlist import router as wishlist_router
from app.api.addresses import router as addresses_router
from app.api.orders import router as orders_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(products_router, prefix="/products", tags=["Products & Reviews"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(cart_router, prefix="/cart", tags=["Shopping Cart"])
api_router.include_router(wishlist_router, prefix="/wishlist", tags=["Wishlist"])
api_router.include_router(addresses_router, prefix="/addresses", tags=["Addresses"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders & Checkout"])
