import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.database.db import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    business_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    has_onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("BusinessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    advisor_reports = relationship("AdvisorReport", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="user", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    stage = Column(String, nullable=False)  # 'no_idea' | 'idea' | 'business'
    industry = Column(String, nullable=False, default="General")
    interests = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    budget = Column(String, nullable=True)
    location = Column(String, nullable=True)
    available_time = Column(String, nullable=True)
    online_preference = Column(String, nullable=True, default="online")
    solo_preference = Column(String, nullable=True, default="solo")
    investment_capacity = Column(Float, default=0.0)
    current_challenges = Column(JSON, default=list)
    goals = Column(JSON, default=list)
    revenue = Column(Float, default=0.0)
    expenses = Column(Float, default=0.0)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'Business', 'Ideas', 'Goals', etc.
    content = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    related_context = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="memories")


class AdvisorReport(Base):
    __tablename__ = "advisor_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    assessment_score = Column(Integer, nullable=False, default=75)
    explanation = Column(Text, nullable=False)
    target_customer = Column(Text, nullable=False)
    market_opportunity = Column(Text, nullable=False)
    competition = Column(Text, nullable=False)
    revenue_model = Column(Text, nullable=False)
    pricing = Column(Text, nullable=False)
    costs = Column(Text, nullable=False)
    swot = Column(JSON, nullable=False)
    roadmap = Column(JSON, nullable=False)
    risks = Column(JSON, nullable=False)
    next_actions = Column(JSON, nullable=False)
    structured_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="advisor_reports")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'revenue' | 'expense' | 'investment'
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    cost_price = Column(Float, nullable=False, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="in_stock")  # 'in_stock' | 'low_stock' | 'out_of_stock'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="inventory_items")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="milestones")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    due_date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="tasks")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False, default="Strategy Conversation")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    sender = Column(String, nullable=False)  # 'user' | 'assistant'
    text = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
