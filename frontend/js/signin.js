/* =========================
   CONFIG
========================= */
const host = window.location.hostname;

const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "0.0.0.0" ||
  host === "::1" ||
  host.endsWith(".local");

const API_BASE_URL = isLocal
  ? "http://localhost:8000"
  : "https://zyneth-backend.onrender.com";

const LOGIN_ENDPOINT = `${API_BASE_URL}/users/login`;
const ME_ENDPOINT = `${API_BASE_URL}/users/me`;
const GOOGLE_AUTH_URL_ENDPOINT = `${API_BASE_URL}/auth/google/url`;
const GOOGLE_EXCHANGE_ENDPOINT = `${API_BASE_URL}/auth/google/exchange`;
const FRONTEND_OAUTH_CALLBACK = isLocal 
  ? "http://localhost:5500/frontend/oauth-callback.html" 
  : "https://zyneth.shop/oauth-callback.html";

/* =========================
   DOM ELEMENTS
========================= */
const signinForm = document.getElementById("signinForm");
const googleSignInBtn = document.getElementById("googleSignIn");
const togglePasswordBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("emailOrUsername");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const signinButton = document.querySelector(".btn-signin");

/* =========================
   TOAST NOTIFICATIONS
========================= */
class ToastNotification {
  constructor() {
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  }

  show(message, type = "info", title = "", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "fa-check-circle",
      error: "fa-times-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };

    toast.innerHTML = `
      <i class="fas ${icons[type]} toast-icon"></i>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ""}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => this.hide(toast));
    this.container.appendChild(toast);

    if (duration > 0) setTimeout(() => this.hide(toast), duration);
    return toast;
  }

  hide(toast) {
    toast.classList.add("hide");
    setTimeout(() => {
      if (toast.parentNode === this.container) this.container.removeChild(toast);
    }, 300);
  }

  success(message, title = "Success!") {
    return this.show(message, "success", title);
  }
  error(message, title = "Error!") {
    return this.show(message, "error", title);
  }
  info(message, title = "Info") {
    return this.show(message, "info", title);
  }
}

const toast = new ToastNotification();

/* =========================
   LOADING OVERLAY
========================= */
class LoadingOverlay {
  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "loading-overlay";
    this.overlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Signing you in...</div>
    `;
    document.body.appendChild(this.overlay);
  }

  show(text = "Signing you in...") {
    this.overlay.querySelector(".loading-text").textContent = text;
    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  hide() {
    this.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

const loadingOverlay = new LoadingOverlay();

/* =========================
   VALIDATION HELPERS
========================= */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePassword(password) {
  return password.length >= 1;
}

function showError(element, message) {
  element.textContent = message;
  element.style.opacity = "1";
  element.parentElement.querySelector(".input-with-icon input")?.classList.add("error");
  element.parentElement.querySelector(".input-with-icon input")?.classList.remove("success");
}

function clearError(element) {
  element.textContent = "";
  element.style.opacity = "0";
  element.parentElement.querySelector(".input-with-icon input")?.classList.remove("error");
}

function showSuccess(inputElement) {
  inputElement.classList.add("success");
  inputElement.classList.remove("error");
}

/* =========================
   AUTH HELPERS
========================= */
function clearAuthStorage() {
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("token");
  localStorage.removeItem("token_expires_at");
}

function getRedirectUrlByRole(role) {
  return role === "admin" ? "admin-dashboard.html" : "dashboard.html";
}

async function validateTokenWithBackend(token) {
  const res = await fetch(ME_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return await res.json();
}

/* =========================
   GOOGLE OAUTH HANDLER - UPDATED
========================= */
class GoogleAuthHandler {
  constructor() {
    this.googleBtn = googleSignInBtn;
    this.isProcessing = false;
    
    if (this.googleBtn) {
      this.googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.initiateGoogleSignIn();
      });
    }
  }
  
  async initiateGoogleSignIn() {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      
      // Disable button during process
      if (this.googleBtn) {
        this.googleBtn.disabled = true;
        this.googleBtn.innerHTML = '<i class="fab fa-google fa-spin"></i><span>Connecting to Google...</span>';
        this.googleBtn.classList.add('disabled');
      }
      
      // Show loading overlay
      loadingOverlay.show("Connecting to Google...");
      
      console.log("Fetching Google OAuth URL from backend...");
      
      // Step 1: Get Google OAuth URL from backend
      const response = await fetch(GOOGLE_AUTH_URL_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to get Google OAuth URL: ${response.status}`);
      }
      
      const data = await response.json();
      const authUrl = data.auth_url;
      
      if (!authUrl) {
        throw new Error("No auth URL received from backend");
      }
      
      console.log("Google OAuth URL received, redirecting user...");
      
      // Step 2: Redirect user to Google OAuth URL
      // Google will redirect back to FRONTEND_OAUTH_CALLBACK
      setTimeout(() => {
        window.location.href = authUrl;
      }, 500);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to initiate Google sign-in', 'Google Sign-In Error');
      
      // Re-enable button
      this.resetGoogleButton();
      loadingOverlay.hide();
    }
  }
  
  resetGoogleButton() {
    this.isProcessing = false;
    if (this.googleBtn) {
      this.googleBtn.disabled = false;
      this.googleBtn.innerHTML = '<i class="fab fa-google"></i><span>Sign in with Google</span>';
      this.googleBtn.classList.remove('disabled');
    }
  }
}

/* =========================
   UI LISTENERS
========================= */
// Toggle password
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const eyeIcon = this.querySelector("i");
    if (!eyeIcon) return;

    if (type === "text") {
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });
}

// Real-time validation
if (emailInput) {
  emailInput.addEventListener("input", function () {
    const value = this.value.trim();
    if (!value) {
      if (emailError) clearError(emailError);
      this.classList.remove("error", "success");
      return;
    }

    if (value.includes("@")) {
      if (validateEmail(value)) {
        if (emailError) clearError(emailError);
        showSuccess(this);
      } else {
        if (emailError) showError(emailError, "Please enter a valid email address");
      }
    } else {
      if (validateUsername(value)) {
        if (emailError) clearError(emailError);
        showSuccess(this);
      } else {
        if (emailError) showError(emailError, "Username must be 3-20 characters (letters, numbers, underscores)");
      }
    }
  });
}

if (passwordInput) {
  passwordInput.addEventListener("input", function () {
    const value = this.value;
    if (!value) {
      if (passwordError) clearError(passwordError);
      this.classList.remove("error", "success");
      return;
    }

    if (validatePassword(value)) {
      if (passwordError) clearError(passwordError);
      showSuccess(this);
    } else {
      if (passwordError) showError(passwordError, "Password is required");
    }
  });
}

// Remember me autofill
window.addEventListener("load", function () {
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  const rememberMe = localStorage.getItem("rememberMe");
  const rememberMeCheckbox = document.getElementById("rememberMe");
  
  if (rememberMe === "true" && rememberedEmail && emailInput && rememberMeCheckbox) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }
});

const rememberMeCheckbox = document.getElementById("rememberMe");
if (rememberMeCheckbox) {
  rememberMeCheckbox.addEventListener("change", function () {
    if (!this.checked) {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }
  });
}

// Input focus effect
document.querySelectorAll(".input-with-icon input").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.02)";
  });

  input.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
});

// Ctrl+Enter submit
if (signinForm) {
  signinForm.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      this.dispatchEvent(new Event("submit"));
    }
  });
}

/* =========================
   MAIN SIGNIN HANDLER
========================= */
class SigninHandler {
  constructor() {
    this.form = signinForm;
    this.signinBtn = signinButton;

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  validateForm() {
    let ok = true;

    const identifier = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (emailError) clearError(emailError);
    if (passwordError) clearError(passwordError);

    if (!identifier) {
      if (emailError) showError(emailError, "Email or username is required");
      ok = false;
    }

    if (!password) {
      if (passwordError) showError(passwordError, "Password is required");
      ok = false;
    }

    return ok;
  }

  setLoading(isLoading) {
    if (!this.signinBtn) return;

    if (isLoading) {
      this.signinBtn.disabled = true;
      this.signinBtn.innerHTML = "<span>Signing In...</span>";
      this.signinBtn.style.opacity = "0.7";
    } else {
      this.signinBtn.disabled = false;
      this.signinBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
      this.signinBtn.style.opacity = "1";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) return;

    this.setLoading(true);
    loadingOverlay.show();

    try {
      const identifier = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const rememberMeCheckbox = document.getElementById("rememberMe");
      const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

      // OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append("username", identifier);
      formData.append("password", password);

      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        // If backend is down or returns HTML
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        const msg = data?.detail || data?.message || data?.error || `Login failed (Status: ${response.status})`;
        throw new Error(msg);
      }

      // Success: must have token + user
      if (!data?.access_token || !data?.user) {
        throw new Error("Invalid login response from server");
      }

      // Save auth
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      if (data.expires_in) {
        const expiresAt = Date.now() + data.expires_in * 1000;
        localStorage.setItem("token_expires_at", String(expiresAt));
      } else {
        localStorage.removeItem("token_expires_at");
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", data.user.email || identifier);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Login successful! Redirecting...", "Welcome Back!");

      const redirectUrl = getRedirectUrlByRole(data.user.role);

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
    } catch (err) {
      // If backend is down or wrong credentials
      clearAuthStorage();
      toast.error(err.message || "Network error. Please try again.", "Login Failed");

      // shake
      if (this.form) {
        this.form.classList.add("shake");
        setTimeout(() => this.form.classList.remove("shake"), 500);
      }

      if (passwordInput) passwordInput.value = "";
    } finally {
      loadingOverlay.hide();
      this.setLoading(false);
    }
  }
}

/* =========================
   INITIALIZATION
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Sign-in page loaded");
  
  // Check for error parameters in URL (from Google callback failure)
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  const message = urlParams.get('message');
  
  if (error) {
    const errorMessages = {
      'google_auth_failed': 'Google authentication failed. Please try again.',
      'no_auth_code': 'Authentication code missing. Please try again.',
      'invalid_state': 'Security validation failed. Please try again.',
      'server_error': 'Server error occurred. Please try again.',
      'oauth_not_configured': 'Google OAuth is not configured. Please contact support.'
    };
    
    toast.error(
      errorMessages[error] || message || 'Authentication failed',
      'Sign-In Error'
    );
    
    // Clear error from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Focus email field
  if (emailInput && !emailInput.value) emailInput.focus();

  // Initialize handlers
  new SigninHandler();
  new GoogleAuthHandler();  // Initialize Google OAuth handler
  
  console.log("Handlers initialized");

  const token = localStorage.getItem("token");
  if (!token) return;

  // check expiration quickly
  const expiresAt = localStorage.getItem("token_expires_at");
  if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
    clearAuthStorage();
    return;
  }

  try {
    const userData = await validateTokenWithBackend(token);
    if (!userData) throw new Error("Invalid token");

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");

    toast.info("You are already logged in. Redirecting...", "Info");

    setTimeout(() => {
      window.location.href = getRedirectUrlByRole(userData.role);
    }, 600);
  } catch {
    clearAuthStorage();
  }
});

/* =========================
   STYLES (toast + overlay + animations)
========================= */
const style = document.createElement("style");
style.textContent = `
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
}

.toast {
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.95);
  border-left: 4px solid;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateX(100%);
  opacity: 0;
  animation: slideIn 0.3s forwards;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.toast.success { border-left-color: #10B981; }
.toast.error { border-left-color: #EF4444; }
.toast.warning { border-left-color: #F59E0B; }
.toast.info { border-left-color: #3B82F6; }

.toast-icon { font-size: 1.2rem; flex-shrink: 0; }
.toast.success .toast-icon { color: #10B981; }
.toast.error .toast-icon { color: #EF4444; }
.toast.info .toast-icon { color: #3B82F6; }

.toast-content { flex: 1; }
.toast-title { font-weight: 600; margin-bottom: 4px; color: var(--light); font-size: 1rem; }
.toast-message { font-size: 0.9rem; color: var(--light-gray); line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.toast-close:hover { color: var(--light); }

@keyframes slideIn { to { transform: translateX(0); opacity: 1; } }
@keyframes slideOut { to { transform: translateX(100%); opacity: 0; } }
.toast.hide { animation: slideOut 0.3s forwards; }

.loading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(10, 31, 68, 0.95);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(5px);
}
.loading-overlay.active { display: flex; }

.loading-spinner {
  width: 60px; height: 60px;
  border: 4px solid rgba(255, 215, 0, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text { color: var(--light); font-size: 1.2rem; font-weight: 500; }

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes shake {
  0%,100% { transform: translateX(0); }
  10%,30%,50%,70%,90% { transform: translateX(-5px); }
  20%,40%,60%,80% { transform: translateX(5px); }
}
.shake { animation: shake 0.5s ease-in-out; }

/* Google button loading state */
.btn-google.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-google.disabled i.fa-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .toast-container { top: 80px; right: 10px; left: 10px; max-width: none; }
  .toast { padding: 14px 16px; }
  .loading-spinner { width: 50px; height: 50px; }
  .loading-text { font-size: 1rem; }
}
`;
document.head.appendChild(style);