import os
import io
from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# Altora Brand Color Palette
COLOR_GOLD = colors.HexColor("#C9A961")
COLOR_GOLD_LIGHT = colors.HexColor("#F5EEDC")
COLOR_CHARCOAL = colors.HexColor("#1A1A1A")
COLOR_BROWN = colors.HexColor("#6B5E4C")
COLOR_IVORY = colors.HexColor("#FAF7F0")
COLOR_MUTED_BG = colors.HexColor("#F7F5EE")
COLOR_TEXT = colors.HexColor("#262626")
COLOR_GREEN = colors.HexColor("#1E6B37")
COLOR_RED = colors.HexColor("#A82828")

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total pages ('Page X of Y')
    and draw header/footer on every page of the document.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Page dimensions
        width, height = A4
        
        # Top Header Banner
        self.setFillColor(COLOR_CHARCOAL)
        self.rect(0, height - 36, width, 36, stroke=0, fill=1)
        
        # Gold Header Title
        self.setFillColor(COLOR_GOLD)
        self.setFont("Helvetica-Bold", 10)
        self.drawString(36, height - 22, "ALTORA AI ADVISOR REPORT")
        
        # Date on Right
        self.setFillColor(COLOR_IVORY)
        self.setFont("Helvetica", 8)
        now_str = datetime.now(timezone.utc).strftime("%d/%m/%Y")
        self.drawRightString(width - 36, height - 22, f"Generated: {now_str}")
        
        # Bottom Footer Divider
        self.setStrokeColor(colors.HexColor("#E5E0D8"))
        self.setLineWidth(0.75)
        self.line(36, 36, width - 36, 36)
        
        # Footer Text
        self.setFillColor(COLOR_BROWN)
        self.setFont("Helvetica", 8)
        self.drawString(36, 22, "Altora AI Founder Operating System — Confidential Strategic Encryption")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(width - 36, 22, page_text)
        
        self.restoreState()


def build_advisor_pdf(report_data: Dict[str, Any], file_path: str) -> str:
    """
    Builds a professional A4 text-based PDF document from structured report data.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # Document setup with 36pt (0.5 in) margins
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Paragraph Styles matching Altora Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=COLOR_CHARCOAL,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=COLOR_CHARCOAL,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        spaceAfter=6,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    numbered_style = ParagraphStyle(
        'NumberedCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        leftIndent=16,
        firstLineIndent=-12,
        spaceAfter=4
    )

    swot_head_style = ParagraphStyle(
        'SWOTHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=COLOR_CHARCOAL
    )

    swot_body_style = ParagraphStyle(
        'SWOTBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=COLOR_TEXT
    )

    story = []

    # 1. Report Header & Title
    report_title = report_data.get("title", "Strategic Advisor Report")
    story.append(Paragraph(report_title, title_style))

    # 2. Score Badge Box
    score = report_data.get("score", report_data.get("assessment_score", 85))
    score_p = Paragraph(f"<b>Altora AI Advisor Assessment Score:</b> {score} / 100", ParagraphStyle(
        'ScoreText', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=COLOR_CHARCOAL
    ))
    
    score_table = Table([[score_p]], colWidths=[523])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_GOLD_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_GOLD),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))

    # 3. Executive Summary / Advice
    exec_advice = report_data.get("executive_advice", report_data.get("explanation", ""))
    if exec_advice:
        story.append(Paragraph("Executive Summary & Guidance", h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=COLOR_GOLD, spaceBefore=2, spaceAfter=8))
        story.append(Paragraph(exec_advice, body_style))
        story.append(Spacer(1, 8))

    # 4. Dynamic Report Sections
    sections = report_data.get("sections", [])
    
    # If no explicit sections array, build default dynamic sections from existing report attributes
    if not sections:
        sections = []
        if report_data.get("target_customer") or report_data.get("market_opportunity"):
            sections.append({
                "title": "Market Validation & Target Customers",
                "type": "paragraphs",
                "content": [
                    f"<b>Target Customer:</b> {report_data.get('target_customer', 'N/A')}",
                    f"<b>Market Opportunity:</b> {report_data.get('market_opportunity', 'N/A')}",
                    f"<b>Competitor Landscape:</b> {report_data.get('competition', 'N/A')}"
                ]
            })
        if report_data.get("swot"):
            swot = report_data["swot"]
            sections.append({
                "title": "SWOT Analysis",
                "type": "swot",
                "strengths": swot.get("strengths", []),
                "weaknesses": swot.get("weaknesses", []),
                "opportunities": swot.get("opportunities", []),
                "threats": swot.get("threats", [])
            })
        if report_data.get("revenue_model") or report_data.get("pricing"):
            sections.append({
                "title": "Business & Pricing Model",
                "type": "paragraphs",
                "content": [
                    f"<b>Revenue Mechanics:</b> {report_data.get('revenue_model', 'N/A')}",
                    f"<b>Target Pricing:</b> {report_data.get('pricing', 'N/A')}",
                    f"<b>Cost Context:</b> {report_data.get('costs', 'N/A')}"
                ]
            })
        if report_data.get("roadmap"):
            roadmap = report_data["roadmap"]
            rd_bullets = []
            for phase in roadmap:
                tasks_str = ", ".join(phase.get("tasks", []))
                rd_bullets.append(f"<b>{phase.get('phase', '')} — {phase.get('title', '')}:</b> {tasks_str}")
            sections.append({
                "title": "Growth Roadmap & Execution",
                "type": "bullets",
                "content": rd_bullets
            })
        if report_data.get("next_actions"):
            sections.append({
                "title": "Actionable Next Steps",
                "type": "numbered_list",
                "content": report_data["next_actions"]
            })

    # Render each section cleanly
    for sec in sections:
        sec_title = sec.get("title", "Section")
        sec_type = sec.get("type", "paragraph")

        story.append(Paragraph(sec_title, h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=COLOR_GOLD, spaceBefore=2, spaceAfter=8))

        if sec_type == "paragraph":
            story.append(Paragraph(sec.get("content", ""), body_style))

        elif sec_type == "paragraphs":
            paras = sec.get("content", [])
            for p in paras:
                story.append(Paragraph(p, body_style))

        elif sec_type == "bullets":
            bullets = sec.get("content", [])
            for b in bullets:
                story.append(Paragraph(f"• {b}", bullet_style))

        elif sec_type == "numbered_list":
            num_items = sec.get("content", [])
            for idx, item in enumerate(num_items, 1):
                story.append(Paragraph(f"<b>{idx}.</b> {item}", numbered_style))

        elif sec_type == "swot":
            s_list = "<br/>".join([f"• {x}" for x in sec.get("strengths", [])]) or "N/A"
            w_list = "<br/>".join([f"• {x}" for x in sec.get("weaknesses", [])]) or "N/A"
            o_list = "<br/>".join([f"• {x}" for x in sec.get("opportunities", [])]) or "N/A"
            t_list = "<br/>".join([f"• {x}" for x in sec.get("threats", [])]) or "N/A"

            cell_s = [Paragraph("<b>STRENGTHS</b>", ParagraphStyle('GreenH', parent=swot_head_style, textColor=COLOR_GREEN)), Paragraph(s_list, swot_body_style)]
            cell_w = [Paragraph("<b>WEAKNESSES</b>", ParagraphStyle('RedH', parent=swot_head_style, textColor=COLOR_RED)), Paragraph(w_list, swot_body_style)]
            cell_o = [Paragraph("<b>OPPORTUNITIES</b>", ParagraphStyle('GoldH', parent=swot_head_style, textColor=COLOR_GOLD)), Paragraph(o_list, swot_body_style)]
            cell_t = [Paragraph("<b>THREATS</b>", ParagraphStyle('BrownH', parent=swot_head_style, textColor=COLOR_BROWN)), Paragraph(t_list, swot_body_style)]

            swot_data = [
                [cell_s, cell_w],
                [cell_o, cell_t]
            ]

            swot_table = Table(swot_data, colWidths=[256, 256])
            swot_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), COLOR_MUTED_BG),
                ('GRID', (0, 0), (-1, -1), 0.75, colors.HexColor("#E5E0D8")),
                ('PADDING', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'TOP')
            ]))
            story.append(swot_table)

        story.append(Spacer(1, 10))

    # Build PDF with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    return file_path
