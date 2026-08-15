from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database.db import get_db
from backend.models.models import User, Transaction, Memory
from backend.schemas.schemas import TransactionSchema, TransactionCreate, FinanceSummarySchema, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.get("/transactions", response_model=StandardResponse)
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).all()
    tx_list = [TransactionSchema.model_validate(t).model_dump() for t in transactions]
    return standard_response(data=tx_list)


@router.get("/summary", response_model=StandardResponse)
def get_finance_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    investment = 0.0
    revenue = 0.0
    expenses = 0.0

    for t in transactions:
        if t.type == "investment":
            investment += t.amount
        elif t.type == "revenue":
            revenue += t.amount
        elif t.type == "expense":
            expenses += t.amount

    profit = revenue - expenses
    summary_data = {
        "investment": investment,
        "revenue": revenue,
        "expenses": expenses,
        "profit": profit
    }
    return standard_response(data=summary_data)


@router.post("/transactions", response_model=StandardResponse)
async def add_transaction(
    req: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = Transaction(
        user_id=current_user.id,
        date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        type=req.type,
        amount=req.amount,
        category=req.category,
        description=req.description
    )
    db.add(tx)

    # Auto log to memory
    mem = Memory(
        user_id=current_user.id,
        title=f"Logged {req.type}: ${req.amount:,.2f}",
        category="Finance",
        content=f"{req.description} ({req.category})",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    db.add(mem)

    db.commit()
    db.refresh(tx)

    tx_dict = TransactionSchema.model_validate(tx).model_dump()

    # Broadcast WebSocket updates
    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="finance.transaction",
        action="created",
        data=tx_dict
    )

    return standard_response(data=tx_dict)
