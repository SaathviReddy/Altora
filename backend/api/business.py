from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User, BusinessProfile, AdvisorReport
from backend.schemas.schemas import BusinessProfileSchema, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.ai_service import generate_advisor_report
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/business", tags=["Business Profile"])

@router.get("/profile", response_model=StandardResponse)
def get_business_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        return standard_response(data=None)
    
    prof_dict = BusinessProfileSchema.model_validate(profile).model_dump()
    return standard_response(data=prof_dict)


@router.post("/onboarding", response_model=StandardResponse)
async def save_onboarding_profile(
    req: BusinessProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.has_onboarded = True
    if req.stage == "business" and not current_user.business_name:
        current_user.business_name = "My Consulting Firm"

    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(
            user_id=current_user.id,
            stage=req.stage,
            industry=req.industry or "General",
            interests=req.interests or [],
            skills=req.skills or [],
            budget=req.budget,
            location=req.location,
            available_time=req.availableTime,
            online_preference=req.onlinePreference or "online",
            solo_preference=req.soloPreference or "solo",
            investment_capacity=req.investmentCapacity or 0.0,
            current_challenges=req.currentChallenges or [],
            goals=req.goals or [],
            revenue=req.revenue or 0.0,
            expenses=req.expenses or 0.0,
            details=req.details
        )
        db.add(profile)
    else:
        profile.stage = req.stage
        profile.industry = req.industry or profile.industry
        profile.interests = req.interests if req.interests is not None else profile.interests
        profile.skills = req.skills if req.skills is not None else profile.skills
        profile.budget = req.budget or profile.budget
        profile.location = req.location or profile.location
        profile.available_time = req.availableTime or profile.available_time
        profile.online_preference = req.onlinePreference or profile.online_preference
        profile.solo_preference = req.soloPreference or profile.solo_preference
        profile.investment_capacity = req.investmentCapacity if req.investmentCapacity is not None else profile.investment_capacity
        profile.current_challenges = req.currentChallenges if req.currentChallenges is not None else profile.current_challenges
        profile.goals = req.goals if req.goals is not None else profile.goals
        profile.revenue = req.revenue if req.revenue is not None else profile.revenue
        profile.expenses = req.expenses if req.expenses is not None else profile.expenses
        profile.details = req.details or profile.details

    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    # Generate initial advisor report if none exists
    existing_reports = db.query(AdvisorReport).filter(AdvisorReport.user_id == current_user.id).count()
    if existing_reports == 0:
        rep_dict = generate_advisor_report(req.model_dump())
        report = AdvisorReport(
            id=rep_dict["id"],
            user_id=current_user.id,
            title=rep_dict["title"],
            assessment_score=rep_dict["assessment_score"],
            explanation=rep_dict["explanation"],
            target_customer=rep_dict["target_customer"],
            market_opportunity=rep_dict["market_opportunity"],
            competition=rep_dict["competition"],
            revenue_model=rep_dict["revenue_model"],
            pricing=rep_dict["pricing"],
            costs=rep_dict["costs"],
            swot=rep_dict["swot"],
            roadmap=rep_dict["roadmap"],
            risks=rep_dict["risks"],
            next_actions=rep_dict["next_actions"]
        )
        db.add(report)
        db.commit()

    prof_dict = BusinessProfileSchema.model_validate(profile).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="dashboard",
        action="updated",
        data=prof_dict
    )

    return standard_response(data=prof_dict)


@router.put("/profile", response_model=StandardResponse)
async def update_profile(
    req: BusinessProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=current_user.id, stage=req.stage, industry=req.industry)
        db.add(profile)

    if req.industry is not None:
        profile.industry = req.industry
    if req.details is not None:
        profile.details = req.details
    if req.goals is not None:
        profile.goals = req.goals
    if req.revenue is not None:
        profile.revenue = req.revenue
    if req.expenses is not None:
        profile.expenses = req.expenses

    db.commit()
    db.refresh(profile)

    prof_dict = BusinessProfileSchema.model_validate(profile).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="dashboard",
        action="updated",
        data=prof_dict
    )

    return standard_response(data=prof_dict)
