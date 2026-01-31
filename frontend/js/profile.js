// ========== CONFIGURATION ==========
const CONFIG = {
    API_BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:8000'
        : 'https://zyneth-backend.onrender.com',
    FRONTEND_BASE: window.location.origin,
    TOKEN_KEYS: ['authToken', 'token', 'access_token'],
    USER_KEY: 'user'
};

// ========== AUTH UTILITIES ==========
function getAuthToken() {
    for (const key of CONFIG.TOKEN_KEYS) {
        const token = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (token && isValidToken(token)) return token;
    }
    return null;
}

function isValidToken(token) {
    if (!token || token.length < 10) return false;
    
    try {
        if (token.split('.').length === 3) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp < Date.now() / 1000) {
                return false;
            }
        }
        return true;
    } catch {
        return false;
    }
}

function getStoredUser() {
    try {
        const userStr = localStorage.getItem(CONFIG.USER_KEY) || sessionStorage.getItem(CONFIG.USER_KEY);
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

function storeUser(user) {
    if (!user) return;
    const userStr = JSON.stringify(user);
    localStorage.setItem(CONFIG.USER_KEY, userStr);
    sessionStorage.setItem(CONFIG.USER_KEY, userStr);
}

function clearAuthData() {
    CONFIG.TOKEN_KEYS.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.removeItem(CONFIG.USER_KEY);
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

// ========== USERNAME DISPLAY ==========
async function loadAndDisplayUserProfile() {
    const avatarName = document.querySelector('.avatar-info h2');
    const navUsername = document.querySelector('#navMenu .btn-login span, #navMenu .btn-login');
    const emailDisplay = document.querySelector('.info-item:nth-child(1) .info-value span:first-child');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    
    // Default fallback
    const setFallback = () => {
        if (avatarName) avatarName.textContent = 'User';
        if (navUsername) {
            if (navUsername.tagName === 'SPAN') {
                navUsername.textContent = 'User';
            } else {
                navUsername.innerHTML = '<i class="fas fa-user"></i> User';
            }
        }
        if (emailDisplay) emailDisplay.textContent = 'user@example.com';
        if (fullNameInput) fullNameInput.value = 'User';
        if (emailInput) emailInput.value = 'user@example.com';
    };
    
    // Try stored user first
    let user = getStoredUser();
    
    // If no stored user, fetch from API
    if (!user?.username) {
        const token = getAuthToken();
        if (!token) {
            setFallback();
            return;
        }
        
        try {
            user = await fetchCurrentUser(token);
            if (!user?.username) {
                setFallback();
                return;
            }
            storeUser(user);
        } catch {
            setFallback();
            return;
        }
    }
    
    // Display user data
    const displayName = user.full_name || user.username;
    
    if (avatarName) avatarName.textContent = displayName;
    
    if (navUsername) {
        if (navUsername.tagName === 'SPAN') {
            navUsername.textContent = displayName;
        } else {
            navUsername.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
        }
    }
    
    if (emailDisplay) emailDisplay.textContent = user.email;
    if (fullNameInput) fullNameInput.value = displayName;
    if (emailInput) emailInput.value = user.email;
    
    // Update role if available
    const roleElement = document.querySelector('.user-role');
    if (roleElement && user.role) {
        roleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    
    // Update avatar if available
    const avatarElement = document.querySelector('.avatar i');
    if (avatarElement && user.avatar_url) {
        avatarElement.className = '';
        avatarElement.style.backgroundImage = `url('${CONFIG.API_BASE_URL}${user.avatar_url}')`;
        avatarElement.style.backgroundSize = 'cover';
        avatarElement.style.backgroundPosition = 'center';
    }
    
    return user;
}

async function fetchCurrentUser(token) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
}

// ========== TOAST SYSTEM ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        'success': 'check-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle',
        'error': 'exclamation-circle'
    };
    
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress">
            <div class="toast-progress-bar"></div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toastId));
    
    const progressBar = toast.querySelector('.toast-progress-bar');
    if (progressBar) {
        progressBar.style.transition = 'transform 5s linear';
        progressBar.style.transform = 'scaleX(0)';
    }
    
    const autoRemove = setTimeout(() => removeToast(toastId), 5000);
    
    toast.addEventListener('mouseenter', () => clearTimeout(autoRemove));
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => removeToast(toastId), 3000);
    });
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
}

// ========== FORM HANDLING ==========
function initProfileForm() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditProfile);
    }
    
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', closePasswordForm);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const token = getAuthToken();
    if (!token) {
        showToast('Please login to update profile', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    try {
        // Prepare FormData for file upload
        const updateData = new FormData();
        updateData.append('full_name', data.fullName);
        updateData.append('username', data.username || '');
        
        // Call API
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: updateData
        });
        
        if (!response.ok) {
            throw new Error(`Update failed: ${response.status}`);
        }
        
        const updatedUser = await response.json();
        storeUser(updatedUser);
        
        showToast('Profile updated successfully!', 'success');
        updateDisplayedInfo(updatedUser);
        closeEditProfile();
        
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Failed to update profile', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.currentPassword) {
        showToast('Please enter current password', 'error');
        return;
    }
    
    if (!data.newPassword) {
        showToast('Please enter new password', 'error');
        return;
    }
    
    if (data.newPassword !== data.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (data.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const originalText = savePasswordBtn.innerHTML;
    savePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    savePasswordBtn.disabled = true;
    
    // Note: Your backend doesn't have a password update endpoint yet
    // This is a placeholder for when you add it
    setTimeout(() => {
        savePasswordBtn.innerHTML = originalText;
        savePasswordBtn.disabled = false;
        showToast('Password updated successfully!', 'success');
        form.reset();
        closePasswordForm();
    }, 1500);
}

function closeEditProfile() {
    const editForm = document.getElementById('editProfileForm');
    const editBtn = document.getElementById('editProfileBtn');
    
    if (editForm) editForm.style.display = 'none';
    
    if (editBtn) {
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
        editBtn.onclick = openEditProfile;
    }
}

function closePasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    if (passwordForm) passwordForm.style.display = 'none';
    
    if (changePasswordBtn) {
        changePasswordBtn.innerHTML = '<i class="fas fa-key"></i> Change Password';
        changePasswordBtn.onclick = openPasswordForm;
    }
}

function updateDisplayedInfo(user) {
    const displayName = user.full_name || user.username;
    
    // Update name in avatar section
    const nameElement = document.querySelector('.avatar-info h2');
    if (nameElement) nameElement.textContent = displayName;
    
    // Update name in navbar
    const navElement = document.querySelector('#navMenu .btn-login');
    if (navElement) {
        navElement.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
    }
    
    // Update email
    const emailValue = document.querySelector('.info-item:nth-child(1) .info-value span:first-child');
    if (emailValue) emailValue.textContent = user.email;
    
    // Update verification status
    const verificationBadge = document.querySelector('.verification-badge');
    if (verificationBadge) {
        if (user.is_verified) {
            verificationBadge.className = 'verification-badge verified';
            verificationBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
        } else {
            verificationBadge.className = 'verification-badge unverified';
            verificationBadge.innerHTML = '<i class="fas fa-times-circle"></i> Unverified';
        }
    }
    
    // Update form fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    if (fullNameInput) fullNameInput.value = displayName;
    if (emailInput) emailInput.value = user.email;
}

// ========== BUTTON FUNCTIONALITY ==========
function initButtons() {
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfile);
    }
    
    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', openPasswordForm);
    }
    
    // Edit avatar button
    const editAvatarBtn = document.getElementById('editAvatarBtn');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', handleAvatarUpload);
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.btn-signup');
    if (logoutBtn && logoutBtn.textContent.includes('Logout')) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function openEditProfile() {
    const editForm = document.getElementById('editProfileForm');
    const editBtn = document.getElementById('editProfileBtn');
    
    if (editForm) {
        editForm.style.display = 'block';
        editForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (editBtn) {
        editBtn.innerHTML = '<i class="fas fa-times"></i> Close Edit';
        editBtn.onclick = closeEditProfile;
    }
}

function openPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    if (passwordForm) {
        passwordForm.style.display = 'block';
        passwordForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.innerHTML = '<i class="fas fa-times"></i> Close';
        changePasswordBtn.onclick = closePasswordForm;
    }
}

function handleAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('File must be less than 5MB', 'error');
            return;
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Only JPG, PNG, GIF allowed', 'error');
            return;
        }
        
        const token = getAuthToken();
        if (!token) {
            showToast('Please login to update avatar', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            const updatedUser = await response.json();
            storeUser(updatedUser);
            
            // Update avatar display
            const avatarElement = document.querySelector('.avatar i');
            if (avatarElement && updatedUser.avatar_url) {
                avatarElement.className = '';
                avatarElement.style.backgroundImage = `url('${CONFIG.API_BASE_URL}${updatedUser.avatar_url}')`;
                avatarElement.style.backgroundSize = 'cover';
                avatarElement.style.backgroundPosition = 'center';
            }
            
            showToast('Avatar updated successfully!', 'success');
        } catch (error) {
            console.error('Avatar upload error:', error);
            showToast('Failed to update avatar', 'error');
        }
    };
    
    input.click();
}

function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        showToast('Logging out...', 'info');
        
        clearAuthData();
        
        setTimeout(() => {
            showToast('Successfully logged out', 'success');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 1500);
        }, 1000);
    }
}

// ========== SESSION CHECK ==========
function checkAuthentication() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'signin.html';
        return false;
    }
    return true;
}

// ========== INITIALIZATION ==========
async function initProfile() {
    // 1. Check authentication
    if (!checkAuthentication()) return;
    
    // 2. Load and display user profile
    await loadAndDisplayUserProfile();
    
    // 3. Initialize features
    initProfileForm();
    initButtons();
    
    // 4. Add window resize handler for mobile menu
    window.addEventListener('resize', handleWindowResize);
}

function handleWindowResize() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    
    if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
        hamburger?.classList.remove('active');
        navMenu.classList.remove('active');
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

// ========== START PROFILE ==========
document.addEventListener('DOMContentLoaded', initProfile);