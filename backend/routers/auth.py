"""
Google OAuth authentication router - FRONTEND-FIRST VERSION
"""
import secrets
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
import httpx
from pydantic import BaseModel

from database import get_database
from utils.security import create_access_token
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# FRONTEND redirect URIs (Google talks to frontend only)
IS_LOCAL = os.getenv("RENDER") != "true"

if IS_LOCAL:
    # LOCAL DEVELOPMENT - Frontend handles OAuth
    FRONTEND_REDIRECT_URI = "http://localhost:5500/frontend/oauth-callback.html"
    FRONTEND_URL = "http://127.0.0.1:5500/frontend"
    BACKEND_URL = "http://localhost:8000"
    print("🖥️  Running in LOCAL development mode")
else:
    # PRODUCTION - Frontend handles OAuth
    FRONTEND_REDIRECT_URI = "https://zyneth.shop/oauth-callback.html"
    FRONTEND_URL = "https://zyneth.shop"
    BACKEND_URL = "https://zyneth-backend.onrender.com"
    print("🚀 Running in PRODUCTION mode")

print("🔧 OAuth Configuration (Frontend-First):")
print(f"   Environment: {'LOCAL' if IS_LOCAL else 'PRODUCTION'}")
print(f"   Google Client ID: {GOOGLE_CLIENT_ID[:10]}..." if GOOGLE_CLIENT_ID else "❌ MISSING")
print(f"   Google Client Secret: {'✅ SET' if GOOGLE_CLIENT_SECRET else '❌ MISSING'}")
print(f"   Frontend Redirect URI: {FRONTEND_REDIRECT_URI}")
print(f"   Frontend URL: {FRONTEND_URL}")
print(f"   Backend URL: {BACKEND_URL}")

# Validate configuration
if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("❌ CRITICAL ERROR: Google OAuth credentials missing!")
    print("   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file")

class GoogleUserInfo(BaseModel):
    """Google user info from token validation"""
    email: str
    email_verified: bool
    name: str
    picture: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    sub: str  # Google user ID

class AuthUrlResponse(BaseModel):
    """Response model for auth URL endpoint"""
    auth_url: str

class GoogleAuthRequest(BaseModel):
    """Request model for Google auth code exchange"""
    code: str

class GoogleAuthResponse(BaseModel):
    """Response model for Google auth"""
    token: str
    user_id: str
    email: str
    role: str
    is_new: bool

async def get_user_crud(db=Depends(get_database)):
    from crud.user import UserCRUD
    return UserCRUD(db)

@router.get("/google/url", response_model=AuthUrlResponse)
async def get_google_auth_url():
    """
    Get Google OAuth URL for frontend to redirect to
    
    Google will redirect back to FRONTEND, not backend
    """
    # Validate configuration
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured properly"
        )
    
    # Generate secure state
    state = secrets.token_urlsafe(32)
    
    # Google OAuth URL parameters - Google redirects to FRONTEND
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": FRONTEND_REDIRECT_URI,  # Google talks to frontend
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    
    # Build Google OAuth URL
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    print("=" * 60)
    print("🔗 Generated Google OAuth URL for frontend:")
    print(f"   Google will redirect to: {FRONTEND_REDIRECT_URI}")
    print(f"   State parameter: {state[:10]}...")
    print("=" * 60)
    
    # Return JSON response with the auth URL
    return {"auth_url": auth_url}

@router.post("/google/exchange", response_model=GoogleAuthResponse)
async def exchange_google_code(
    request: GoogleAuthRequest,
    crud=Depends(get_user_crud)
):
    """
    Exchange Google authorization code for backend tokens
    
    Frontend gets the code from Google and sends it here
    Backend exchanges code for Google tokens, then creates JWT
    """
    print("🔄 Exchanging Google authorization code...")
    
    if not request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No authorization code provided"
        )
    
    try:
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": request.code,
            "grant_type": "authorization_code",
            "redirect_uri": FRONTEND_REDIRECT_URI,  # Must match what frontend used
        }
        
        print("🔄 Exchanging code for Google tokens...")
        print(f"   Using frontend redirect_uri: {FRONTEND_REDIRECT_URI}")
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            
            if token_response.status_code != 200:
                print(f"❌ Token exchange failed: {token_response.status_code}")
                print(f"   Response: {token_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to exchange authorization code: {token_response.text}"
                )
            
            token_json = token_response.json()
            access_token = token_json.get("access_token")
            
            if not access_token:
                print("❌ No access token in response")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No access token received from Google"
                )
            
            print("✅ Got Google access token, fetching user info...")
            
            # Get user info from Google
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            userinfo_response = await client.get(userinfo_url, headers=headers)
            
            if userinfo_response.status_code != 200:
                print(f"❌ Userinfo fetch failed: {userinfo_response.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch user info from Google"
                )
            
            userinfo = userinfo_response.json()
            print(f"✅ User info received for: {userinfo.get('email', 'No email')}")
            
            # Validate email
            if not userinfo.get("email"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No email in Google user info"
                )
            
            # Create user or get existing
            email = userinfo["email"]
            name = userinfo.get("name", email.split("@")[0])
            picture = userinfo.get("picture")
            
            existing_user = await crud.get_user_by_email(email)
            is_new = False
            
            if existing_user:
                print(f"🔄 User exists: {email}")
                user = existing_user
            else:
                print(f"🔄 Creating new user: {email}")
                user = await crud.create_google_user(
                    email=email,
                    full_name=name,
                    picture=picture,
                    google_id=userinfo.get("sub")
                )
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create user"
                    )
                is_new = True
            
            # Create JWT token
            jwt_token = create_access_token(
                data={"sub": user.email, "role": user.role}
            )
            
            print(f"✅ Authentication successful for {email}")
            print(f"   User ID: {user.id}")
            print(f"   Is new user: {is_new}")
            
            return GoogleAuthResponse(
                token=jwt_token,
                user_id=str(user.id),
                email=user.email,
                role=user.role,
                is_new=is_new
            )
            
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP error during Google token exchange: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to communicate with Google: {str(e)}"
        )
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

@router.get("/test-config")
async def test_config():
    """Test endpoint to verify OAuth configuration"""
    return {
        "status": "ok",
        "environment": "local" if IS_LOCAL else "production",
        "google_client_id_set": bool(GOOGLE_CLIENT_ID),
        "google_client_secret_set": bool(GOOGLE_CLIENT_SECRET),
        "frontend_redirect_uri": FRONTEND_REDIRECT_URI,
        "frontend_url": FRONTEND_URL,
        "backend_url": BACKEND_URL,
        "oauth_flow": "frontend-first",
        "description": "Google talks to frontend only, frontend sends code to backend",
        "required_google_console_config": {
            "authorized_javascript_origins": [
                "http://localhost:5500",
                "http://127.0.0.1:5500", 
                "https://zyneth.shop",
                "https://www.zyneth.shop"
            ],
            "authorized_redirect_uris": [
                "http://localhost:5500/frontend/oauth-callback.html",
                "https://zyneth.shop/oauth-callback.html"
            ],
            "important": "Google Console should NOT have any backend URLs, only frontend URLs"
        },
        "endpoints": {
            "get_auth_url": "GET /auth/google/url",
            "exchange_code": "POST /auth/google/exchange"
        }
    }

@router.post("/logout")
async def logout():
    """Logout endpoint - returns success response"""
    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logged out successfully"}
    )
    response.delete_cookie("access_token")
    return response