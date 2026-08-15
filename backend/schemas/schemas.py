from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_serializer
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class StandardResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None


# Auth & User Schemas
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    businessName: Optional[str] = Field(default=None, validation_alias="business_name")
    hasOnboarded: bool = Field(default=False, validation_alias="has_onboarded")

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SignupRequest(BaseModel):
    email: EmailStr
    name: str
    businessName: Optional[str] = None
    password: Optional[str] = "defaultpassword123"


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = ""


# Business Profile Schemas
class BusinessProfileSchema(BaseModel):
    stage: str
    industry: str = "General"
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    budget: Optional[str] = None
    location: Optional[str] = None
    availableTime: Optional[str] = Field(default=None, validation_alias="available_time")
    onlinePreference: Optional[str] = Field(default="online", validation_alias="online_preference")
    soloPreference: Optional[str] = Field(default="solo", validation_alias="solo_preference")
    investmentCapacity: Optional[float] = Field(default=0.0, validation_alias="investment_capacity")
    currentChallenges: Optional[List[str]] = Field(default=[], validation_alias="current_challenges")
    goals: Optional[List[str]] = []
    revenue: Optional[float] = 0.0
    expenses: Optional[float] = 0.0
    details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Memory Schemas
class MemorySchema(BaseModel):
    id: str
    title: str
    category: str
    content: str
    timestamp: str
    relatedContext: Optional[str] = Field(default=None, validation_alias="related_context")

    model_config = ConfigDict(from_attributes=True)


class MemoryCreate(BaseModel):
    category: str
    title: str
    content: str
    relatedContext: Optional[str] = Field(default=None, validation_alias="related_context")


# Advisor Schemas
class SWOTSchema(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]


class RoadmapPhase(BaseModel):
    phase: str
    title: str
    tasks: List[str]


class RiskItem(BaseModel):
    risk: str
    impact: str
    mitigation: str


class AdvisorReportSchema(BaseModel):
    id: str
    createdAt: Union[str, datetime] = Field(validation_alias="created_at")
    title: str
    assessmentScore: int = Field(validation_alias="assessment_score")
    explanation: str
    targetCustomer: str = Field(validation_alias="target_customer")
    marketOpportunity: str = Field(validation_alias="market_opportunity")
    competition: str
    revenueModel: str = Field(validation_alias="revenue_model")
    pricing: str
    costs: str
    swot: SWOTSchema
    roadmap: List[RoadmapPhase]
    risks: List[RiskItem]
    nextActions: List[str] = Field(validation_alias="next_actions")
    structuredData: Optional[Any] = Field(default=None, validation_alias="structured_data")

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('createdAt')
    def serialize_created_at(self, created_at: Union[str, datetime], _info):
        if isinstance(created_at, datetime):
            return created_at.isoformat()
        return str(created_at)


# Finance Schemas
class TransactionSchema(BaseModel):
    id: str
    date: str
    type: str  # 'revenue' | 'expense' | 'investment'
    amount: float
    category: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class TransactionCreate(BaseModel):
    amount: float
    type: str
    category: str
    description: str


class FinanceSummarySchema(BaseModel):
    investment: float
    revenue: float
    expenses: float
    profit: float


# Inventory Schemas
class InventoryItemSchema(BaseModel):
    id: str
    name: str
    quantity: int
    costPrice: float = Field(validation_alias="cost_price")
    sellingPrice: float = Field(validation_alias="selling_price")
    status: str

    model_config = ConfigDict(from_attributes=True)


class InventoryItemCreate(BaseModel):
    name: str
    quantity: int
    costPrice: float
    sellingPrice: float


class InventoryStockUpdate(BaseModel):
    newQuantity: int


# Milestone Schemas
class MilestoneSchema(BaseModel):
    id: str
    title: str
    description: str
    date: str
    completed: bool

    model_config = ConfigDict(from_attributes=True)


class MilestoneCreate(BaseModel):
    title: str
    description: str
    date: str


# Task Schemas
class TaskSchema(BaseModel):
    id: str
    title: str
    completed: bool
    dueDate: str = Field(validation_alias="due_date")

    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str
    dueDate: str = Field(validation_alias="due_date")


# Chat & Conversation Schemas
class ChatMessageSchema(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


class ChatMessageCreate(BaseModel):
    text: str
    conversationId: Optional[str] = None
