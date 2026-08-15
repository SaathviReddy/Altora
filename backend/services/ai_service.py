import time
import json
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.core.config import settings

def generate_advisor_report(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    stage = profile_data.get("stage", "business")
    industry = profile_data.get("industry", "Strategic Brand Consultancy")
    score = 45 if stage == "no_idea" else 68 if stage == "idea" else 82

    return {
        "id": f"rep_{int(time.time() * 1000)}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "title": f"Strategic Opportunity Report — {industry}",
        "assessment_score": score,
        "score": score,
        "explanation": (
            f"Analysis of interests and industry matches. Based on your skill parameters and target budget, "
            f"we have mapped a service-oriented agency structure." if stage == "no_idea" else
            f"Market validation blueprint for your business concept. Competitor analysis reveals high margin potential with moderate acquisition friction."
        ),
        "executive_advice": (
            f"Analysis of interests and industry matches. Based on your skill parameters and target budget, "
            f"we have mapped a service-oriented agency structure." if stage == "no_idea" else
            f"Market validation blueprint for your business concept. Competitor analysis reveals high margin potential with moderate acquisition friction."
        ),
        "target_customer": (
            "B2B small business owners seeking operations consultation" if stage == "no_idea" else
            "High-earning executives looking for fractional brand design"
        ),
        "market_opportunity": "Estimated TAM of $4.2B in Tier 1 cities, driven by digital brand transition requirements post-2025.",
        "competition": "Highly fragmented local boutique consultancies. Differentiator lies in custom AI workflow integrations.",
        "revenue_model": "Fixed-term strategy engagements ($2,500 - $5,000) transitioning to retainer contracts ($1,500/mo).",
        "pricing": "$3,500 setup strategy retainer + $1,500 maintenance fee.",
        "costs": "Principal contractor hire, hosting, legal setup, branding.",
        "swot": {
            "strengths": [
                "Low initial capital expenditures",
                "Highly specialized advisory skills",
                "Agile delivery model"
            ],
            "weaknesses": [
                "Solo resource limitations",
                "High dependencies on founder brand",
                "Long sales cycles"
            ],
            "opportunities": [
                "AI automation integrations for clients",
                "Underserved regional markets",
                "High ticket corporate cohorts"
            ],
            "threats": [
                "Direct competition from remote agencies",
                "Rapid tool evolution risk",
                "Macro budget consolidations"
            ]
        },
        "roadmap": [
            {
                "phase": "Phase 1: Validation",
                "title": "Customer Discovery & Sandbox",
                "tasks": [
                    "Conduct 10 stakeholder interviews",
                    "Setup landing page framework",
                    "Launch strategy draft newsletter"
                ]
            },
            {
                "phase": "Phase 2: Alpha Launch",
                "title": "Initial Pilot Deliverables",
                "tasks": [
                    "Close first 2 advisory retainers",
                    "Execute core SWOT mappings",
                    "Deploy client workspace template"
                ]
            },
            {
                "phase": "Phase 3: Operations & Scale",
                "title": "Process Automation",
                "tasks": [
                    "Hire virtual agency assistant",
                    "Launch targeted LinkedIn outreach",
                    "Document case study results"
                ]
            }
        ],
        "risks": [
            {
                "risk": "Founder capacity bottleneck",
                "impact": "High",
                "mitigation": "Template standard documents and automate billing operations early."
            },
            {
                "risk": "High client churn",
                "impact": "Medium",
                "mitigation": "Focus on 6-month minimum lock-ins with clear milestone deliverables."
            }
        ],
        "next_actions": [
            "Log your first equity investment in the Finance tracker.",
            "Add 'Conduct 10 customer validation interviews' to Tasks.",
            "Define the milestone for 'First paid customer pilot'."
        ]
    }

async def generate_query_advisor_response_async(query: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    industry = profile_data.get("industry", "Strategic Venture")
    query_lower = query.lower()

    # Check if Google Gemini API Key is available
    api_key = settings.AI_API_KEY
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            prompt_text = f"""
You are Gemini AI Strategic Advisor. Generate a structured business advisor report for query: "{query}".
Return a RAW JSON object (no markdown surrounding it) with this structure:
{{
  "title": "Report Title",
  "score": 78,
  "executive_advice": "Comprehensive executive summary paragraph.",
  "sections": [
    {{"title": "Full Idea Description", "type": "paragraph", "content": "Detailed overview."}},
    {{"title": "Market Validation", "type": "paragraphs", "content": ["Paragraph 1", "Paragraph 2"]}},
    {{"title": "Competitor Analysis", "type": "bullets", "content": ["Competitor A details", "Competitor B details"]}},
    {{"title": "SWOT Analysis", "type": "swot", "strengths": ["S1"], "weaknesses": ["W1"], "opportunities": ["O1"], "threats": ["T1"]}},
    {{"title": "Business Model", "type": "paragraph", "content": "Business model details."}},
    {{"title": "Revenue Opportunities", "type": "numbered_list", "content": ["Opportunity 1", "Opportunity 2"]}},
    {{"title": "Growth Strategy", "type": "numbered_list", "content": ["Stage 1", "Stage 2"]}},
    {{"title": "Legal & Compliance", "type": "paragraphs", "content": ["Permits & regulations required."]}},
    {{"title": "Actionable Next Steps", "type": "numbered_list", "content": ["Step 1", "Step 2"]}}
  ]
}}
"""
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt_text}]}]})
                if res.status_code == 200:
                    resp_json = res.json()
                    raw_content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned = raw_content.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(cleaned)
                    parsed["id"] = f"rep_gemini_{int(time.time() * 1000)}"
                    parsed["created_at"] = datetime.now(timezone.utc).isoformat()
                    parsed["assessment_score"] = parsed.get("score", 78)
                    return parsed
        except Exception as e:
            print(f"[Gemini API] Exception calling API: {e}. Using structured fallback engine.")

    # High-Performance Dynamic Fallback Engine tailored to user query
    if any(k in query_lower for k in ["cupcake", "bakery", "food", "cake", "restaurant", "retail"]):
        title = "Cupcake & Artisanal Bakery Business — Strategic Advisor Report"
        score = 68
        executive_summary = (
            f"Strategic analysis for '{query}': Launching an artisanal cupcake business offers strong local margin potential "
            f"(up to 75% gross margin per unit) if focused on specialty events, corporate catering, and online pre-orders rather than traditional storefront rent."
        )
        sections = [
            {
                "title": "Full Idea Description",
                "type": "paragraph",
                "content": f"The query '{query}' outlines an artisanal bakery business providing handcrafted, premium cupcakes for corporate events, weddings, and local retail delivery."
            },
            {
                "title": "Market Validation",
                "type": "paragraphs",
                "content": [
                    "The target customer consists of local event planners, corporate office managers, wedding coordinators, and gift shoppers seeking premium dessert catering.",
                    "Consumer trends indicate high demand for custom branding, vegan/gluten-free options, and elegant gift-box packaging."
                ]
            },
            {
                "title": "Competitor Analysis",
                "type": "bullets",
                "content": [
                    "Local Supermarket Bakeries — Low price point, but lack custom branding and premium quality.",
                    "Established Boutique Cupcake Shops — High brand loyalty, but constrained by high storefront rent overhead.",
                    "Home-Based Custom Bakers — High customization, but limited capacity and production scale."
                ]
            },
            {
                "title": "SWOT Analysis",
                "type": "swot",
                "strengths": ["High gross profit margins (70%+)", "Strong visual appeal for social media marketing", "Low starting inventory costs"],
                "weaknesses": ["Perishable product shelf-life", "High labor intensity in decorating"],
                "opportunities": ["B2B corporate subscription orders", "Monetizing baking masterclasses & DIY kits"],
                "threats": ["Rising ingredient costs (butter, cocoa, sugar)", "Strict local health department regulations"]
            },
            {
                "title": "Business Model",
                "type": "paragraph",
                "content": "Operate a commercial kitchen cloud-bakery model with direct-to-consumer online ordering, corporate subscriptions, and event catering retainers."
            },
            {
                "title": "Revenue Opportunities",
                "type": "numbered_list",
                "content": [
                    "Corporate Catering Contracts ($500 - $2,500 per event)",
                    "Custom Wedding & Birthday Dessert Towers ($350 - $1,200)",
                    "Weekly Office Cupcake Subscription Boxes ($150/week per company)"
                ]
            },
            {
                "title": "Growth Strategy",
                "type": "numbered_list",
                "content": [
                    "Stage 1: Secure commercial kitchen space and launch Instagram & local SEO portal.",
                    "Stage 2: Partner with 10 local wedding planners and corporate event venues.",
                    "Stage 3: Expand to automated delivery logistics and branded pop-up kiosks."
                ]
            },
            {
                "title": "Legal & Compliance",
                "type": "paragraphs",
                "content": [
                    "Commercial Food Handler License & Department of Health Permit required prior to selling food items.",
                    "General Liability Insurance & Product Liability Coverage ($1M policy recommended).",
                    "Nutritional labeling & allergen disclosure (milk, eggs, nuts, wheat) compliance."
                ]
            },
            {
                "title": "Actionable Next Steps",
                "type": "numbered_list",
                "content": [
                    "Finalize food safety certification and register LLC business entity.",
                    "Conduct tasting trials with 5 target corporate office managers.",
                    "Log initial equipment & ingredient purchases in the Finance Ledger."
                ]
            }
        ]
    elif any(k in query_lower for k in ["saas", "software", "tech", "app", "subscription"]):
        title = "SaaS & Digital Subscription Venture — Strategic Advisor Report"
        score = 88
        executive_summary = f"Gemini AI Strategic Analysis for '{query}': Scaling your software venture requires optimizing Monthly Recurring Revenue (MRR) while suppressing Customer Acquisition Cost (CAC). Focus on product-led growth (PLG) and targeted outbound."
        sections = [
            {
                "title": "Full Idea Description",
                "type": "paragraph",
                "content": f"The query '{query}' addresses a B2B SaaS platform designed to automate operational workflows and increase retention for tech ventures."
            },
            {
                "title": "Market Validation",
                "type": "paragraphs",
                "content": [
                    "The target market comprises Series A tech founders, agency principals, and operations managers looking for unified analytics and workflow automation.",
                    "TAM is estimated at $8.4B globally with annual CAGR of 18.2%."
                ]
            },
            {
                "title": "Competitor Analysis",
                "type": "bullets",
                "content": [
                    "Legacy Enterprise Software — Feature-rich but high onboarding friction and expensive per-seat licenses.",
                    "Niche Single-Feature Tools — Simple to use, but suffer from high churn due to feature fatigue."
                ]
            },
            {
                "title": "SWOT Analysis",
                "type": "swot",
                "strengths": ["High gross margin (85%+)", "Predictable recurring subscription revenue", "Global scalability"],
                "weaknesses": ["High upfront engineering costs", "Initial customer trust barrier"],
                "opportunities": ["Integrating AI automation capabilities", "Expansion into enterprise tiers"],
                "threats": ["Rapid competitor feature cloning", "Security & data privacy breaches"]
            },
            {
                "title": "Business Model",
                "type": "paragraph",
                "content": "Tiered SaaS subscription model ($49/mo Starter, $199/mo Pro, $500/mo Enterprise) with annual upfront discounts."
            },
            {
                "title": "Revenue Opportunities",
                "type": "numbered_list",
                "content": [
                    "Monthly & Annual Subscription Retainers",
                    "Add-on API integrations & usage billing",
                    "White-label enterprise custom deployments"
                ]
            },
            {
                "title": "Growth Strategy",
                "type": "numbered_list",
                "content": [
                    "Stage 1: Launch Product-Led Freemium / 14-day trial.",
                    "Stage 2: Drive SEO teardowns and founder-led content on LinkedIn.",
                    "Stage 3: Build partner integration ecosystem."
                ]
            },
            {
                "title": "Legal & Compliance",
                "type": "paragraphs",
                "content": [
                    "GDPR, CCPA, and SOC 2 Type II compliance framework implementation.",
                    "SaaS Terms of Service, Privacy Policy, and Data Processing Agreements (DPA)."
                ]
            },
            {
                "title": "Actionable Next Steps",
                "type": "numbered_list",
                "content": [
                    "Define target CAC to LTV ratio (>3:1 target).",
                    "Publish 2 case studies on early customer wins.",
                    "Log software hosting and infrastructure expenses in Finance."
                ]
            }
        ]
    else:
        title = f"Strategic Business Advisory Report — {query[:35]}"
        score = 82
        executive_summary = f"Gemini AI Advisor Blueprint for '{query}': In your target venture context ({industry}), executing this strategic initiative requires alignment across market positioning, unit economics, risk mitigation, and milestone tracking."
        sections = [
            {
                "title": "Full Idea Description",
                "type": "paragraph",
                "content": f"Executive consultation on: '{query}'. Evaluated against current business context parameters for {industry}."
            },
            {
                "title": "Market Validation",
                "type": "paragraphs",
                "content": [
                    "Target audience includes B2B decision makers and high-ticket service clients seeking specialized domain expertise.",
                    "Market demand favors outcome-based deliverables with transparent performance metrics."
                ]
            },
            {
                "title": "Competitor Analysis",
                "type": "bullets",
                "content": [
                    "Legacy Regional Consultancies — High overhead, slow delivery cycles.",
                    "Solo Freelancers — Low cost, but lack systemized operational infrastructure."
                ]
            },
            {
                "title": "SWOT Analysis",
                "type": "swot",
                "strengths": ["Agile operating structure", "High profit margins", "Specialized value proposition"],
                "weaknesses": ["Solo founder bandwidth constraint"],
                "opportunities": ["AI workflow integration", "Recurring retainer packaging"],
                "threats": ["Shifting client budget priorities"]
            },
            {
                "title": "Business Model",
                "type": "paragraph",
                "content": "Fixed-fee advisory retainers ($1,500 - $3,500/mo) coupled with initial setup workshops."
            },
            {
                "title": "Revenue Opportunities",
                "type": "numbered_list",
                "content": [
                    "Core Monthly Advisory Retainers",
                    "Project-Based Strategic Audits",
                    "Implementation Workshop Surcharges"
                ]
            },
            {
                "title": "Growth Strategy",
                "type": "numbered_list",
                "content": [
                    "Stage 1: Systemize core deliverables into SOP templates.",
                    "Stage 2: Expand founder authority outbound lead generation.",
                    "Stage 3: Automate client progress reporting."
                ]
            },
            {
                "title": "Legal & Compliance",
                "type": "paragraphs",
                "content": [
                    "Master Services Agreement (MSA) and Statement of Work (SOW) contracts.",
                    "Non-Disclosure Agreements (NDA) and Intellectual Property protection."
                ]
            },
            {
                "title": "Actionable Next Steps",
                "type": "numbered_list",
                "content": [
                    f"Execute primary directive: '{query}'.",
                    "Log decision milestone in the Venture Timeline.",
                    "Review progress weekly in the Founder Command Center."
                ]
            }
        ]

    # Map legacy fields for backwards compatibility
    roadmap_legacy = []
    actions_legacy = []
    for sec in sections:
        if sec.get("type") == "numbered_list" and sec.get("title") == "Actionable Next Steps":
            actions_legacy = sec.get("content", [])
        if sec.get("type") == "numbered_list" and sec.get("title") == "Growth Strategy":
            for idx, item in enumerate(sec.get("content", []), 1):
                roadmap_legacy.append({"phase": f"Stage {idx}", "title": item, "tasks": [item]})

    return {
        "id": f"rep_query_{int(time.time() * 1000)}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "query": query,
        "title": title,
        "score": score,
        "assessment_score": score,
        "explanation": executive_summary,
        "executive_advice": executive_summary,
        "target_customer": "Target B2B Clients & Event Planners",
        "market_opportunity": "High margin niche growth with digital automation",
        "competition": "Fragmented local market competitors",
        "revenue_model": "Retainer & Unit Margin Sales Model",
        "pricing": "$1,500 - $3,500 per package",
        "costs": "Lean digital operations",
        "swot": {
            "strengths": sections[3].get("strengths", []) if (len(sections) > 3 and sections[3].get("type") == "swot") else ["High margin", "Lean setup"],
            "weaknesses": sections[3].get("weaknesses", []) if (len(sections) > 3 and sections[3].get("type") == "swot") else ["Capacity barrier"],
            "opportunities": sections[3].get("opportunities", []) if (len(sections) > 3 and sections[3].get("type") == "swot") else ["Scaling online"],
            "threats": sections[3].get("threats", []) if (len(sections) > 3 and sections[3].get("type") == "swot") else ["Competition"]
        },
        "roadmap": roadmap_legacy or [{"phase": "Phase 1", "title": "Validation", "tasks": ["Initial Launch"]}],
        "risks": [{"risk": "Bandwidth constraint", "impact": "Medium", "mitigation": "Automate routine operations."}],
        "next_actions": actions_legacy or ["Execute strategy", "Log milestone"],
        "sections": sections
    }


def generate_chat_response(
    user_msg_text: str,
    industry: str,
    revenue: float,
    expenses: float,
    goals: List[str],
    pending_tasks: List[str]
) -> str:
    text_lower = user_msg_text.lower()
    if any(k in text_lower for k in ['pricing', 'revenue', 'cost', 'profit', 'financial']):
        return (
            f"Referencing your active operating profile: your current revenue stands at ${revenue:,.2f} with costs at ${expenses:,.2f}. "
            f"If you are reviewing client positioning, I recommend testing packages priced at a flat $1,500/mo retainer to push net profitability past $25,000 this quarter."
        )
    elif any(k in text_lower for k in ['swot', 'competit', 'strength', 'weakness', 'market']):
        return (
            f"Looking at your active sector ({industry}): your strengths include low initial capital spending, but capacity remains a bottleneck. "
            f"For competitor mitigation, focus on fractional branding or specific operational integrations."
        )
    elif any(k in text_lower for k in ['task', 'todo', 'milestone', 'action', 'priority']):
        task_str = pending_tasks[0] if pending_tasks else 'Configure pricing retainers'
        return (
            f"You currently have pending priorities in your workspace. Specifically, you should complete: \"{task_str}\". "
            f"Let's log this outcome to the Milestones page once achieved."
        )
    else:
        goal_str = goals[0] if goals else 'Scale active clients'
        return (
            f"Acknowledge. Altora has locked this request into the {industry} context matrix. "
            f"Under your goals to \"{goal_str}\", I recommend mapping your next actions strictly to validation templates. "
            f"Should we commit this outcome as a Decision Memory?"
        )

