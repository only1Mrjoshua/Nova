from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import os, uuid
import requests
from bson import ObjectId
import resend
from dotenv import load_dotenv
from database import get_database
from models.user import RoleEnum, User
from schemas.user import UserCreate, AdminUserCreate, UserOut, UserLogin
from utils.security import hash_password, verify_password, create_access_token
from dependencies import get_current_user, require_admin
from fastapi.responses import HTMLResponse
from utils.google_auth import google_oauth
from schemas.google_auth import GoogleAuthRequest, GoogleAuthResponse


# Load environment variables
load_dotenv()

# Create directory if not exists
UPLOAD_DIR = "static/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/users", tags=["Users"])

async def get_user_crud(db=Depends(get_database)):
    from crud.user import UserCRUD
    return UserCRUD(db)

# ========== REAL EMAIL SERVICE WITH RESEND ==========
class EmailService:
    """Email service using Resend with fallback for development"""
    
    @staticmethod
    async def send_otp_email(email: str, otp_code: str) -> bool:
        """
        Send OTP email using Resend with no-reply@zyneth.shop as sender.
        Falls back to console logging if Resend fails.
        """
        # Try to send with Resend first
        resend_api_key = os.getenv("RESEND_API_KEY")
        
        if resend_api_key:
            try:
                resend.api_key = resend_api_key
                
                params = {
                    "from": "Zyneth <no-reply@zyneth.shop>",  # Using your email domain
                    "to": [email],
                    "subject": "Verify Your Email - Zyneth",
                    "html": f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verify Your Email</title>
                        <style>
                            body {{
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                            }}
                            .container {{
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #ffffff;
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            }}
                            .header {{
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }}
                            .logo {{
                                font-size: 28px;
                                font-weight: 700;
                                margin-bottom: 10px;
                            }}
                            .content {{
                                padding: 40px 30px;
                            }}
                            .otp-box {{
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                color: white;
                                font-size: 36px;
                                font-weight: 700;
                                letter-spacing: 8px;
                                text-align: center;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 30px 0;
                                font-family: monospace;
                            }}
                            .instructions {{
                                background-color: #f8f9fa;
                                border-left: 4px solid #667eea;
                                padding: 15px 20px;
                                margin: 25px 0;
                                border-radius: 4px;
                            }}
                            .footer {{
                                text-align: center;
                                padding: 20px;
                                color: #666;
                                font-size: 12px;
                                border-top: 1px solid #eee;
                                background-color: #f9f9f9;
                            }}
                            .button {{
                                display: inline-block;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 12px 30px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: 600;
                                margin-top: 20px;
                            }}
                            @media (max-width: 600px) {{
                                .container {{
                                    margin: 10px;
                                }}
                                .header {{
                                    padding: 30px 20px;
                                }}
                                .content {{
                                    padding: 30px 20px;
                                }}
                                .otp-box {{
                                    font-size: 28px;
                                    letter-spacing: 6px;
                                    padding: 15px;
                                }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="logo">Zyneth</div>
                                <p style="margin: 0; opacity: 0.9;">Email Verification</p>
                            </div>
                            
                            <div class="content">
                                <h2 style="color: #333; margin-top: 0;">Hello!</h2>
                                <p>Thank you for signing up with Zyneth. To complete your registration, please use the verification code below:</p>
                                
                                <div class="otp-box">{otp_code}</div>
                                
                                <div class="instructions">
                                    <p><strong>📋 Instructions:</strong></p>
                                    <ol style="margin: 10px 0; padding-left: 20px;">
                                        <li>Enter the 6-digit code above in the verification form</li>
                                        <li>The code is valid for <strong>10 minutes</strong></li>
                                        <li>If you didn't request this code, please ignore this email</li>
                                    </ol>
                                </div>
                                
                                <p>If you have any issues, please contact our support team.</p>
                                
                                <p style="margin-top: 30px;">
                                    Best regards,<br>
                                    <strong>The Zyneth Team</strong>
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2025 Zyneth. All rights reserved.</p>
                                <p>This is an automated message, please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                }
                
                # Send email via Resend
                response = resend.Emails.send(params)
                print(f"✅ Email sent to {email} via Resend. Message ID: {response['id']}")
                return True
                
            except Exception as e:
                print(f"❌ Resend failed for {email}: {e}")
                # Fall through to console logging
        
        # Fallback to console logging for development
        print("\n" + "="*60)
        print(f"📧 OTP VERIFICATION CODE")
        print(f"📧 To: {email}")
        print(f"📧 From: Zyneth <no-reply@zyneth.shop>")
        print(f"📧 OTP CODE: {otp_code}")
        print(f"📧 (In production with RESEND_API_KEY, this would be sent via email)")
        print("="*60 + "\n")
        
        # Log to file for easy access during development
        try:
            with open("otp_logs.txt", "a") as f:
                timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                f.write(f"[{timestamp}] {email}: {otp_code}\n")
        except:
            pass
        
        return False  # Return False to indicate email wasn't really sent

# ========== OTP ENDPOINTS ==========

@router.post("/send-otp")
async def send_otp(
    email: str = Form(...),
    crud = Depends(get_user_crud),
    background_tasks: BackgroundTasks = None
):
    """
    Send OTP to user's email for verification.
    This should be called after signup or when user needs to verify email.
    """
    # Check if user exists
    user = await crud.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check if user is already verified
    if user.is_verified:
        return {
            "message": "Email is already verified",
            "email": email,
            "success": True
        }
    
    # Check if user is OTP locked
    if user.otp_locked_until and user.otp_locked_until > datetime.utcnow():
        time_left = int((user.otp_locked_until - datetime.utcnow()).total_seconds())
        return {
            "message": "Too many attempts. Please try again later.",
            "email": email,
            "success": False,
            "retry_after": time_left
        }
    
    # Generate and store OTP
    otp_code = await crud.generate_and_store_otp(email)
    if not otp_code:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate OTP"
        )
    
    # Send OTP via email (in background)
    if background_tasks:
        background_tasks.add_task(EmailService.send_otp_email, email, otp_code)
    else:
        await EmailService.send_otp_email(email, otp_code)
    
    return {
        "message": "OTP sent to your email",
        "email": email,
        "success": True
    }

@router.post("/verify-otp")
async def verify_otp(
    email: str = Form(...),
    otp_code: str = Form(...),
    crud = Depends(get_user_crud)
):
    """
    Verify OTP code.
    """
    result = await crud.verify_otp(email, otp_code)
    
    if not result["success"]:
        status_code = 400
        if result.get("locked"):
            status_code = 429  # Too Many Requests
        
        raise HTTPException(
            status_code=status_code,
            detail=result["message"]
        )
    
    return {
        "message": result["message"],
        "email": email,
        "success": True
    }

@router.post("/resend-otp")
async def resend_otp(
    email: str = Form(...),
    crud = Depends(get_user_crud),
    background_tasks: BackgroundTasks = None
):
    """
    Resend OTP to user's email.
    """
    # Check if user exists
    user = await crud.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check if user is already verified
    if user.is_verified:
        return {
            "message": "Email is already verified",
            "email": email,
            "success": True
        }
    
    # Check if user is OTP locked
    if user.otp_locked_until and user.otp_locked_until > datetime.utcnow():
        time_left = int((user.otp_locked_until - datetime.utcnow()).total_seconds())
        return {
            "message": "Too many attempts. Please try again later.",
            "email": email,
            "success": False,
            "retry_after": time_left
        }
    
    # Resend OTP
    otp_code = await crud.resend_otp(email)
    if not otp_code:
        raise HTTPException(
            status_code=500,
            detail="Failed to resend OTP"
        )
    
    # Send OTP via email (in background)
    if background_tasks:
        background_tasks.add_task(EmailService.send_otp_email, email, otp_code)
    else:
        await EmailService.send_otp_email(email, otp_code)
    
    return {
        "message": "New OTP sent to your email",
        "email": email,
        "success": True
    }

@router.get("/otp-status/{email}")
async def get_otp_status(
    email: str,
    crud = Depends(get_user_crud)
):
    """
    Get OTP verification status for a user.
    """
    status_data = await crud.check_otp_status(email)
    return status_data

# ========== MODIFIED SIGNUP ENDPOINT ==========

@router.post("/signup", response_model=UserOut)
async def signup(
    full_name: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    avatar: UploadFile = File(None),
    crud = Depends(get_user_crud),
    background_tasks: BackgroundTasks = None
):
    """
    User registration endpoint with OTP verification.
    All new users are registered as regular 'user' role by default.
    User must verify email with OTP before being able to login.
    """
    print("✅ SIGNUP ENDPOINT HIT!")
    
    # Confirm password match
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validate password strength
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Validate username format
    if not username.replace('_', '').isalnum():
        raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, and underscores")
    
    # Handle avatar upload
    avatar_url = None
    if avatar:
        allowed_exts = [".jpg", ".jpeg", ".png", ".gif"]
        ext = os.path.splitext(avatar.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, .png, .gif allowed")
        
        # Check file size (max 5MB)
        content = await avatar.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Avatar must be less than 5MB")
        
        # Reset file pointer
        avatar.file.seek(0)
        
        # Save file
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        avatar_url = f"/static/avatars/{filename}"
    
    # Normalize email
    email = email.lower().strip()
    username = username.strip()
    
    # Check if user already exists
    existing_email = await crud.get_user_by_email(email)
    existing_username = await crud.get_user_by_username(username)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create UserCreate object - All signups are regular 'user' role
    user_data = UserCreate(
        full_name=full_name.strip(),
        username=username,
        email=email,
        password=password,
        role=RoleEnum.user
    )
    
    # Create user using the existing create_user method
    user = await crud.create_user(user_data, avatar_url=avatar_url)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    print(f"✅ User Created Successfully: {user.username} ({user.email})")
    
    # Generate and send OTP
    otp_code = await crud.generate_and_store_otp(email)
    if otp_code:
        if background_tasks:
            background_tasks.add_task(EmailService.send_otp_email, email, otp_code)
        else:
            await EmailService.send_otp_email(email, otp_code)
    else:
        print(f"❌ Failed to generate OTP for {email}")
    
    return user

# ========== MODIFIED LOGIN ENDPOINT ==========

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    crud = Depends(get_user_crud)
):
    """
    User login endpoint.
    Users must verify email with OTP before being able to login.
    """
    identifier = form_data.username.strip()
    print(f"🔍 Login attempt with identifier: '{identifier}'")
    
    # Find user by email OR username
    user = await crud.get_user_by_identifier(identifier)
    
    if not user:
        print(f"❌ User not found for identifier: '{identifier}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    print(f"✅ User found: {user.username} ({user.email})")
    
    # Verify password
    if not verify_password(form_data.password, user.password_hash):
        print(f"❌ Invalid password for user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Ensure user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated. Contact admin."
        )
    
    # Check if user is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in."
        )
    
    # Update last login
    await crud.update_last_login(user.id)
    
    # Create token with 30-day expiration
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 30 * 24 * 60 * 60,  # 30 days in seconds
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "username": user.username,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    }

# ========== EXISTING ENDPOINTS (UNCHANGED) ==========

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """
    Get current user's profile.
    """
    return current_user

@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[RoleEnum] = None,
    is_active: Optional[bool] = None,
    crud = Depends(get_user_crud)
):
    """
    Admin-only: List all users with optional filters.
    """
    users = await crud.get_users(skip=skip, limit=limit, role=role, is_active=is_active)
    return users

@router.put("/me", response_model=UserOut)
async def update_profile(
    full_name: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    current_user = Depends(get_current_user),
    crud = Depends(get_user_crud)
):
    """
    Update current user's profile.
    """
    # Handle avatar upload if provided
    avatar_url = current_user.avatar_url
    if avatar:
        allowed_exts = [".jpg", ".jpeg", ".png", ".gif"]
        ext = os.path.splitext(avatar.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, .png, .gif allowed")
        
        # Check file size (max 5MB)
        content = await avatar.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Avatar must be less than 5MB")
        
        # Reset file pointer
        avatar.file.seek(0)
        
        # Save file
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        avatar_url = f"/static/avatars/{filename}"
    
    # Update user
    update_data = {}
    if full_name:
        update_data["full_name"] = full_name.strip()
    if username:
        update_data["username"] = username.strip()
    if avatar_url:
        update_data["avatar_url"] = avatar_url
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    updated_user = await crud.update_user(current_user.id, update_data)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    
    return updated_user

@router.post("/logout")
async def logout():
    """
    Logout endpoint - client should remove token from storage.
    """
    return {"message": "Successfully logged out - remove token from client storage"}

@router.put("/deactivate", dependencies=[Depends(require_admin)])
async def deactivate_user(
    user_id: str,
    crud = Depends(get_user_crud)
):
    """
    Admin-only: Deactivate a user account.
    """
    result = await crud.deactivate_user(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deactivated"}

@router.put("/activate", dependencies=[Depends(require_admin)])
async def activate_user(
    user_id: str,
    crud = Depends(get_user_crud)
):
    """
    Admin-only: Activate a deactivated user account.
    """
    result = await crud.activate_user(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} activated"}

# FIXED: Admin-only endpoint to create users with any role
@router.post("/admin/create", response_model=UserOut, dependencies=[Depends(require_admin)])
async def admin_create_user(
    user_data: AdminUserCreate,
    crud = Depends(get_user_crud)
):
    """
    Admin-only endpoint to create users with any role.
    """
    # Check if user already exists
    existing_email = await crud.get_user_by_email(user_data.email.lower())
    existing_username = await crud.get_user_by_username(user_data.username)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user = await crud.create_user(user_data)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    return user

# google OAuth endpoints
@router.get("/auth/google")
async def google_auth_redirect(state: Optional[str] = None):
    """Redirect to Google OAuth page"""
    auth_url = google_oauth.get_authorization_url(state)
    return {"auth_url": auth_url}

@router.post("/auth/google/callback", response_model=GoogleAuthResponse)
async def google_auth_callback(request: GoogleAuthRequest):
    """Handle Google OAuth callback - Ultra simplified"""
    try:
        db = await get_database()      
        users_collection = db.users
        
        # Get user info from Google
        user_info = await google_oauth.get_user_info_from_code(request.code)
        
        # Check if user exists by Google ID
        existing_user = await users_collection.find_one({
            "$or": [
                {"google_id": user_info["google_id"]},
                {"email": user_info["email"]}
            ]
        })
        
        now = datetime.utcnow()
        now_iso = now.isoformat()
        
        if existing_user:
            # Update user if they already exist
            update_data = {
                "last_login": now,
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"],
                "avatar_url": user_info.get("picture")
            }
            
            await users_collection.update_one(
                {"_id": existing_user["_id"]},
                {"$set": update_data}
            )
            
            # Use the existing user data
            user_dict = {
                "id": str(existing_user["_id"]),
                "full_name": existing_user.get("full_name", user_info["full_name"]),
                "username": existing_user.get("username", ""),
                "email": existing_user.get("email", user_info["email"]),
                "role": existing_user.get("role", "user"),  # Get as string
                "avatar_url": user_info.get("picture") or existing_user.get("avatar_url"),
                "created_at": existing_user.get("created_at", now).isoformat() if existing_user.get("created_at") else now_iso,
                "last_login": now_iso,
                "is_active": existing_user.get("is_active", True),
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"],
                "is_verified": existing_user.get("is_verified", True)
            }
            is_new_user = False
        else:
            # Generate username from email
            base_username = user_info["email"].split("@")[0]
            username = base_username
            counter = 1
            while await users_collection.find_one({"username": username}):
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create new user document
            new_user_doc = {
                "full_name": user_info["full_name"],
                "username": username,
                "email": user_info["email"],
                "password_hash": None,
                "role": "user",
                "avatar_url": user_info.get("picture"),
                "created_at": now,
                "last_login": now,
                "is_active": True,
                "is_verified": True,
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"]
            }
            
            # Insert new user
            result = await users_collection.insert_one(new_user_doc)
            
            # Create user dict
            user_dict = {
                "id": str(result.inserted_id),
                "full_name": user_info["full_name"],
                "username": username,
                "email": user_info["email"],
                "role": "user",
                "avatar_url": user_info.get("picture"),
                "created_at": now_iso,
                "last_login": now_iso,
                "is_active": True,
                "is_verified": True,
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"]
            }
            is_new_user = True
        
        # Generate JWT token
        token_data = {
            "sub": user_dict["id"],
            "email": user_dict["email"],
            "role": user_dict["role"],  # String role
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        
        jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
        access_token = jwt.encode(token_data, jwt_secret, algorithm="HS256")
        
        return GoogleAuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=7 * 24 * 60 * 60,
            is_new_user=is_new_user,
            user=user_dict
        )
        
    except Exception as e:
        import traceback
        print(f"Error in google_auth_callback: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.post("/users/auth/google/web", response_model=GoogleAuthResponse)  # Changed endpoint to match frontend
async def google_auth_web(request: GoogleAuthRequest):
    """
    Simplified Google OAuth for web frontend
    Accepts authorization code directly from frontend
    """
    try:
        # Get database - FIXED: Proper way to get database
        from ..db.mongodb import get_database  # Import here if needed
        db = await get_database()      
        users_collection = db.users
        
        # Get the auth code
        code = request.code
        
        # Get user info from Google using your existing google_oauth
        user_info = await google_oauth.get_user_info_from_code(code)
        
        # Find or create user in database
        existing_user = await users_collection.find_one({
            "$or": [
                {"google_id": user_info["google_id"]},
                {"email": user_info["email"]}
            ]
        })
        
        if existing_user:
            # Update user if they already exist
            update_data = {
                "last_login": datetime.utcnow(),
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"],
                "avatar_url": user_info.get("picture")
            }
            
            await users_collection.update_one(
                {"_id": existing_user["_id"]},
                {"$set": update_data}
            )
            
            updated_user = await users_collection.find_one({"_id": existing_user["_id"]})
            user_obj = UserOut.from_mongo(updated_user)
            is_new_user = False
        else:
            # Create new user
            base_username = user_info["email"].split("@")[0]
            username = base_username
            counter = 1
            while await users_collection.find_one({"username": username}):
                username = f"{base_username}{counter}"
                counter += 1
            
            new_user = {
                "full_name": user_info["full_name"],
                "username": username,
                "email": user_info["email"],
                "password_hash": None,
                "role": "user",
                "avatar_url": user_info.get("picture"),
                "is_active": True,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "google_id": user_info["google_id"],
                "is_google_account": True,
                "email_verified": user_info["email_verified"],
                "is_verified": True,
                "otp_code": None,
                "otp_created_at": None,
                "otp_attempts": 0,
                "otp_locked_until": None
            }
            
            result = await users_collection.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            user_obj = UserOut.from_mongo(new_user)
            is_new_user = True
        
        # Generate JWT token
        token_data = {
            "sub": str(user_obj.id),
            "email": user_obj.email,
            "role": user_obj.role,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        
        jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
        access_token = jwt.encode(token_data, jwt_secret, algorithm="HS256")
        
        return GoogleAuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=7 * 24 * 60 * 60,
            is_new_user=is_new_user,
            user=user_obj.dict()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Google authentication failed: {str(e)}"
        )
    
# routers/users.py - Add this endpoint
@router.get("/auth/google/check")
async def check_google_config():
    """Check Google OAuth configuration"""
    return {
        "client_id": os.getenv("GOOGLE_CLIENT_ID", "NOT SET"),
        "client_id_preview": f"{os.getenv('GOOGLE_CLIENT_ID', '')[:10]}..." if os.getenv("GOOGLE_CLIENT_ID") else "N/A",
        "has_client_secret": bool(os.getenv("GOOGLE_CLIENT_SECRET")),
        "redirect_uri": google_oauth.redirect_uri,
        "environment": os.getenv("ENVIRONMENT", "development"),
        "message": "Visit /auth/google/test-url to see the actual OAuth URL"
    }

@router.get("/auth/google/test-url")
async def test_google_url():
    """Generate a test Google OAuth URL"""
    auth_url = google_oauth.get_authorization_url()
    return {
        "auth_url": auth_url,
        "decoded_url": "Copy this URL and open in browser to test",
        "test_link": f'<a href="{auth_url}" target="_blank">Test Google OAuth</a>'
    }

@router.get("/auth/google/callback", response_class=HTMLResponse)
async def google_auth_callback_get(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state", "")

    # If user cancels or Google errors
    error = request.query_params.get("error")
    if error or not code:
        msg = error or "No code returned from Google"
        return HTMLResponse(f"""
        <script>
          if (window.opener) {{
            window.opener.postMessage({{
              type: "GOOGLE_AUTH_ERROR",
              message: "{msg}"
            }}, "*");
          }}
          window.close();
        </script>
        """)

    # Send code to opener (your signin.js is listening)
    return HTMLResponse(f"""
    <script>
      if (window.opener) {{
        window.opener.postMessage({{
          type: "GOOGLE_AUTH_SUCCESS",
          code: "{code}",
          state: "{state}"
        }}, "*");
      }}
      window.close();
    </script>
    """)