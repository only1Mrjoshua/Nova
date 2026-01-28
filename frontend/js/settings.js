// ========== SETTINGS PAGE FUNCTIONALITY ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings functionality
    initSettings();
});

function initSettings() {
    // Initialize navigation tabs
    initTabs();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize button handlers
    initButtonHandlers();
    
    // Initialize modals
    initModals();
    
    // Load saved settings
    loadSettings();
    
    // Initialize logout feature
    initLogoutFeature();
}

// ========== TAB NAVIGATION ==========
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.settings-tab');
    
    if (!navItems.length || !tabs.length) return;
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const tabId = item.getAttribute('data-tab');
            if (!tabId) return;
            
            // Update active navigation item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active tab
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === `${tabId}Tab`) {
                    tab.classList.add('active');
                }
            });
            
            // Update URL hash without scrolling
            window.history.replaceState(null, null, `#${tabId}`);
            
            // Show toast for tab change
            const tabNames = {
                'general': 'General Settings',
                'notifications': 'Notification Settings',
                'privacy': 'Privacy & Security',
                'appearance': 'Appearance Settings',
                'data': 'Data Management',
                'account': 'Account Settings'
            };
        });
    });
    
    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetItem = document.querySelector(`.nav-item[data-tab="${hash}"]`);
        if (targetItem) {
            targetItem.click();
        }
    }
}

// ========== FORM HANDLERS ==========
function initFormHandlers() {
    // Price threshold range
    const thresholdSlider = document.getElementById('priceDropThreshold');
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.textContent = `${e.target.value}%`;
        });
    }
    
    // Theme selection
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const themeOption = e.target.closest('.theme-option');
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('selected');
            });
            themeOption.classList.add('selected');
            
            // Apply theme immediately
            applyTheme(e.target.value);
        });
    });
}

// ========== BUTTON HANDLERS ==========
function initButtonHandlers() {
    // Save buttons
    document.getElementById('saveGeneralBtn')?.addEventListener('click', saveGeneralSettings);
    document.getElementById('saveNotificationsBtn')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('savePrivacyBtn')?.addEventListener('click', savePrivacySettings);
    document.getElementById('saveAppearanceBtn')?.addEventListener('click', saveAppearanceSettings);
    
    // Reset buttons
    document.getElementById('resetGeneralBtn')?.addEventListener('click', resetGeneralSettings);
    document.getElementById('resetNotificationsBtn')?.addEventListener('click', resetNotificationSettings);
    document.getElementById('resetAppearanceBtn')?.addEventListener('click', resetAppearanceSettings);
    
    // Security buttons
    document.getElementById('changePasswordBtn')?.addEventListener('click', openPasswordModal);
    document.getElementById('viewSessionsBtn')?.addEventListener('click', viewSessions);
    document.getElementById('viewLoginHistoryBtn')?.addEventListener('click', viewLoginHistory);
    document.getElementById('updateSecurityQuestionsBtn')?.addEventListener('click', updateSecurityQuestions);
    
    // Data management buttons
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('clearSearchHistoryBtn')?.addEventListener('click', clearSearchHistory);
    document.getElementById('deleteTrackedProductsBtn')?.addEventListener('click', deleteTrackedProducts);
    document.getElementById('clearNotificationsBtn')?.addEventListener('click', clearNotifications);
    document.getElementById('deleteAccountBtn')?.addEventListener('click', deleteAccount);
    
    // Account buttons
    document.getElementById('upgradePlanBtn')?.addEventListener('click', upgradePlan);
    document.getElementById('viewBillingHistoryBtn')?.addEventListener('click', viewBillingHistory);
    
    // Connected accounts buttons
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', connectAccount);
    });
    
    document.querySelectorAll('.disconnect-btn').forEach(btn => {
        btn.addEventListener('click', disconnectAccount);
    });
}

// ========== MODAL FUNCTIONS ==========
function initModals() {
    // Confirmation modal
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmationBtn = document.getElementById('closeConfirmationModal');
    const cancelActionBtn = document.getElementById('cancelAction');
    
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', () => hideModal('confirmationModal'));
    }
    
    if (cancelActionBtn) {
        cancelActionBtn.addEventListener('click', () => hideModal('confirmationModal'));
    }
    
    // Close on overlay click
    if (confirmationModal) {
        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                hideModal('confirmationModal');
            }
        });
    }
    
    // Password modal
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordBtn = document.getElementById('closePasswordModal');
    const cancelPasswordBtn = document.getElementById('cancelPasswordChange');
    
    if (closePasswordBtn) {
        closePasswordBtn.addEventListener('click', () => hideModal('passwordModal'));
    }
    
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', () => hideModal('passwordModal'));
    }
    
    if (passwordModal) {
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                hideModal('passwordModal');
            }
        });
    }
    
    // Save password button
    document.getElementById('savePasswordChange')?.addEventListener('click', savePassword);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function showConfirmation(message, warning, confirmCallback) {
    document.getElementById('confirmationMessage').textContent = message;
    document.getElementById('confirmationWarning').textContent = warning;
    
    const confirmBtn = document.getElementById('confirmAction');
    confirmBtn.onclick = () => {
        confirmCallback();
        hideModal('confirmationModal');
    };
    
    showModal('confirmationModal');
}

// ========== SETTINGS FUNCTIONS ==========
function saveGeneralSettings() {
    const currency = document.getElementById('currency').value;
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;
    const threshold = document.getElementById('priceDropThreshold').value;
    
    // Get platform preferences
    const platforms = Array.from(document.querySelectorAll('input[name="defaultPlatform"]:checked'))
        .map(cb => cb.value);
    
    const settings = {
        currency,
        language,
        timezone,
        priceDropThreshold: threshold,
        defaultPlatforms: platforms
    };
    
    // Show loading
    showToast('Saving general settings...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // Save to localStorage (in real app, would be API call)
        localStorage.setItem('generalSettings', JSON.stringify(settings));
        
        showToast('General settings saved successfully!', 'success');
    }, 1500);
}

function saveNotificationSettings() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const pushNotifications = document.getElementById('pushNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;
    
    const notificationTypes = {
        priceDropAlerts: document.getElementById('priceDropAlerts').checked,
        targetReachedAlerts: document.getElementById('targetReachedAlerts').checked,
        outOfStockAlerts: document.getElementById('outOfStockAlerts').checked,
        priceIncreaseAlerts: document.getElementById('priceIncreaseAlerts').checked,
        weeklySummary: document.getElementById('weeklySummary').checked,
        newFeatures: document.getElementById('newFeatures').checked
    };
    
    const frequency = document.querySelector('input[name="frequency"]:checked').value;
    
    const settings = {
        channels: {
            email: emailNotifications,
            push: pushNotifications,
            sms: smsNotifications
        },
        types: notificationTypes,
        frequency
    };
    
    // Show loading
    showToast('Saving notification settings...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        showToast('Notification settings saved successfully!', 'success');
    }, 1500);
}

function savePrivacySettings() {
    const profileVisibility = document.getElementById('profileVisibility').value;
    const showTrackedProducts = document.getElementById('showTrackedProducts').checked;
    const allowSearchIndexing = document.getElementById('allowSearchIndexing').checked;
    const twoFactorAuth = document.getElementById('twoFactorAuth').checked;
    
    const settings = {
        profileVisibility,
        showTrackedProducts,
        allowSearchIndexing,
        twoFactorAuth
    };
    
    // Show loading
    showToast('Saving privacy settings...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        localStorage.setItem('privacySettings', JSON.stringify(settings));
        showToast('Privacy settings saved successfully!', 'success');
    }, 1500);
}

function saveAppearanceSettings() {
    const theme = document.querySelector('input[name="theme"]:checked').value;
    const fontSize = document.getElementById('fontSize').value;
    const density = document.getElementById('density').value;
    const animations = document.getElementById('animations').checked;
    const reduceMotion = document.getElementById('reduceMotion').checked;
    const highContrast = document.getElementById('highContrast').checked;
    
    const settings = {
        theme,
        fontSize,
        density,
        animations,
        reduceMotion,
        highContrast
    };
    
    // Show loading
    showToast('Applying appearance settings...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        localStorage.setItem('appearanceSettings', JSON.stringify(settings));
        
        // Apply theme if changed
        if (settings.theme !== getCurrentTheme()) {
            applyTheme(settings.theme);
        }
        
        showToast('Appearance settings applied successfully!', 'success');
    }, 1500);
}

// ========== RESET FUNCTIONS ==========
function resetGeneralSettings() {
    showConfirmation(
        'Reset all general settings to default values?',
        'This will revert all general preferences to their original state.',
        () => {
            // Reset form values
            document.getElementById('currency').value = 'NGN';
            document.getElementById('language').value = 'en';
            document.getElementById('timezone').value = 'Africa/Lagos';
            document.getElementById('priceDropThreshold').value = '10';
            document.getElementById('thresholdValue').textContent = '10%';
            
            // Reset platform checkboxes
            document.querySelectorAll('input[name="defaultPlatform"]').forEach(cb => {
                cb.checked = ['jumia', 'konga', 'amazon'].includes(cb.value);
            });
            
            showToast('General settings reset to defaults', 'success');
        }
    );
}

function resetNotificationSettings() {
    showConfirmation(
        'Reset all notification settings to default values?',
        'This will revert all notification preferences to their original state.',
        () => {
            // Reset channel toggles
            document.getElementById('emailNotifications').checked = true;
            document.getElementById('pushNotifications').checked = true;
            document.getElementById('smsNotifications').checked = false;
            
            // Reset notification types
            document.getElementById('priceDropAlerts').checked = true;
            document.getElementById('targetReachedAlerts').checked = true;
            document.getElementById('outOfStockAlerts').checked = true;
            document.getElementById('priceIncreaseAlerts').checked = false;
            document.getElementById('weeklySummary').checked = true;
            document.getElementById('newFeatures').checked = false;
            
            // Reset frequency
            document.querySelector('input[name="frequency"][value="instant"]').checked = true;
            
            showToast('Notification settings reset to defaults', 'success');
        }
    );
}

function resetAppearanceSettings() {
    showConfirmation(
        'Reset all appearance settings to default values?',
        'This will revert all appearance preferences to their original state.',
        () => {
            // Reset theme
            document.querySelector('input[name="theme"][value="dark"]').checked = true;
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.querySelector('.theme-option[data-theme="dark"]').classList.add('selected');
            
            // Reset other settings
            document.getElementById('fontSize').value = 'medium';
            document.getElementById('density').value = 'comfortable';
            document.getElementById('animations').checked = true;
            document.getElementById('reduceMotion').checked = false;
            document.getElementById('highContrast').checked = false;
            
            // Apply dark theme
            applyTheme('dark');
            
            showToast('Appearance settings reset to defaults', 'success');
        }
    );
}

// ========== SECURITY FUNCTIONS ==========
function openPasswordModal() {
    // Clear form
    document.getElementById('passwordChangeForm').reset();
    showModal('passwordModal');
}

function savePassword() {
    const currentPassword = document.getElementById('modalCurrentPassword').value;
    const newPassword = document.getElementById('modalNewPassword').value;
    const confirmPassword = document.getElementById('modalConfirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }
    
    // Show loading
    const saveBtn = document.getElementById('savePasswordChange');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        hideModal('passwordModal');
        showToast('Password updated successfully!', 'success');
    }, 2000);
}

function viewSessions() {
    showToast('Loading active sessions...', 'info');
    // In a real app, this would show a modal with sessions
}

function viewLoginHistory() {
    showToast('Loading login history...', 'info');
    // In a real app, this would show a modal with history
}

function updateSecurityQuestions() {
    showToast('Security questions feature coming soon!', 'info');
}

// ========== DATA MANAGEMENT FUNCTIONS ==========
function exportData() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    
    showToast(`Exporting data as ${format.toUpperCase()}...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        // Create dummy data
        const data = {
            user: {
                name: "John Doe",
                email: "john.doe@example.com",
                memberSince: "2023-01-15"
            },
            trackedProducts: 12,
            totalSavings: 45200,
            lastExport: new Date().toISOString()
        };
        
        // Create download link based on format
        let content, mimeType, fileName;
        
        switch(format) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                fileName = 'zyneth-data-export.json';
                break;
            case 'csv':
                content = `User Data\nName,Email,Member Since\n${data.user.name},${data.user.email},${data.user.memberSince}`;
                mimeType = 'text/csv';
                fileName = 'zyneth-data-export.csv';
                break;
            case 'pdf':
                // In real app, would generate PDF
                showToast('PDF export requires server-side processing', 'info');
                return;
        }
        
        // Download file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    }, 2000);
}

function clearSearchHistory() {
    showConfirmation(
        'Clear all search history?',
        'This will permanently delete all your saved searches.',
        () => {
            showToast('Clearing search history...', 'info');
            
            setTimeout(() => {
                showToast('Search history cleared successfully!', 'success');
            }, 1500);
        }
    );
}

function deleteTrackedProducts() {
    showConfirmation(
        'Delete all tracked products?',
        'This will remove all products from your tracking list. This action cannot be undone.',
        () => {
            showToast('Deleting tracked products...', 'info');
            
            setTimeout(() => {
                showToast('All tracked products deleted!', 'success');
            }, 1500);
        }
    );
}

function clearNotifications() {
    showConfirmation(
        'Clear all notification history?',
        'This will permanently delete all your past notifications.',
        () => {
            showToast('Clearing notification history...', 'info');
            
            setTimeout(() => {
                showToast('Notification history cleared!', 'success');
            }, 1500);
        }
    );
}

function deleteAccount() {
    showConfirmation(
        'Permanently delete your account?',
        'WARNING: This action is irreversible. All your data will be permanently deleted.',
        () => {
            showToast('Deleting account...', 'info');
            
            // Simulate account deletion
            setTimeout(() => {
                showToast('Account deleted successfully. Redirecting...', 'success');
                
                // Clear all data
                localStorage.clear();
                sessionStorage.clear();
                
                // Redirect to home page after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }, 3000);
        }
    );
}

// ========== ACCOUNT FUNCTIONS ==========
function upgradePlan() {
    showToast('Opening upgrade options...', 'info');
    // In a real app, this would open a subscription modal
}

function viewBillingHistory() {
    showToast('Loading billing history...', 'info');
    // In a real app, this would show billing history
}

function connectAccount(button) {
    const btn = button.target || button;
    const accountName = btn.closest('.account-item').querySelector('h4').textContent;
    
    showToast(`Connecting ${accountName}...`, 'info');
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
        btn.classList.remove('btn-primary', 'connect-btn');
        btn.classList.add('btn-secondary', 'disconnect-btn');
        btn.onclick = disconnectAccount;
        
        btn.closest('.account-item').querySelector('p').textContent = 'Connected';
        
        showToast(`${accountName} connected successfully!`, 'success');
    }, 1500);
}

function disconnectAccount(button) {
    const btn = button.target || button;
    const accountName = btn.closest('.account-item').querySelector('h4').textContent;
    
    showConfirmation(
        `Disconnect ${accountName}?`,
        'You will need to reconnect to use features that require this account.',
        () => {
            btn.innerHTML = '<i class="fas fa-link"></i> Connect';
            btn.classList.remove('btn-secondary', 'disconnect-btn');
            btn.classList.add('btn-primary', 'connect-btn');
            btn.onclick = connectAccount;
            
            btn.closest('.account-item').querySelector('p').textContent = 'Not connected';
            
            showToast(`${accountName} disconnected`, 'success');
        }
    );
}

// ========== THEME FUNCTIONS ==========
function applyTheme(theme) {
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('theme-dark', 'theme-light');
    
    // Apply new theme
    if (theme === 'dark' || (theme === 'auto' && !window.matchMedia('(prefers-color-scheme: light)').matches)) {
        html.classList.add('theme-dark');
    } else if (theme === 'light' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        html.classList.add('theme-light');
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
}

function getCurrentTheme() {
    return localStorage.getItem('theme') || 'dark';
}

// ========== LOAD SETTINGS ==========
function loadSettings() {
    // Load general settings
    const generalSettings = JSON.parse(localStorage.getItem('generalSettings'));
    if (generalSettings) {
        document.getElementById('currency').value = generalSettings.currency || 'NGN';
        document.getElementById('language').value = generalSettings.language || 'en';
        document.getElementById('timezone').value = generalSettings.timezone || 'Africa/Lagos';
        document.getElementById('priceDropThreshold').value = generalSettings.priceDropThreshold || '10';
        document.getElementById('thresholdValue').textContent = `${generalSettings.priceDropThreshold || '10'}%`;
        
        // Set platform checkboxes
        if (generalSettings.defaultPlatforms) {
            document.querySelectorAll('input[name="defaultPlatform"]').forEach(cb => {
                cb.checked = generalSettings.defaultPlatforms.includes(cb.value);
            });
        }
    }
    
    // Load notification settings
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings'));
    if (notificationSettings) {
        document.getElementById('emailNotifications').checked = notificationSettings.channels?.email || true;
        document.getElementById('pushNotifications').checked = notificationSettings.channels?.push || true;
        document.getElementById('smsNotifications').checked = notificationSettings.channels?.sms || false;
        
        if (notificationSettings.types) {
            document.getElementById('priceDropAlerts').checked = notificationSettings.types.priceDropAlerts || true;
            document.getElementById('targetReachedAlerts').checked = notificationSettings.types.targetReachedAlerts || true;
            document.getElementById('outOfStockAlerts').checked = notificationSettings.types.outOfStockAlerts || true;
            document.getElementById('priceIncreaseAlerts').checked = notificationSettings.types.priceIncreaseAlerts || false;
            document.getElementById('weeklySummary').checked = notificationSettings.types.weeklySummary || true;
            document.getElementById('newFeatures').checked = notificationSettings.types.newFeatures || false;
        }
        
        if (notificationSettings.frequency) {
            document.querySelector(`input[name="frequency"][value="${notificationSettings.frequency}"]`).checked = true;
        }
    }
    
    // Load privacy settings
    const privacySettings = JSON.parse(localStorage.getItem('privacySettings'));
    if (privacySettings) {
        document.getElementById('profileVisibility').value = privacySettings.profileVisibility || 'private';
        document.getElementById('showTrackedProducts').checked = privacySettings.showTrackedProducts || false;
        document.getElementById('allowSearchIndexing').checked = privacySettings.allowSearchIndexing || false;
        document.getElementById('twoFactorAuth').checked = privacySettings.twoFactorAuth || false;
    }
    
    // Load appearance settings
    const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings'));
    if (appearanceSettings) {
        document.querySelector(`input[name="theme"][value="${appearanceSettings.theme || 'dark'}"]`).checked = true;
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`.theme-option[data-theme="${appearanceSettings.theme || 'dark'}"]`).classList.add('selected');
        
        document.getElementById('fontSize').value = appearanceSettings.fontSize || 'medium';
        document.getElementById('density').value = appearanceSettings.density || 'comfortable';
        document.getElementById('animations').checked = appearanceSettings.animations !== false;
        document.getElementById('reduceMotion').checked = appearanceSettings.reduceMotion || false;
        document.getElementById('highContrast').checked = appearanceSettings.highContrast || false;
        
        // Apply theme
        applyTheme(appearanceSettings.theme || 'dark');
    }
}

// ========== LOGOUT FUNCTIONALITY ==========
function initLogoutFeature() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLogoutModal();
        });
    }
}

function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (!modal) return;
    
    modal.classList.add('active');
    
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    const closeBtn = document.getElementById('closeLogoutModal');
    
    if (confirmBtn) {
        confirmBtn.onclick = handleLogout;
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = hideLogoutModal;
    }
    
    if (closeBtn) {
        closeBtn.onclick = hideLogoutModal;
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            hideLogoutModal();
        }
    };
}

function hideLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    showToast('Logout cancelled', 'info');
}

function handleLogout() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    showToast('Logging out...', 'info');
    
    // Clear authentication tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    setTimeout(() => {
        showToast('Successfully logged out', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 1000);
}

// ========== TOAST FUNCTIONALITY ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
        container = newContainer;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        'success': 'check-circle',
        'info': 'info-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle'
    };
    
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <h4 class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress">
            <div class="toast-progress-bar"></div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        
        const progressBar = toast.querySelector('.toast-progress-bar');
        if (progressBar) {
            progressBar.style.transition = 'transform 5s linear';
            progressBar.style.transform = 'scaleX(0)';
        }
    }, 10);
    
    setTimeout(() => {
        removeToast(toastId);
    }, 5000);
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    toast.classList.remove('show');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 500);
}

// ========== WINDOW RESIZE HANDLER ==========
window.addEventListener('resize', () => {
    // Close mobile menu if resizing to larger screen
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    
    if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
});