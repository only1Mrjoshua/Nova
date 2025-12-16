document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signupForm = document.getElementById('signupForm');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const signupBtn = document.getElementById('signupBtn');
    const termsCheckbox = document.getElementById('terms');
    
    // Form Fields
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Error Elements
    const fullNameError = document.getElementById('fullNameError');
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    // Validation patterns
    const patterns = {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };
    
    // Initialize
    initSignupPage();
    
    function initSignupPage() {
        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Toggle password visibility
        togglePasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, this);
        });
        
        toggleConfirmPasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, this);
        });
        
        // Real-time validation
        fullNameInput.addEventListener('input', validateFullName);
        usernameInput.addEventListener('input', validateUsername);
        emailInput.addEventListener('input', validateEmail);
        passwordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        
        // Google Sign Up button
        googleSignupBtn.addEventListener('click', handleGoogleSignup);
        
        // Form submission
        signupForm.addEventListener('submit', handleSignup);
        
        // Terms checkbox validation
        termsCheckbox.addEventListener('change', function() {
            updateSignupButtonState();
        });
        
        // Initialize button state
        updateSignupButtonState();
    }
    
    function togglePasswordVisibility(passwordField, toggleButton) {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Update icon
        const icon = toggleButton.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    function validateFullName() {
        const value = fullNameInput.value.trim();
        const parent = fullNameInput.closest('.input-with-icon');
        
        if (!value) {
            showError(fullNameError, 'Full name is required');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        if (value.length < 2) {
            showError(fullNameError, 'Name must be at least 2 characters');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        clearError(fullNameError);
        parent.classList.remove('error');
        parent.classList.add('success');
        updateSignupButtonState();
        return true;
    }
    
    function validateUsername() {
        const value = usernameInput.value.trim();
        const parent = usernameInput.closest('.input-with-icon');
        
        if (!value) {
            showError(usernameError, 'Username is required');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        if (!patterns.username.test(value)) {
            showError(usernameError, 'Username must be 3-20 characters (letters, numbers, underscores only)');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        clearError(usernameError);
        parent.classList.remove('error');
        parent.classList.add('success');
        updateSignupButtonState();
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        const parent = emailInput.closest('.input-with-icon');
        
        if (!value) {
            showError(emailError, 'Email is required');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        if (!patterns.email.test(value)) {
            showError(emailError, 'Please enter a valid email address');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        clearError(emailError);
        parent.classList.remove('error');
        parent.classList.add('success');
        updateSignupButtonState();
        return true;
    }
    
    function validatePassword() {
        const value = passwordInput.value;
        const parent = passwordInput.closest('.input-with-icon');
        
        if (!value) {
            showError(passwordError, 'Password is required');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        if (!patterns.password.test(value)) {
            showError(passwordError, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        clearError(passwordError);
        parent.classList.remove('error');
        parent.classList.add('success');
        
        // Also validate confirm password if it has value
        if (confirmPasswordInput.value) {
            validateConfirmPassword();
        }
        
        updateSignupButtonState();
        return true;
    }
    
    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        const parent = confirmPasswordInput.closest('.input-with-icon');
        
        if (!value) {
            showError(confirmPasswordError, 'Please confirm your password');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        if (value !== passwordInput.value) {
            showError(confirmPasswordError, 'Passwords do not match');
            parent.classList.add('error');
            parent.classList.remove('success');
            return false;
        }
        
        clearError(confirmPasswordError);
        parent.classList.remove('error');
        parent.classList.add('success');
        updateSignupButtonState();
        return true;
    }
    
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    function clearError(errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    function updateSignupButtonState() {
        const isFormValid = 
            validateFullName() && 
            validateUsername() && 
            validateEmail() && 
            validatePassword() && 
            validateConfirmPassword() &&
            termsCheckbox.checked;
        
        signupBtn.disabled = !isFormValid;
        signupBtn.style.opacity = isFormValid ? '1' : '0.7';
        signupBtn.style.cursor = isFormValid ? 'pointer' : 'not-allowed';
    }
    
    function handleGoogleSignup(e) {
        e.preventDefault();
        
        // Add loading state
        googleSignupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Redirecting to Google...</span>';
        googleSignupBtn.disabled = true;
        
        // Simulate Google OAuth redirect (replace with actual OAuth implementation)
        setTimeout(() => {
            alert('Google Sign Up functionality would redirect to Google OAuth here.\n\nIn a real implementation, this would:\n1. Redirect to Google OAuth page\n2. Handle callback with user data\n3. Create/authenticate user account');
            
            // Reset button
            googleSignupBtn.innerHTML = '<i class="fab fa-google"></i><span>Sign up with Google</span>';
            googleSignupBtn.disabled = false;
        }, 1000);
    }
    
    function handleSignup(e) {
        e.preventDefault();
        
        // Validate all fields
        const isFullNameValid = validateFullName();
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsAccepted = termsCheckbox.checked;
        
        if (!isFullNameValid || !isUsernameValid || !isEmailValid || 
            !isPasswordValid || !isConfirmPasswordValid || !isTermsAccepted) {
            
            // Shake form for visual feedback
            signupForm.classList.add('shake');
            setTimeout(() => {
                signupForm.classList.remove('shake');
            }, 500);
            
            return;
        }
        
        // Show loading state
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Creating Account...</span>';
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Success simulation
            signupBtn.innerHTML = '<i class="fas fa-check"></i><span>Account Created!</span>';
            signupBtn.classList.remove('loading');
            signupBtn.style.backgroundColor = 'var(--success)';
            
            // Show success message and redirect
            setTimeout(() => {
                alert('Account created successfully! Redirecting to dashboard...');
                // In real implementation, redirect to dashboard or verification page
                // window.location.href = 'dashboard.html';
            }, 500);
        }, 2000);
    }
    
    // Additional validation on blur
    fullNameInput.addEventListener('blur', validateFullName);
    usernameInput.addEventListener('blur', validateUsername);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
});

// Configuration
const API_BASE_URL = 'http://localhost:8000';
const SIGNUP_ENDPOINT = `${API_BASE_URL}/users/signup`;

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
}

// Initialize toast system
const toast = new ToastNotification();

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

    validateUsername(username) {
        const regex = /^[a-zA-Z0-9_]+$/;
        return regex.test(username);
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateConfirmPassword(password, confirmPassword) {
        return password === confirmPassword;
    }
}

const validator = new FormValidator();

// Main Signup Handler
class SignupHandler {
    constructor() {
        this.form = document.getElementById('signupForm');
        this.signupBtn = document.getElementById('signupBtn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password'));
        }
        
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
        }
        
        // Real-time validation
        this.initializeRealTimeValidation();
    }

    initializeRealTimeValidation() {
        // Username validation
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => {
                const username = usernameInput.value.trim();
                if (username && !validator.validateUsername(username)) {
                    validator.showError('usernameError', 'Only letters, numbers, and underscores allowed');
                } else {
                    validator.clearError('usernameError');
                }
            });
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const email = emailInput.value.trim();
                if (email && !validator.validateEmail(email)) {
                    validator.showError('emailError', 'Please enter a valid email');
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
                if (password && !validator.validatePassword(password)) {
                    validator.showError('passwordError', 'Password must be at least 6 characters');
                } else {
                    validator.clearError('passwordError');
                }
            });
        }

        // Confirm password validation
        const confirmInput = document.getElementById('confirmPassword');
        if (confirmInput && passwordInput) {
            confirmInput.addEventListener('blur', () => {
                const password = passwordInput.value;
                const confirmPassword = confirmInput.value;
                if (confirmPassword && !validator.validateConfirmPassword(password, confirmPassword)) {
                    validator.showError('confirmPasswordError', 'Passwords do not match');
                } else {
                    validator.clearError('confirmPasswordError');
                }
            });
        }
    }

    togglePasswordVisibility(field) {
        const input = document.getElementById(field);
        const button = document.getElementById(`toggle${field.charAt(0).toUpperCase() + field.slice(1)}`);
        
        if (input && button) {
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    validateForm() {
        let isValid = true;
        
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('terms').checked;
        
        // Clear previous errors
        validator.clearError('usernameError');
        validator.clearError('emailError');
        validator.clearError('passwordError');
        validator.clearError('confirmPasswordError');
        
        // Validate full name
        if (!fullName) {
            toast.error('Please enter your full name', 'Validation Error');
            isValid = false;
        }
        
        // Validate username
        if (!username) {
            validator.showError('usernameError', 'Username is required');
            isValid = false;
        } else if (!validator.validateUsername(username)) {
            validator.showError('usernameError', 'Only letters, numbers, and underscores allowed');
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            validator.showError('emailError', 'Email is required');
            isValid = false;
        } else if (!validator.validateEmail(email)) {
            validator.showError('emailError', 'Please enter a valid email');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            validator.showError('passwordError', 'Password is required');
            isValid = false;
        } else if (!validator.validatePassword(password)) {
            validator.showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            validator.showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (!validator.validateConfirmPassword(password, confirmPassword)) {
            validator.showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate terms
        if (!termsChecked) {
            toast.error('You must agree to the terms and conditions', 'Terms Required');
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
            // Collect form data
            const formData = new FormData();
            formData.append('full_name', document.getElementById('fullName').value.trim());
            formData.append('username', document.getElementById('username').value.trim());
            formData.append('email', document.getElementById('email').value.trim());
            formData.append('password', document.getElementById('password').value);
            formData.append('confirm_password', document.getElementById('confirmPassword').value);
            
            console.log('Sending signup request to:', SIGNUP_ENDPOINT);
            console.log('Form data:', {
                full_name: document.getElementById('fullName').value.trim(),
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim()
            });
            
            // Send request to backend
            const response = await fetch(SIGNUP_ENDPOINT, {
                method: 'POST',
                body: formData
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
                console.log('Signup successful!', data);
                this.handleSuccess(data);
            } else {
                // Error from backend
                console.error('Signup failed:', data);
                const errorMessage = data.detail || 
                                    data.message || 
                                    data.error || 
                                    `Signup failed (Status: ${response.status})`;
                this.handleError(errorMessage);
            }
        } catch (error) {
            // Network or other errors
            console.error('Signup error:', error);
            this.handleError(error.message || 'Network error. Please check your connection.');
        } finally {
            // Re-enable submit button
            this.setLoading(false);
        }
    }

    handleSuccess(data) {
        // Store user data
        if (data) {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('isAuthenticated', 'true');
            
            // Generate a token if not provided
            if (!data.token) {
                const tempToken = 'temp-auth-' + Date.now();
                localStorage.setItem('token', tempToken);
            } else {
                localStorage.setItem('token', data.token);
            }
        }
        
        // Show success message
        toast.success(
            'Account created successfully! Redirecting to dashboard...',
            'Welcome to PricePulse!'
        );
        
        // Reset form
        this.form.reset();
        
        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
        
        // Reset password toggles
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        if (passwordInput) passwordInput.type = 'password';
        if (confirmInput) confirmInput.type = 'password';
        
        // Reset eye icons
        const eyeIcons = document.querySelectorAll('.toggle-password i');
        eyeIcons.forEach(icon => {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = '/frontend/html/dashboard.html';
        }, 2000);
    }

    handleError(errorMessage) {
        console.error('Signup error:', errorMessage);
        toast.error(errorMessage, 'Signup Failed');
        
        // Highlight form for attention
        this.form.classList.add('shake');
        setTimeout(() => {
            this.form.classList.remove('shake');
        }, 500);
    }

    setLoading(isLoading) {
        const button = this.signupBtn;
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span>Creating Account...</span>';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.innerHTML = '<span>Create Account</span><i class="fas fa-arrow-right"></i>';
            button.style.opacity = '1';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SignupHandler();
    
    // Auto-hide error messages on input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const errorId = input.id + 'Error';
            validator.clearError(errorId);
        });
    });
});

// Add CSS for toast notifications and shake animation
const style = document.createElement('style');
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
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
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
    }
`;
document.head.appendChild(style);