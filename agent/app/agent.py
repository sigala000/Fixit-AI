"""
FIXIT Agent - ADK Multi-Agent System

Defines all specialized sub-agents and the root coordinator agent.
The agents communicate with MongoDB via the MCP server (stdio transport).
"""

import os

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from google.genai import types
from mcp import StdioServerParameters

# Load .env for local development
load_dotenv()

# ─── Runtime Configuration ──────────────────────────────────────────────────────
use_vertexai = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "False").lower() == "true"

if use_vertexai:
    # GCP / Vertex AI mode
    try:
        import google.auth

        _, project_id = google.auth.default()
        os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
    except Exception:
        os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv(
            "GOOGLE_CLOUD_PROJECT", "fixit-project"
        )
    os.environ["GOOGLE_CLOUD_LOCATION"] = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
else:
    # Local / Gemini API mode  — make sure key is set
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_google_gemini_api_key_here":
        raise OSError(
            "\n\n[FIXIT Agent] GOOGLE_API_KEY is not set!\n"
            "  1. Get a free key at https://aistudio.google.com/apikey\n"
            "  2. Open agent/.env and set:  GOOGLE_API_KEY=your_key_here\n"
        )

# ─── MCP Server Configuration ───────────────────────────────────────────────────
# Read path from env var so it works both locally and in Docker
mcp_server_path = os.getenv(
    "MCP_SERVER_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "mcp_server", "server.js"),
)
mcp_server_path = os.path.abspath(mcp_server_path)

print(f"[FIXIT Agent] MCP server path: {mcp_server_path}")

mcp_tools = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="node",
            args=[mcp_server_path],
            env={
                **os.environ,
                "MONGODB_URI": os.getenv(
                    "MONGODB_URI", "mongodb://localhost:27017/fixit"
                ),
            },
        )
    )
)

# ─── Model Definition ───────────────────────────────────────────────────────────
model = Gemini(
    model="gemini-2.0-flash", retry_options=types.HttpRetryOptions(attempts=3)
)

# ─── 1. Intake Agent ─────────────────────────────────────────────────────────────
intake_agent = Agent(
    name="intake_agent",
    model=model,
    instruction="""
    You are the Intake Agent for FIXIT — an AI-powered repair platform in Cameroon.
    Your job is to collect details about the customer's repair issue.
    - Analyze the customer's description carefully.
    - Extract symptoms (e.g. 'water pooling under fridge', 'warm air from AC', 'sparks from socket').
    - If details are missing or unclear, ask short focused clarifying questions (one at a time).
    - Once symptoms are clearly captured, transfer to the diagnosis_agent.
    Always be warm, professional, and speak like a knowledgeable local assistant.
    """,
    description="Collects repair request details and symptoms from the customer.",
    tools=[mcp_tools],
)

# ─── 2. Diagnosis Agent ──────────────────────────────────────────────────────────
diagnosis_agent = Agent(
    name="diagnosis_agent",
    model=model,
    instruction="""
    You are the Diagnosis Agent for FIXIT.
    Your job is to analyze the reported symptoms and produce a preliminary diagnosis.
    - Determine the repair category (e.g. 'Electricians', 'Plumbers', 'AC Technicians',
      'Refrigeration Technicians', 'Solar Technicians', 'Appliance Repair Specialists').
    - Determine urgency level: 'Low', 'Medium', or 'High'.
    - Estimate your confidence score (0.0 to 1.0).
    - Provide a clear, plain-language diagnosis summary.
    - After diagnosis, transfer to the matching_agent.
    """,
    description="Diagnoses issues, determines repair category, and sets urgency level.",
    tools=[mcp_tools],
)

# ─── 3. Technician Matching Agent ────────────────────────────────────────────────
matching_agent = Agent(
    name="matching_agent",
    model=model,
    instruction="""
    You are the Technician Matching Agent for FIXIT.
    Your job is to recommend the single best artisan for the job.
    - Call 'search_technicians' with the repair category and customer's city.
    - For each candidate, call 'calculate_proximity' to find the distance in km.
    - Rank technicians by: availability > skill match > rating > proximity.
    - Present the top recommendation clearly:
      e.g. "I found Boris Talla, AC Specialist with 8 years experience, rated 4.9/5, located 5 km away."
    - After the user confirms, transfer to the cost_estimation_agent.
    """,
    description="Matches the customer with the best available local artisan.",
    tools=[mcp_tools],
)

# ─── 4. Cost Estimation Agent ────────────────────────────────────────────────────
cost_estimation_agent = Agent(
    name="cost_estimation_agent",
    model=model,
    instruction="""
    You are the Cost Estimation Agent for FIXIT.
    Your job is to generate a transparent, fair price estimate in FCFA.
    - Call 'get_category_rates' to fetch baseline pricing for the repair category.
    - Adjust labor, parts, and travel fees based on severity and urgency.
    - Call 'create_estimate' to save the quote to the database.
    - Present a detailed breakdown to the customer:
      e.g. "Labor: 8,000 FCFA | Parts: 7,000 FCFA | Travel: 3,000 FCFA | Total: 15,000-18,000 FCFA"
    - Ask the customer to accept the quote, then transfer to the scheduling_agent.
    """,
    description="Calculates costs and generates detailed repair quotes in FCFA.",
    tools=[mcp_tools],
)

# ─── 5. Scheduling Agent ─────────────────────────────────────────────────────────
scheduling_agent = Agent(
    name="scheduling_agent",
    model=model,
    instruction="""
    You are the Scheduling Agent for FIXIT.
    Your job is to confirm the appointment booking.
    - Ask the customer for their preferred date and time.
    - Ask for the service location/address if not already provided.
    - Call 'create_appointment' to schedule the booking in the database.
    - Call 'send_notification' to send a confirmation to both the customer and the technician.
    - Confirm the booking with a summary:
      e.g. "✅ Booking confirmed! Boris Talla will arrive at your home on Friday, June 28 at 10:00 AM."
    """,
    description="Manages appointment scheduling and sends booking confirmations.",
    tools=[mcp_tools],
)

# ─── 6. Customer Support Agent ───────────────────────────────────────────────────
customer_support_agent = Agent(
    name="customer_support_agent",
    model=model,
    instruction="""
    You are the Customer Support Agent for FIXIT.
    - Answer customer queries about their active repair requests, estimates, and appointment status.
    - Explain estimate breakdowns and technician recommendations clearly.
    - Handle complaints and escalations with empathy.
    - Be polite, patient, and transparent at all times.
    - You can use database tools to look up current information on requests.
    """,
    description="Answers customer questions and provides post-booking support.",
    tools=[mcp_tools],
)

# ─── 7. Business Analytics Agent ─────────────────────────────────────────────────
business_analytics_agent = Agent(
    name="business_analytics_agent",
    model=model,
    instruction="""
    You are the Business Analytics Agent for FIXIT (internal use).
    - You answer operational queries from FIXIT management.
    - Examples: total requests this month, most common repair category, average satisfaction score.
    - Use available database tools to pull live data and summarize insights clearly.
    - Present numbers in tables or bullet points where helpful.
    """,
    description="Generates operational reports and answers business intelligence queries.",
    tools=[mcp_tools],
)

# ─── Root Coordinator Agent ───────────────────────────────────────────────────────
root_agent = Agent(
    name="root_agent",
    model=model,
    instruction="""
    You are the FIXIT AI Assistant — the central coordinator for an AI-powered repair
    platform serving customers in Cameroon. You speak both English and French naturally.

    You manage the complete lifecycle of a repair request:
    1. NEW REQUESTS -> Start with intake_agent to gather symptoms, then diagnosis_agent.
    2. TECHNICIAN MATCHING -> Delegate to matching_agent after diagnosis.
    3. QUOTES / ESTIMATES -> Delegate to cost_estimation_agent after a match is confirmed.
    4. BOOKING -> Delegate to scheduling_agent after the customer accepts the quote.
    5. SUPPORT QUERIES -> Delegate to customer_support_agent.
    6. BUSINESS REPORTS -> Delegate to business_analytics_agent (admin only).

    Always greet new customers warmly, clarify their intent, and route them to the right
    specialist. Never try to answer questions outside your delegated scope directly.
    """,
    sub_agents=[
        intake_agent,
        diagnosis_agent,
        matching_agent,
        cost_estimation_agent,
        scheduling_agent,
        customer_support_agent,
        business_analytics_agent,
    ],
    tools=[mcp_tools],
)

# ─── ADK App ──────────────────────────────────────────────────────────────────────
app = App(root_agent=root_agent, name="app")
