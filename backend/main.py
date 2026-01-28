from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import your user router
from routers import users

app = FastAPI()

# Static files
os.makedirs("static/avatars", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# main.py - Update your CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500", 
        "http://127.0.0.1:5500",
        "https://zyneth.shop",           
        "https://www.zyneth.shop",       
        "https://price-pulse-backend-ttv4.onrender.com", 
        "http://localhost:8000", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  
)


# Include user router
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "LMS API"}

@app.get("/health")
async def health():
    return {"status": "ok"}