from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.address import Address
from app.schemas.address import AddressResponse, AddressCreate, AddressUpdate
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[AddressResponse])
def get_addresses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all saved shipping addresses for current user."""
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def add_address(
    addr_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Add a new delivery address."""
    user_addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    
    is_default = addr_in.is_default or len(user_addresses) == 0
    if is_default:
        for a in user_addresses:
            a.is_default = False
            db.add(a)

    address = Address(
        user_id=current_user.id,
        full_name=addr_in.full_name,
        phone=addr_in.phone,
        address=addr_in.address,
        city=addr_in.city,
        state=addr_in.state,
        pincode=addr_in.pincode,
        is_default=is_default,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/{id}", response_model=AddressResponse)
def update_address(
    id: str,
    addr_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update an existing address."""
    address = db.query(Address).filter(Address.id == id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    if addr_in.full_name is not None:
        address.full_name = addr_in.full_name
    if addr_in.phone is not None:
        address.phone = addr_in.phone
    if addr_in.address is not None:
        address.address = addr_in.address
    if addr_in.city is not None:
        address.city = addr_in.city
    if addr_in.state is not None:
        address.state = addr_in.state
    if addr_in.pincode is not None:
        address.pincode = addr_in.pincode

    if addr_in.is_default is not None:
        if addr_in.is_default:
            other_addrs = db.query(Address).filter(Address.user_id == current_user.id, Address.id != id).all()
            for a in other_addrs:
                a.is_default = False
                db.add(a)
        address.is_default = addr_in.is_default

    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{id}")
def delete_address(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete an address."""
    address = db.query(Address).filter(Address.id == id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    was_default = address.is_default
    db.delete(address)
    db.commit()

    if was_default:
        next_addr = db.query(Address).filter(Address.user_id == current_user.id).first()
        if next_addr:
            next_addr.is_default = True
            db.add(next_addr)
            db.commit()

    return {"message": "Address deleted successfully"}


@router.patch("/{id}/default", response_model=AddressResponse)
def set_default_address(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Set an address as default."""
    target_addr = db.query(Address).filter(Address.id == id, Address.user_id == current_user.id).first()
    if not target_addr:
        raise HTTPException(status_code=404, detail="Address not found")

    all_addrs = db.query(Address).filter(Address.user_id == current_user.id).all()
    for a in all_addrs:
        a.is_default = (a.id == id)
        db.add(a)

    db.commit()
    db.refresh(target_addr)
    return target_addr
