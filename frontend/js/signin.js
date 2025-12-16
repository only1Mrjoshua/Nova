// DOM Elements
const signinForm = document.getElementById('signinForm');
const googleSignInBtn = document.getElementById('googleSignIn');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('emailOrUsername');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const signinButton = document.querySelector('.btn-signin');

// Form Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(element, message) {
    element.textContent = message;
    element.style.opacity = '1';
    element.parentElement.querySelector('.input-with-icon input').classList.add('error');
    element.parentElement.querySelector('.input-with-icon input').classList.remove('success');
}

function clearError(element) {
    element.textContent = '';
    element.style.opacity = '0';
    element.parentElement.querySelector('.input-with-icon input').classList.remove('error');
}

function showSuccess(inputElement) {
    inputElement.classList.add('success');
    inputElement.classList.remove('error');
}

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const eyeIcon = this.querySelector('i');
    if (type === 'text') {
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});

// Real-time Validation
emailInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    if (value === '') {
        clearError(emailError);
        this.classList.remove('error', 'success');
        return;
    }
    
    // Check if input is email or username
    if (value.includes('@')) {
        if (validateEmail(value)) {
            clearError(emailError);
            showSuccess(this);
        } else {
            showError(emailError, 'Please enter a valid email address');
        }
    } else {
        if (validateUsername(value)) {
            clearError(emailError);
            showSuccess(this);
        } else {
            showError(emailError, 'Username must be 3-20 characters (letters, numbers, underscores)');
        }
    }
});

passwordInput.addEventListener('input', function() {
    const value = this.value;
    
    if (value === '') {
        clearError(passwordError);
        this.classList.remove('error', 'success');
        return;
    }
    
    if (validatePassword(value)) {
        clearError(passwordError);
        showSuccess(this);
    } else {
        showError(passwordError, 'Password must be at least 8 characters long');
    }
});

// Form Submission
signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const emailOrUsername = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Reset errors
    clearError(emailError);
    clearError(passwordError);
    
    // Validate email/username
    let isValid = true;
    
    if (emailOrUsername === '') {
        showError(emailError, 'Email or username is required');
        emailInput.classList.add('error');
        isValid = false;
    } else if (emailOrUsername.includes('@')) {
        if (!validateEmail(emailOrUsername)) {
            showError(emailError, 'Please enter a valid email address');
            emailInput.classList.add('error');
            isValid = false;
        }
    } else {
        if (!validateUsername(emailOrUsername)) {
            showError(emailError, 'Username must be 3-20 characters (letters, numbers, underscores)');
            emailInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Validate password
    if (password === '') {
        showError(passwordError, 'Password is required');
        passwordInput.classList.add('error');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError(passwordError, 'Password must be at least 8 characters long');
        passwordInput.classList.add('error');
        isValid = false;
    }
    
    if (!isValid) {
        // Add shake animation to form
        signinForm.classList.add('shake');
        setTimeout(() => {
            signinForm.classList.remove('shake');
        }, 500);
        return;
    }
    
    // Simulate form submission
    simulateSignIn(emailOrUsername, password, rememberMe);
});

// Simulate Sign In (Replace with actual API call)
function simulateSignIn(emailOrUsername, password, rememberMe) {
    // Show loading state
    const originalText = signinButton.querySelector('span').textContent;
    signinButton.querySelector('span').textContent = 'Signing in...';
    signinButton.classList.add('loading');
    signinButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button state
        signinButton.querySelector('span').textContent = originalText;
        signinButton.classList.remove('loading');
        signinButton.disabled = false;
        
        // For demo purposes, always show success
        // In real implementation, you would check the response from your server
        showSuccessMessage();
        
        // In a real app, you would redirect or update UI based on server response
        // window.location.href = '/dashboard';
        
    }, 1500);
}

// Show success message
function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div style="
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
            padding: 15px 20px;
            border-radius: 12px;
            border: 1px solid rgba(16, 185, 129, 0.3);
            margin-top: 20px;
            text-align: center;
            animation: fadeInUp 0.5s ease-out;
        ">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            Successfully signed in! Redirecting to dashboard...
        </div>
    `;
    
    // Insert after form
    signinForm.parentNode.insertBefore(successMessage, signinForm.nextSibling);
    
    // Remove any existing success message
    setTimeout(() => {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }, 3000);
}

// Google Sign-In Placeholder
googleSignInBtn.addEventListener('click', function() {
    // Show loading state
    const originalText = this.querySelector('span').textContent;
    this.querySelector('span').textContent = 'Connecting to Google...';
    this.disabled = true;
    
    // Simulate Google sign-in process
    setTimeout(() => {
        this.querySelector('span').textContent = originalText;
        this.disabled = false;
        
        // In a real implementation, you would integrate with Google OAuth
        // This is just a placeholder
        alert('Google sign-in would be implemented here. In a real app, this would redirect to Google OAuth.');
        
        // Example of what you might do:
        // window.location.href = 'https://accounts.google.com/o/oauth2/auth?...';
        
    }, 1000);
});

// Add input focus effects
const inputs = document.querySelectorAll('.input-with-icon input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Form accessibility improvements
signinForm.addEventListener('keydown', function(e) {
    // Submit form with Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        this.dispatchEvent(new Event('submit'));
    }
});

// Remember me functionality
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Update localStorage when remember me is checked
document.getElementById('rememberMe').addEventListener('change', function() {
    if (!this.checked) {
        localStorage.removeItem('rememberedEmail');
    }
});

// Simulate saving email when form is successfully submitted
function saveRememberedEmail(email) {
    if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('rememberedEmail', email);
    }
}

// Modify the simulateSignIn function to save email
function simulateSignIn(emailOrUsername, password, rememberMe) {
    // Show loading state
    const originalText = signinButton.querySelector('span').textContent;
    signinButton.querySelector('span').textContent = 'Signing in...';
    signinButton.classList.add('loading');
    signinButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button state
        signinButton.querySelector('span').textContent = originalText;
        signinButton.classList.remove('loading');
        signinButton.disabled = false;
        
        // Save email if "Remember me" is checked
        if (rememberMe && emailOrUsername.includes('@')) {
            saveRememberedEmail(emailOrUsername);
        }
        
        // Show success message
        showSuccessMessage();
        
    }, 1500);
}

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add focus to email/username field if empty
    if (!emailInput.value) {
        emailInput.focus();
    }
    
    // Log for debugging
    console.log('Sign-in page initialized successfully');
});

// Configuration
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://price-pulse-backend-ttv4.onrender.com';
const LOGIN_ENDPOINT = `${API_BASE_URL}/users/login`;

// Toast Notification System
class ToastNotification {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', title = '', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));

        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    }

    hide(toast) {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 300);
    }

    success(message, title = 'Success!') {
        return this.show(message, 'success', title);
    }

    error(message, title = 'Error!') {
        return this.show(message, 'error', title);
    }

    warning(message, title = 'Warning!') {
        return this.show(message, 'warning', title);
    }

    info(message, title = 'Info') {
        return this.show(message, 'info', title);
    }
}

// Initialize toast system
const toast = new ToastNotification();

// Loading Overlay
class LoadingOverlay {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Signing you in...</div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(text = 'Signing you in...') {
        this.overlay.querySelector('.loading-text').textContent = text;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

const loadingOverlay = new LoadingOverlay();

// Form Validator
class FormValidator {
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validatePassword(password) {
        return password.length >= 1;
    }

    validateIdentifier(identifier) {
        return identifier.length >= 1;
    }
}

const validator = new FormValidator();

// Main Signin Handler
class SigninHandler {
    constructor() {
        this.form = document.getElementById('signinForm');
        this.signinBtn = document.querySelector('.btn-signin');
        this.googleBtn = document.getElementById('googleSignIn');
        
        this.initializeEventListeners();
        this.initializeRealTimeValidation();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
        
        // Google sign-in
        if (this.googleBtn) {
            this.googleBtn.addEventListener('click', () => this.handleGoogleSignin());
        }
        
        // Clear errors on input
        this.initializeInputClearing();
    }

    initializeRealTimeValidation() {
        // Identifier validation
        const identifierInput = document.getElementById('emailOrUsername');
        if (identifierInput) {
            identifierInput.addEventListener('blur', () => {
                const identifier = identifierInput.value.trim();
                if (!identifier) {
                    validator.showError('emailError', 'Email or username is required');
                } else {
                    validator.clearError('emailError');
                }
            });
        }

        // Password validation
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('blur', () => {
                const password = passwordInput.value;
                if (!password) {
                    validator.showError('passwordError', 'Password is required');
                } else {
                    validator.clearError('passwordError');
                }
            });
        }
    }

    initializeInputClearing() {
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const errorId = input.id + 'Error';
                validator.clearError(errorId);
            });
        });
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('togglePassword');
        
        if (passwordInput && toggleButton) {
            const icon = toggleButton.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    validateForm() {
        let isValid = true;
        
        // Get form values
        const identifier = document.getElementById('emailOrUsername').value.trim();
        const password = document.getElementById('password').value;
        
        // Clear previous errors
        validator.clearError('emailError');
        validator.clearError('passwordError');
        
        // Validate identifier
        if (!identifier) {
            validator.showError('emailError', 'Email or username is required');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            validator.showError('passwordError', 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Disable submit button and show loading state
        this.setLoading(true);
        
        try {
            // Get form data
            const identifier = document.getElementById('emailOrUsername').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            console.log('Sending login request to:', LOGIN_ENDPOINT);
            console.log('Login data:', { identifier, rememberMe });
            
            // Prepare form data for OAuth2PasswordRequestForm
            const formData = new URLSearchParams();
            formData.append('username', identifier); // OAuth2PasswordRequestForm expects 'username'
            formData.append('password', password);
            formData.append('grant_type', 'password'); // Required for OAuth2
            formData.append('scope', '');
            formData.append('client_id', '');
            formData.append('client_secret', '');
            
            // Show loading overlay
            loadingOverlay.show();
            
            // Send request to backend
            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            console.log('Response status:', response.status);
            
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Server returned invalid response');
            }
            
            if (response.ok) {
                // Success
                console.log('Login successful!', data);
                this.handleSuccess(data, rememberMe);
            } else {
                // Error from backend
                console.error('Login failed:', data);
                const errorMessage = data.detail || 
                                    data.message || 
                                    data.error || 
                                    `Login failed (Status: ${response.status})`;
                this.handleError(errorMessage);
            }
        } catch (error) {
            // Network or other errors
            console.error('Login error:', error);
            this.handleError(error.message || 'Network error. Please check your connection.');
        } finally {
            // Hide loading overlay
            loadingOverlay.hide();
            this.setLoading(false);
        }
    }

    handleSuccess(data, rememberMe) {
        // Store user data and token
        if (data && data.user) {
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('token', data.access_token);
            
            // Store token expiration
            if (data.expires_in) {
                const expiresAt = Date.now() + (data.expires_in * 1000);
                localStorage.setItem('token_expires_at', expiresAt.toString());
            }
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('rememberedEmail', data.user.email || '');
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('rememberedEmail');
            }
            
            console.log('✅ User data stored:', data.user);
            console.log('✅ Token stored:', data.access_token.substring(0, 20) + '...');
            console.log('✅ User role:', data.user.role);
            
            // Show success message
            toast.success(
                'Login successful! Redirecting...',
                'Welcome Back!'
            );
            
            // Reset form
            this.form.reset();
            
            // Clear all error messages
            document.querySelectorAll('.error-message').forEach(error => {
                error.textContent = '';
            });
            
            // Reset password visibility
            const passwordInput = document.getElementById('password');
            const toggleButton = document.getElementById('togglePassword');
            if (passwordInput) passwordInput.type = 'password';
            if (toggleButton) {
                const icon = toggleButton.querySelector('i');
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
            
            // Add success animation to form
            this.form.classList.add('success-pulse');
            
            // Determine redirect URL based on user role
            let redirectUrl = 'dashboard.html'; // Default for regular users
            
            if (data.user.role === 'admin') {
                redirectUrl = 'admin-dashboard.html';
                console.log('✅ Admin user detected, redirecting to admin dashboard');
            } else if (data.user.role === 'user') {
                console.log('✅ Regular user detected, redirecting to user dashboard');
            } else {
                console.log(`⚠️ Unknown role: ${data.user.role}, defaulting to user dashboard`);
            }
            
            console.log(`✅ Redirecting to: ${redirectUrl}`);
            
            // Redirect based on role
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            this.handleError('Invalid response from server');
        }
    }

    handleError(errorMessage) {
        console.error('Login error:', errorMessage);
        toast.error(errorMessage, 'Login Failed');
        
        // Highlight form for attention
        this.form.classList.add('shake');
        setTimeout(() => {
            this.form.classList.remove('shake');
        }, 500);
        
        // Clear password field on error
        document.getElementById('password').value = '';
    }

    handleGoogleSignin() {
        toast.info('Google sign-in will be available soon!', 'Coming Soon');
        // Implement Google OAuth here when ready
    }

    setLoading(isLoading) {
        const button = this.signinBtn;
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span>Signing In...</span>';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
            button.style.opacity = '1';
        }
        
        // Also disable Google button
        if (this.googleBtn) {
            this.googleBtn.disabled = isLoading;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SigninHandler();
    
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = localStorage.getItem('user');
    
    if (isAuthenticated === 'true' && user) {
        // Check token expiration
        const expiresAt = localStorage.getItem('token_expires_at');
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
            // Token expired
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('token_expires_at');
            console.log('Token expired, user logged out');
        } else {
            // User is already logged in, determine where to redirect
            try {
                const userData = JSON.parse(user);
                let redirectUrl = 'dashboard.html';
                
                if (userData.role === 'admin') {
                    redirectUrl = 'admin-dashboard.html';
                }
                
                console.log('User already logged in, redirecting to:', redirectUrl);
                
                // Show notification
                const toast = new ToastNotification();
                toast.info('You are already logged in. Redirecting...', 'Info');
                
                // Redirect
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
    
    // Auto-fill email if remember me was checked
    const rememberMe = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    
    if (rememberMe === 'true' && rememberedEmail) {
        const emailInput = document.getElementById('emailOrUsername');
        if (emailInput) {
            emailInput.value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
});

// Add CSS for toast notifications and loading overlay
const style = document.createElement('style');
style.textContent = `
    /* Toast Notification Styles */
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
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        opacity: 0;
        animation: slideIn 0.3s forwards;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    }
    
    .toast.success {
        border-left-color: #10B981;
    }
    
    .toast.error {
        border-left-color: #EF4444;
    }
    
    .toast.warning {
        border-left-color: #F59E0B;
    }
    
    .toast.info {
        border-left-color: #3B82F6;
    }
    
    .toast-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .toast.success .toast-icon {
        color: #10B981;
    }
    
    .toast.error .toast-icon {
        color: #EF4444;
    }
    
    .toast.warning .toast-icon {
        color: #F59E0B;
    }
    
    .toast.info .toast-icon {
        color: #3B82F6;
    }
    
    .toast-content {
        flex: 1;
    }
    
    .toast-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--light);
        font-size: 1rem;
    }
    
    .toast-message {
        font-size: 0.9rem;
        color: var(--light-gray);
        line-height: 1.4;
    }
    
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
    
    .toast-close:hover {
        color: var(--light);
    }
    
    @keyframes slideIn {
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .toast.hide {
        animation: slideOut 0.3s forwards;
    }
    
    /* Loading Overlay */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 31, 68, 0.95);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9998;
        flex-direction: column;
        gap: 20px;
        backdrop-filter: blur(5px);
    }
    
    .loading-overlay.active {
        display: flex;
    }
    
    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 215, 0, 0.1);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .loading-text {
        color: var(--light);
        font-size: 1.2rem;
        font-weight: 500;
    }
    
    /* Animations */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes successPulse {
        0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
    }
    
    .success-pulse {
        animation: successPulse 1.5s infinite;
    }
    
    /* Responsive toast */
    @media (max-width: 768px) {
        .toast-container {
            top: 80px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        .toast {
            padding: 14px 16px;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
        }
        
        .loading-text {
            font-size: 1rem;
        }
    }
`;
document.head.appendChild(style);