from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User, BusinessProfile, Memory, Transaction, InventoryItem, Milestone, Task
from backend.schemas.schemas import SignupRequest, LoginRequest, Token, UserResponse, StandardResponse
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.core.dependencies import get_current_user, standard_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=StandardResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        return standard_response(
            success=False,
            error={"code": "USER_EXISTS", "message": "A user with this email address already exists."}
        )

    user = User(
        email=req.email,
        name=req.name,
        business_name=req.businessName,
        hashed_password=get_password_hash(req.password or "defaultpassword123"),
        has_onboarded=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    user_resp = UserResponse.model_validate(user).model_dump()

    return standard_response(data={
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": user_resp
    })


@router.post("/login", response_model=StandardResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if not req.email:
        return standard_response(
            success=False,
            error={"code": "INVALID_INPUT", "message": "Email is required."}
        )

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Auto create demo user if email is supplied to prevent blocking demo
        user = User(
            email=req.email,
            name=req.email.split("@")[0],
            business_name="Altora Ventures",
            hashed_password=get_password_hash("demo123"),
            has_onboarded=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Set default business profile
        profile = BusinessProfile(
            user_id=user.id,
            stage="business",
            industry="Strategic Brand Consultancy",
            revenue=4800.0,
            expenses=1850.0,
            goals=["Scale to 5 active retainers", "Launch digital courses"],
            current_challenges=["Client acquisition scaling", "Time management"],
            details="Altora Consulting is an agency focused on strategy, branding, and operations design for high-growth tech founders."
        )
        db.add(profile)

        # Set default seed items for new user
        default_mems = [
            Memory(user_id=user.id, title="Business Established", category="Business", content="Officially launched operations for Altora strategy and branding advisory.", timestamp="2026-08-01T10:00:00Z"),
            Memory(user_id=user.id, title="Advisory Session on Market Positioning", category="Advisor Reports", content="Determined target audience should skew premium luxury businesses willing to pay retainer model.", timestamp="2026-08-05T14:30:00Z", related_context="Advisor Report #1"),
            Memory(user_id=user.id, title="Initial Capital Injection", category="Finance", content="Transferred $25,000 founder investment for operating capital.", timestamp="2026-08-02T09:00:00Z")
        ]
        db.add_all(default_mems)

        default_txs = [
            Transaction(user_id=user.id, date="2026-08-02", type="investment", amount=25000, category="Equity", description="Founder Initial Capital"),
            Transaction(user_id=user.id, date="2026-08-05", type="expense", amount=1200, category="Software", description="Development Tools & Hosting"),
            Transaction(user_id=user.id, date="2026-08-10", type="revenue", amount=4800, category="Consulting", description="Verdant Craft Brand Strategy Phase 1"),
            Transaction(user_id=user.id, date="2026-08-12", type="expense", amount=650, category="Marketing", description="Premium Business Cards & Copywriting")
        ]
        db.add_all(default_txs)

        default_inv = [
            InventoryItem(user_id=user.id, name="Premium Strategy Workbook (Print)", quantity=45, cost_price=15, selling_price=45, status="in_stock"),
            InventoryItem(user_id=user.id, name="Brand Positioning Cards Deck", quantity=8, cost_price=8, selling_price=25, status="low_stock"),
            InventoryItem(user_id=user.id, name="Digital Toolkit License (Annual)", quantity=150, cost_price=0, selling_price=99, status="in_stock"),
            InventoryItem(user_id=user.id, name="Printed Workshop Guidebook", quantity=0, cost_price=12, selling_price=35, status="out_of_stock")
        ]
        db.add_all(default_inv)

        default_ms = [
            Milestone(user_id=user.id, title="Business Structure Setup", description="Registered business name and established brand positioning blueprint.", date="2026-08-01", completed=True),
            Milestone(user_id=user.id, title="First Consulting Sale", description="Secured first retainer client for strategy consulting.", date="2026-08-10", completed=True),
            Milestone(user_id=user.id, title="Launch Strategic Website", description="Deploy main digital portal and strategy inquiry dashboard.", date="2026-08-25", completed=False)
        ]
        db.add_all(default_ms)

        default_tsks = [
            Task(user_id=user.id, title="Refine value proposition presentation", completed=True, due_date="2026-08-14"),
            Task(user_id=user.id, title="Finalize pricing packages for strategy clients", completed=False, due_date="2026-08-18"),
            Task(user_id=user.id, title="Send retainer agreement to Verdant Craft", completed=False, due_date="2026-08-15"),
            Task(user_id=user.id, title="Publish editorial article on founder OS", completed=False, due_date="2026-08-22")
        ]
        db.add_all(default_tsks)
        db.commit()

    token = create_access_token(user.id)
    user_resp = UserResponse.model_validate(user).model_dump()

    return standard_response(data={
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": user_resp
    })


@router.get("/me", response_model=StandardResponse)
def get_me(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse.model_validate(current_user).model_dump()
    return standard_response(data=user_resp)


@router.get("/test", response_model=StandardResponse)
def test_auth():
    return standard_response(data={"message": "Authentication router healthy."})
