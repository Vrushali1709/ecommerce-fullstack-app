import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.product import Category, Product, Review
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.core.security import get_password_hash

# Create tables if not already created
Base.metadata.create_all(bind=engine)

CATEGORIES_DATA = [
    {"name": "Watches", "slug": "watches", "description": "Premium luxury and chronograph timepieces", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"},
    {"name": "Bags", "slug": "bags", "description": "Handcrafted leather backpacks, totes, and crossbodies", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"},
    {"name": "Shoes", "slug": "shoes", "description": "High performance running and lifestyle sneakers", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"},
    {"name": "Electronics", "slug": "electronics", "description": "Audio, headphones, and modern acoustics", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"},
    {"name": "Smart Gadgets", "slug": "smart-gadgets", "description": "Smart wearables, fitness bands, and AMOLED watches", "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600"},
    {"name": "Accessories", "slug": "accessories", "description": "RFID wallets, sunglasses, and leather belts", "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"},
]

PRODUCTS_DATA = [
    {
        "id": "1",
        "name": "Classic Chronograph Watch",
        "price": "₹2,499",
        "original_price": "₹4,999",
        "discount_percent": 50,
        "price_value": 2499.0,
        "category": "Watches",
        "rating": 4.8,
        "review_count": 142,
        "is_featured": True,
        "stock": 45,
        "description": "A timeless classic chronograph watch engineered with sapphire crystal glass, Japanese quartz movement, and premium stainless steel finish. Perfect for formal, business, and everyday luxury.",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000",
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000"
        ],
        "highlights": [
            "Japanese Quartz Chronograph Movement",
            "Water Resistant up to 50 Meters (5 ATM)",
            "Scratch-resistant Sapphire Glass Dial",
            "Interchangeable Genuine Leather Strap"
        ],
        "specs": {
            "Brand": "Aethel Luxury",
            "DialDiameter": "42 mm",
            "StrapMaterial": "Genuine Leather",
            "WaterResistance": "50m",
            "Warranty": "2 Years Manufacturer Warranty"
        },
        "reviews": [
            {
                "userName": "Aarav Patel",
                "rating": 5.0,
                "comment": "Outstanding quality and weight. Looks even better in real life than pictures!",
                "date": "24 Sep 2026"
            },
            {
                "userName": "Priya Sharma",
                "rating": 4.5,
                "comment": "Gifted this to my husband and he absolutely loves the finish.",
                "date": "18 Sep 2026"
            }
        ]
    },
    {
        "id": "2",
        "name": "Minimalist Leather Tote Bag",
        "price": "₹3,999",
        "original_price": "₹6,499",
        "discount_percent": 38,
        "price_value": 3999.0,
        "category": "Bags",
        "rating": 4.7,
        "review_count": 98,
        "is_featured": True,
        "stock": 30,
        "description": "Handcrafted full-grain leather tote designed with spacious interior compartments, padded 15-inch laptop sleeve, and sleek magnetic brass closures.",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000"
        ],
        "highlights": [
            "100% Genuine Full-Grain Calfskin Leather",
            "Fits up to 15.6-inch MacBook / Laptops",
            "Water-repellent interior lining with organizers",
            "Reinforced shoulder straps for comfortable carry"
        ],
        "specs": {
            "Brand": "Nordic Craft",
            "Dimensions": "38 x 30 x 14 cm",
            "Compartments": "4 Pockets + Laptop Sleeve",
            "Closure": "YKK Premium Metal Zippers",
            "Warranty": "1 Year Warranty"
        },
        "reviews": [
            {
                "userName": "Neha Mehta",
                "rating": 5.0,
                "comment": "Spacious and elegant. Carries my laptop and daily essentials effortlessly.",
                "date": "15 Sep 2026"
            }
        ]
    },
    {
        "id": "3",
        "name": "Pro Ultralight Running Shoes",
        "price": "₹4,499",
        "original_price": "₹7,999",
        "discount_percent": 44,
        "price_value": 4499.0,
        "category": "Shoes",
        "rating": 4.9,
        "review_count": 215,
        "is_featured": True,
        "stock": 60,
        "description": "Engineered for maximum energy return and breathability. Features responsive foam cushioning, breathable knit upper, and anti-slip rubber traction.",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000"
        ],
        "highlights": [
            "Responsive ReactFoam Sole Cushioning",
            "Seamless Breathable FlyKnit Upper Mesh",
            "High-durability Carbon Rubber Outsole",
            "Ultralightweight build (only 210g)"
        ],
        "specs": {
            "Brand": "AeroStride",
            "Weight": "210g (Size 9)",
            "SoleMaterial": "High-Grip Carbon Rubber",
            "Terrain": "Road, Gym & Track",
            "Warranty": "6 Months Replacement Guarantee"
        },
        "reviews": [
            {
                "userName": "Rohan Joshi",
                "rating": 5.0,
                "comment": "Feels like walking on clouds! Best shoes for running and workouts.",
                "date": "22 Sep 2026"
            }
        ]
    },
    {
        "id": "4",
        "name": "Wireless ANC Headphones",
        "price": "₹2,999",
        "original_price": "₹5,999",
        "discount_percent": 50,
        "price_value": 2999.0,
        "category": "Electronics",
        "rating": 4.8,
        "review_count": 180,
        "is_featured": True,
        "stock": 50,
        "description": "Immerse yourself in studio-grade audio with hybrid Active Noise Cancellation, 40-hour battery life, and ultra-soft memory foam earcups.",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000"
        ],
        "highlights": [
            "Hybrid Active Noise Cancellation (-35dB)",
            "Up to 40 Hours Playtime on Single Charge",
            "Fast Type-C Charging (10 mins = 4 hours)",
            "Dual Device Bluetooth 5.3 Multipoint Pairing"
        ],
        "specs": {
            "Brand": "SoundVibe",
            "Bluetooth": "v5.3 with AAC/aptX Codec",
            "BatteryLife": "40 Hours (ANC Off), 30 Hours (ANC On)",
            "DriverSize": "40mm Custom Titanium Drivers",
            "Warranty": "1 Year Brand Warranty"
        },
        "reviews": [
            {
                "userName": "Ananya Roy",
                "rating": 5.0,
                "comment": "Noise cancellation is incredible for this price. Battery lasts for days!",
                "date": "10 Sep 2026"
            }
        ]
    },
    {
        "id": "5",
        "name": "OLED Smart Fitness Watch",
        "price": "₹5,999",
        "original_price": "₹9,999",
        "discount_percent": 40,
        "price_value": 5999.0,
        "category": "Smart Gadgets",
        "rating": 4.6,
        "review_count": 85,
        "is_featured": False,
        "stock": 35,
        "description": "1.43-inch Always-on AMOLED display with heart rate, SpO2, sleep tracking, Bluetooth calling, and over 100 sports workout modes.",
        "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000"
        ],
        "highlights": [
            "1.43” Ultra-Bright AMOLED Always-On Display",
            "24/7 Heart Rate, SpO2 & Sleep Tracker",
            "Crystal Clear Bluetooth Phone Calling",
            "IP68 Dust & Water Proof Rating"
        ],
        "specs": {
            "Brand": "PulseTech",
            "Display": "1.43 inch AMOLED 466x466 px",
            "Battery": "Up to 7 Days Normal Use",
            "Sensors": "PPG Heart Rate, 3-Axis Gyro, SpO2",
            "Warranty": "1 Year Warranty"
        },
        "reviews": [
            {
                "userName": "Vikram S.",
                "rating": 4.5,
                "comment": "Crisp display and accurate step tracking. Calling works seamlessly.",
                "date": "20 Sep 2026"
            }
        ]
    },
    {
        "id": "6",
        "name": "Slim RFID Leather Wallet",
        "price": "₹1,499",
        "original_price": "₹2,499",
        "discount_percent": 40,
        "price_value": 1499.0,
        "category": "Accessories",
        "rating": 4.5,
        "review_count": 64,
        "is_featured": False,
        "stock": 80,
        "description": "Ultra-thin genuine leather bifold wallet with built-in RFID blocking technology to safeguard your cards and credentials.",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000",
        "images": [
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000",
            "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=1000"
        ],
        "highlights": [
            "Certified RFID Blocking Technology",
            "Holds up to 8 Cards + Full-length Cash Slot",
            "Slim profile fits comfortably in front pockets",
            "Handcrafted with top-grain distressed leather"
        ],
        "specs": {
            "Brand": "UrbanHide",
            "Material": "Top-grain Distressed Leather",
            "Capacity": "8 Cards + ID Window + Cash",
            "Dimensions": "11 x 8.5 x 1.2 cm",
            "Warranty": "1 Year Warranty"
        },
        "reviews": [
            {
                "userName": "Suresh Rao",
                "rating": 4.5,
                "comment": "Very slim and fits easily in front pocket without bulk.",
                "date": "05 Sep 2026"
            }
        ]
    }
]


def seed():
    db = SessionLocal()
    print("Starting database seeding in PostgreSQL...")
    try:
        # 1. Seed Users
        users_seed = [
            {"name": "Demo User", "email": "user@example.com", "password": "password123", "phone": "+91 9876543210", "is_admin": False},
            {"name": "Vrushali Patel", "email": "vrushali@example.com", "password": "password123", "phone": "+91 9988776655", "is_admin": False},
            {"name": "Admin", "email": "admin@example.com", "password": "admin123", "phone": "+91 9000000000", "is_admin": True},
        ]

        user_map = {}
        for u in users_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    name=u["name"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    phone=u["phone"],
                    is_admin=u["is_admin"],
                    is_active=True,
                )
                db.add(new_user)
                db.flush()
                user_map[u["email"]] = new_user
                print(f"Created user: {u['email']} (Password: {u['password']})")
            else:
                user_map[u["email"]] = existing

        # 2. Seed Categories
        cat_map = {}
        for c in CATEGORIES_DATA:
            existing = db.query(Category).filter(Category.name == c["name"]).first()
            if not existing:
                new_cat = Category(
                    name=c["name"],
                    slug=c["slug"],
                    description=c["description"],
                    image=c["image"],
                )
                db.add(new_cat)
                db.flush()
                cat_map[c["name"]] = new_cat
                print(f"Created category: {c['name']}")
            else:
                cat_map[c["name"]] = existing

        # 3. Seed Products & Reviews
        for p in PRODUCTS_DATA:
            existing = db.query(Product).filter(Product.id == p["id"]).first()
            category_obj = cat_map.get(p["category"])
            cat_id = category_obj.id if category_obj else None

            if not existing:
                new_prod = Product(
                    id=p["id"],
                    name=p["name"],
                    price=p["price"],
                    original_price=p.get("original_price"),
                    discount_percent=p.get("discount_percent", 0),
                    price_value=p["price_value"],
                    category=p["category"],
                    category_id=cat_id,
                    rating=p.get("rating", 5.0),
                    review_count=p.get("review_count", 0),
                    description=p["description"],
                    image=p["image"],
                    images=p.get("images", []),
                    highlights=p.get("highlights", []),
                    specs=p.get("specs", {}),
                    stock=p.get("stock", 50),
                    is_featured=p.get("is_featured", False),
                    is_active=True,
                )
                db.add(new_prod)
                db.flush()

                # Add reviews
                for r in p.get("reviews", []):
                    review = Review(
                        product_id=new_prod.id,
                        user_name=r["userName"],
                        rating=r["rating"],
                        comment=r["comment"],
                        date=r["date"],
                    )
                    db.add(review)

                print(f"Created product: {p['name']} ({p['category']})")

        # 4. Seed Addresses for Demo User
        demo_user = user_map.get("vrushali@example.com") or user_map.get("user@example.com")
        if demo_user:
            existing_addr = db.query(Address).filter(Address.user_id == demo_user.id).first()
            if not existing_addr:
                addr1 = Address(
                    user_id=demo_user.id,
                    full_name=demo_user.name,
                    phone=demo_user.phone or "+91 9876543210",
                    address="402, Green Orchid Heights, S.G. Highway",
                    city="Ahmedabad",
                    state="Gujarat",
                    pincode="380054",
                    is_default=True,
                )
                addr2 = Address(
                    user_id=demo_user.id,
                    full_name=demo_user.name,
                    phone=demo_user.phone or "+91 9876543210",
                    address="B-12, Titanium City Centre, Prahlad Nagar",
                    city="Ahmedabad",
                    state="Gujarat",
                    pincode="380015",
                    is_default=False,
                )
                db.add(addr1)
                db.add(addr2)
                print(f"Created sample addresses for {demo_user.email}")

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}", file=sys.stderr)
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
