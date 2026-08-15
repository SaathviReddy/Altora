import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database.db import get_db
from backend.models.models import User, BusinessProfile, AdvisorReport, Memory
from backend.schemas.schemas import AdvisorReportSchema, MemorySchema, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.ai_service import generate_advisor_report, generate_query_advisor_response_async
from backend.services.pdf_service import build_advisor_pdf
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/advisor", tags=["Advisor"])

PDF_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "pdf"))

class QueryRequest(BaseModel):
    query: str

@router.get("/reports", response_model=StandardResponse)
def get_advisor_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(AdvisorReport).filter(AdvisorReport.user_id == current_user.id).order_by(AdvisorReport.created_at.desc()).all()
    rep_list = []
    for r in reports:
        d = AdvisorReportSchema.model_validate(r).model_dump()
        d["pdfUrl"] = f"/api/v1/advisor/reports/{r.id}/pdf"
        rep_list.append(d)
    return standard_response(data=rep_list)


@router.post("/report", response_model=StandardResponse)
@router.post("/query", response_model=StandardResponse)
async def generate_advisor_report_pdf_flow(
    req: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_text = req.query.strip()
    if not query_text:
        return standard_response(success=False, error={"code": "INVALID_QUERY", "message": "Query cannot be empty."})

    # WebSocket Real-Time Generation Tracking
    await manager.broadcast_event(current_user.id, "advisor", "report.started", {"query": query_text})

    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    prof_dict = {}
    if profile:
        prof_dict = {
            "stage": profile.stage,
            "industry": profile.industry,
            "goals": profile.goals,
            "details": profile.details
        }
    else:
        prof_dict = {"stage": "business", "industry": "Strategic Consultancy"}

    await manager.broadcast_event(current_user.id, "advisor", "report.generating", {"query": query_text})

    # AI Report Generation
    rep_dict = await generate_query_advisor_response_async(query_text, prof_dict)

    report = AdvisorReport(
        id=rep_dict["id"],
        user_id=current_user.id,
        title=rep_dict["title"],
        assessment_score=rep_dict.get("score", rep_dict.get("assessment_score", 80)),
        explanation=rep_dict.get("executive_advice", rep_dict.get("explanation", "")),
        target_customer=rep_dict.get("target_customer", ""),
        market_opportunity=rep_dict.get("market_opportunity", ""),
        competition=rep_dict.get("competition", ""),
        revenue_model=rep_dict.get("revenue_model", ""),
        pricing=rep_dict.get("pricing", ""),
        costs=rep_dict.get("costs", ""),
        swot=rep_dict.get("swot", {}),
        roadmap=rep_dict.get("roadmap", []),
        risks=rep_dict.get("risks", []),
        next_actions=rep_dict.get("next_actions", []),
        structured_data=rep_dict
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # PDF Generation
    await manager.broadcast_event(current_user.id, "advisor", "pdf.generating", {"report_id": report.id})

    pdf_filename = f"report_{report.id}.pdf"
    pdf_path = os.path.join(PDF_STORAGE_DIR, pdf_filename)
    build_advisor_pdf(rep_dict, pdf_path)

    await manager.broadcast_event(current_user.id, "advisor", "pdf.ready", {
        "report_id": report.id,
        "pdf_url": f"/api/v1/advisor/reports/{report.id}/pdf"
    })

    output = AdvisorReportSchema.model_validate(report).model_dump()
    output["pdfUrl"] = f"/api/v1/advisor/reports/{report.id}/pdf"

    return standard_response(data=output)


@router.post("/generate", response_model=StandardResponse)
async def generate_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    prof_dict = {}
    if profile:
        prof_dict = {
            "stage": profile.stage,
            "industry": profile.industry,
            "goals": profile.goals,
            "details": profile.details
        }
    else:
        prof_dict = {"stage": "business", "industry": "Strategic Consultancy"}

    rep_dict = generate_advisor_report(prof_dict)
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
        next_actions=rep_dict["next_actions"],
        structured_data=rep_dict
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    pdf_path = os.path.join(PDF_STORAGE_DIR, f"report_{report.id}.pdf")
    build_advisor_pdf(rep_dict, pdf_path)

    output = AdvisorReportSchema.model_validate(report).model_dump()
    output["pdfUrl"] = f"/api/v1/advisor/reports/{report.id}/pdf"

    return standard_response(data=output)


@router.get("/reports/{report_id}/pdf")
def download_or_preview_pdf(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(AdvisorReport).filter(AdvisorReport.id == report_id, AdvisorReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_filename = f"report_{report.id}.pdf"
    pdf_path = os.path.join(PDF_STORAGE_DIR, pdf_filename)

    if not os.path.exists(pdf_path):
        # Build PDF dynamically if not stored
        rep_dict = report.structured_data or {
            "title": report.title,
            "assessment_score": report.assessment_score,
            "explanation": report.explanation,
            "target_customer": report.target_customer,
            "market_opportunity": report.market_opportunity,
            "competition": report.competition,
            "revenue_model": report.revenue_model,
            "pricing": report.pricing,
            "costs": report.costs,
            "swot": report.swot,
            "roadmap": report.roadmap,
            "risks": report.risks,
            "next_actions": report.next_actions
        }
        build_advisor_pdf(rep_dict, pdf_path)

    import re
    safe_title = re.sub(r'[^a-zA-Z0-9_]', '_', report.title)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=Altora_AI_Advisor_{safe_title}.pdf"
        }
    )


@router.post("/reports/{report_id}/save-to-memory", response_model=StandardResponse)
async def save_report_to_memory(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(AdvisorReport).filter(AdvisorReport.id == report_id, AdvisorReport.user_id == current_user.id).first()
    if not report:
        return standard_response(
            success=False,
            error={"code": "NOT_FOUND", "message": "Report not found."}
        )

    title = f"Saved Strategic Analysis: {report.title}"
    roadmap_titles = " -> ".join([r.get("title", "") for r in report.roadmap])
    content = f"Score: {report.assessment_score}%\nTarget customer: {report.target_customer}\nRoadmap Steps: {roadmap_titles}"

    memory = Memory(
        user_id=current_user.id,
        title=title,
        category="Advisor Reports",
        content=content,
        timestamp=datetime.now(timezone.utc).isoformat(),
        related_context=report.id
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)

    mem_dict = MemorySchema.model_validate(memory).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="memory",
        action="created",
        data=mem_dict
    )

    return standard_response(data=mem_dict)
