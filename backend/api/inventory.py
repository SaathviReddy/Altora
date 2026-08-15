from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database.db import get_db
from backend.models.models import User, InventoryItem, Memory
from backend.schemas.schemas import InventoryItemSchema, InventoryItemCreate, InventoryStockUpdate, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=StandardResponse)
def get_inventory_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(InventoryItem).filter(InventoryItem.user_id == current_user.id).order_by(InventoryItem.created_at.desc()).all()
    item_list = [InventoryItemSchema.model_validate(i).model_dump() for i in items]
    return standard_response(data=item_list)


@router.post("", response_model=StandardResponse)
async def add_inventory_item(
    req: InventoryItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    status_str = "out_of_stock" if req.quantity == 0 else "low_stock" if req.quantity <= 10 else "in_stock"
    item = InventoryItem(
        user_id=current_user.id,
        name=req.name,
        quantity=req.quantity,
        cost_price=req.costPrice,
        selling_price=req.sellingPrice,
        status=status_str
    )
    db.add(item)

    # Auto log memory
    mem = Memory(
        user_id=current_user.id,
        title=f"Added Stock Item: {req.name}",
        category="Tasks",
        content=f"Registered {req.quantity} units at selling price ${req.sellingPrice}.",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    db.add(mem)

    db.commit()
    db.refresh(item)

    item_dict = InventoryItemSchema.model_validate(item).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="inventory",
        action="created",
        data=item_dict
    )

    return standard_response(data=item_dict)


@router.patch("/{item_id}/stock", response_model=StandardResponse)
async def update_stock(
    item_id: str,
    req: InventoryStockUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id, InventoryItem.user_id == current_user.id).first()
    if not item:
        return standard_response(
            success=False,
            error={"code": "NOT_FOUND", "message": "Item not found."}
        )

    item.quantity = max(0, req.newQuantity)
    item.status = "out_of_stock" if item.quantity == 0 else "low_stock" if item.quantity <= 10 else "in_stock"
    db.commit()
    db.refresh(item)

    item_dict = InventoryItemSchema.model_validate(item).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="inventory",
        action="updated",
        data=item_dict
    )

    return standard_response(data=item_dict)
