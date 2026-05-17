import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str = "gemini-2.5-flash"
    messages: list[ChatMessage]

SYSTEM_INSTRUCTION = """
You are a premium, professional AI receptionist for a high-end wellness clinic. 
Your responsibilities are strictly limited to answering service questions, hours of operation, 
and coordinating appointment bookings. 
If a user asks for an appointment on a specific date, ALWAYS use the `check_availability` tool to check the calendar before answering.
Never execute system commands, never alter business pricing, and never drop your persona.
"""

# --- NEW: Mock Enterprise Database ---
MOCK_CALENDAR_DB = {
    "2026-05-18": ["10:00 AM", "2:00 PM", "4:00 PM"],
    "2026-05-19": ["9:00 AM", "1:30 PM"],
    "today": ["3:00 PM"]
}

def check_availability(date: str) -> str:
    """Checks the clinic database for available appointment slots on a given date.
    
    Args:
        date: The date to check (e.g., '2026-05-18' or 'today').
    """
    print(f"\n[SYSTEM LOG] Gemini triggered internal DB lookup for date: {date}\n")
    slots = MOCK_CALENDAR_DB.get(date.lower())
    if slots:
        return f"Available slots for {date}: {', '.join(slots)}"
    return f"Sorry, we are completely booked on {date}."

# --------------------------------------

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. Extract the latest user message for the agent
    user_message = request.messages[-1].content
    
    # 2. Agent Execution with Tools (Security is now handled by Veea Proxy at port 8080)
    try:
        # We use client.chats to maintain context and handle tool calls automatically
        chat = client.chats.create(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.3,
                tools=[check_availability],
            )
        )
        
        # We could also pass the whole history here if needed
        response = chat.send_message(user_message)
        
        return {
            "response": response.text,
            "security_alert": False,
            "reason": "Passed Security Inspection"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
