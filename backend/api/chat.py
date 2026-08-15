from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database.db import get_db
from backend.models.models import User, Conversation, ChatMessage, BusinessProfile, Transaction, Task, Memory
from backend.schemas.schemas import ChatMessageSchema, ChatMessageCreate, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.ai_service import generate_chat_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_or_create_conversation(user_id: str, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).first()
    if not conv:
        conv = Conversation(user_id=user_id, title="Strategy Conversation")
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


@router.get("/messages", response_model=StandardResponse)
def get_chat_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = get_or_create_conversation(current_user.id, db)
    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).order_by(ChatMessage.created_at.asc()).all()
    
    if not messages:
        # Initial greeting if brand new conversation
        profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
        industry = profile.industry if profile else "My Venture"
        initial_msg = ChatMessage(
            conversation_id=conv.id,
            user_id=current_user.id,
            sender="assistant",
            text=f"Greetings. I am reviewing the operational parameters for your business, {industry}. How can I assist with your strategy roadmap, client retentions, or SWOT metrics today?",
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        db.add(initial_msg)
        db.commit()
        messages = [initial_msg]

    msg_list = [ChatMessageSchema.model_validate(m).model_dump() for m in messages]
    return standard_response(data=msg_list)


@router.post("/messages", response_model=StandardResponse)
async def send_chat_message(
    req: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = get_or_create_conversation(current_user.id, db)

    # 1. Store user message
    now_str = datetime.now(timezone.utc).isoformat()
    user_msg = ChatMessage(
        conversation_id=conv.id,
        user_id=current_user.id,
        sender="user",
        text=req.text,
        timestamp=now_str
    )
    db.add(user_msg)
    db.commit()

    # 2. Gather context for AI response
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    industry = profile.industry if profile else "B2B Consultancy"
    goals = profile.goals if (profile and profile.goals) else ["Scale active retainers"]

    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    revenue = sum(t.amount for t in txs if t.type == "revenue")
    expenses = sum(t.amount for t in txs if t.type == "expense")

    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == False).all()
    pending_task_titles = [t.title for t in tasks]

    # 3. Generate AI response
    ai_text = generate_chat_response(req.text, industry, revenue, expenses, goals, pending_task_titles)

    ai_msg = ChatMessage(
        conversation_id=conv.id,
        user_id=current_user.id,
        sender="assistant",
        text=ai_text,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    db.add(ai_msg)

    # 4. Auto-commit conversational pivot to Memory log
    mem = Memory(
        user_id=current_user.id,
        title=f"Strategized: {req.text[:30]}...",
        category="Conversations",
        content=f"Q: \"{req.text}\"\nA: \"{ai_text}\"",
        timestamp=now_str
    )
    db.add(mem)

    db.commit()
    db.refresh(ai_msg)

    ai_msg_dict = ChatMessageSchema.model_validate(ai_msg).model_dump()

    # WebSocket broadcast
    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="chat.message",
        action="created",
        data=ai_msg_dict
    )

    return standard_response(data=ai_msg_dict)
