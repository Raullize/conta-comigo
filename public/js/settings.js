/**
 * Settings - User Settings and Preferences
 */

// DOM Elements
const DOM = {
    // Menu Navigation
    menuItems: document.querySelectorAll('.settings-nav-item'),
    contentSections: document.querySelectorAll('.content-section'),
    
    // User Info Form
    userInfoForm: document.getElementById('userInfoForm'),
    nameInput: document.getElementById('name'),
    emailInput: document.getElementById('email'),
    cpfInput: document.getElementById('cpf'),
    birthDateInput: document.getElementById('birthDate'),
    
    // Profile Photo Elements
    profilePhotoInput: document.getElementById('profilePhotoInput'),
    profilePhotoPreview: document.getElementById('profilePhotoPreview'),
    uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    
    // Password Form
    passwordForm: document.getElementById('passwordForm'),
    currentPasswordInput: document.getElementById('currentPassword'),
    newPasswordInput: document.getElementById('newPassword'),
    confirmPasswordInput: document.getElementById('confirmPassword'),
    
    // Password toggles
    currentPasswordToggle: document.getElementById('currentPasswordToggle'),
    newPasswordToggle: document.getElementById('newPasswordToggle'),
    confirmPasswordToggle: document.getElementById('confirmPasswordToggle'),
    
    // Password strength
    strengthBar: document.querySelector('.strength-fill'),
    strengthText: document.querySelector('.strength-text'),
    
    // Privacy toggles
    dataSharingToggle: document.getElementById('dataSharing'),
    emailNotificationsToggle: document.getElementById('emailNotifications'),
    usageAnalyticsToggle: document.getElementById('usageAnalytics'),
    
    // Buttons
    logoutBtn: document.getElementById('logoutBtn'),
    disconnectBtn: document.getElementById('disconnectBtn'),
    deleteAccountBtn: document.getElementById('deleteAccountBtn'),
    
    // Modals
    logoutModal: document.getElementById('logoutModal'),
    disconnectModal: document.getElementById('disconnectModal'),
    deleteAccountModal: document.getElementById('deleteAccountModal')
};

let profileForm, passwordForm, deleteConfirmationInput;
let disconnectModal, deleteAccountModal;
let passwordToggles = [];

// User Data
let currentUser = null;

// Initialize Settings Page
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadUserData();
    setupPasswordStrength();
    setupPasswordToggles();
});

// Initialize DOM Elements
function initializeElements() {
    profileForm = document.getElementById('profileForm');
    passwordForm = document.getElementById('passwordForm');
    deleteConfirmationInput = document.getElementById('deleteConfirmation');
    disconnectModal = document.getElementById('disconnectModal');
    deleteAccountModal = document.getElementById('deleteAccountModal');
    passwordToggles = document.querySelectorAll('.password-toggle');
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu Navigation
    setupMenuNavigation();
    
    // Profile Form
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Profile Photo Events
    setupProfilePhotoEvents();

    // Password Form
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }

    // Disconnect Accounts Button
    const disconnectBtn = document.getElementById('disconnectAccountsBtn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', showDisconnectModal);
    }

    // Delete Account Button
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', showDeleteModal);
    }

    // Modal Close Buttons
    setupModalEventListeners();

    // Delete Confirmation Input
    if (deleteConfirmationInput) {
        deleteConfirmationInput.addEventListener('input', handleDeleteConfirmationInput);
    }
}

// Setup Modal Event Listeners
function setupModalEventListeners() {
    // Disconnect Modal
    const closeDisconnectModal = document.getElementById('closeDisconnectModal');
    const cancelDisconnectBtn = document.getElementById('cancelDisconnectBtn');
    const confirmDisconnectBtn = document.getElementById('confirmDisconnectBtn');

    if (closeDisconnectModal) {
        closeDisconnectModal.addEventListener('click', hideDisconnectModal);
    }
    if (cancelDisconnectBtn) {
        cancelDisconnectBtn.addEventListener('click', hideDisconnectModal);
    }
    if (confirmDisconnectBtn) {
        confirmDisconnectBtn.addEventListener('click', handleDisconnectAccounts);
    }

    // Delete Account Modal
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', hideDeleteModal);
    }
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteAccount);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === disconnectModal) {
            hideDisconnectModal();
        }
        if (event.target === deleteAccountModal) {
            hideDeleteModal();
        }
    });
}

// Load User Data
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            populateUserData();
        } else {
            throw new Error('Erro ao carregar dados do usuário');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showToast('Erro ao carregar dados do usuário', 'error');
    }
}

// Populate User Data in Form
function populateUserData() {
    if (!currentUser) return;

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const birthDateInput = document.getElementById('birthDate');

    if (fullNameInput) fullNameInput.value = currentUser.name || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (cpfInput) cpfInput.value = formatCPF(currentUser.cpf) || '';
    if (birthDateInput && currentUser.birthDate) {
        // Convert date to YYYY-MM-DD format for input
        const date = new Date(currentUser.birthDate);
        const formattedDate = date.toISOString().split('T')[0];
        birthDateInput.value = formattedDate;
    }
    
    // Load profile photo
    loadProfilePhoto();
}

// Handle Profile Update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(profileForm);
    const updateData = {
        name: formData.get('fullName'),
        birthDate: formData.get('birthDate')
    };

    try {
        setFormLoading(profileForm, true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = { ...currentUser, ...updatedUser };
            showToast('Dados atualizados com sucesso!', 'success');
            setFormSuccess(profileForm, true);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar dados');
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showToast(error.message, 'error');
    } finally {
        setFormLoading(profileForm, false);
        setTimeout(() => setFormSuccess(profileForm, false), 2000);
    }
}

// Handle Password Update
async function handlePasswordUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(passwordForm);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // Validate passwords
    if (newPassword !== confirmPassword) {
        showToast('As senhas não coincidem', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('A nova senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }

    const updateData = {
        oldPassword: currentPassword,
        password: newPassword
    };

    try {
        setFormLoading(passwordForm, true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            showToast('Senha alterada com sucesso!', 'success');
            setFormSuccess(passwordForm, true);
            passwordForm.reset();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao alterar senha');
        }
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showToast(error.message, 'error');
    } finally {
        setFormLoading(passwordForm, false);
        setTimeout(() => setFormSuccess(passwordForm, false), 2000);
    }
}

// Password Strength Setup
function setupPasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
}

// Update Password Strength
function updatePasswordStrength(event) {
    const password = event.target.value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;

    const strength = calculatePasswordStrength(password);
    
    // Remove all strength classes
    strengthFill.classList.remove('weak', 'fair', 'good', 'strong');
    
    if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Força da senha';
        return;
    }
    
    switch (strength.level) {
        case 1:
            strengthFill.classList.add('weak');
            strengthFill.style.width = '25%';
            strengthText.textContent = 'Fraca';
            break;
        case 2:
            strengthFill.classList.add('fair');
            strengthFill.style.width = '50%';
            strengthText.textContent = 'Regular';
            break;
        case 3:
            strengthFill.classList.add('good');
            strengthFill.style.width = '75%';
            strengthText.textContent = 'Boa';
            break;
        case 4:
            strengthFill.classList.add('strong');
            strengthFill.style.width = '100%';
            strengthText.textContent = 'Forte';
            break;
        default:
            strengthFill.style.width = '10%';
            strengthText.textContent = 'Muito fraca';
    }
}

// Calculate Password Strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    let level = 0;
    if (score >= 2) level = 1;
    if (score >= 3) level = 2;
    if (score >= 4) level = 3;
    if (score >= 5) level = 4;
    
    return { score, level };
}

// Setup Password Toggles
function setupPasswordToggles() {
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Show Disconnect Modal
function showDisconnectModal() {
    if (disconnectModal) {
        disconnectModal.classList.add('show');
    }
}

// Hide Disconnect Modal
function hideDisconnectModal() {
    if (disconnectModal) {
        disconnectModal.classList.remove('show');
    }
}

// Handle Disconnect Accounts
function handleDisconnectAccounts() {
    // This is just visual for now as requested
    showToast('Funcionalidade em desenvolvimento', 'info');
    hideDisconnectModal();
}

// Show Delete Modal
function showDeleteModal() {
    if (deleteAccountModal) {
        deleteAccountModal.classList.add('show');
        // Reset confirmation input
        if (deleteConfirmationInput) {
            deleteConfirmationInput.value = '';
            updateDeleteButton();
        }
    }
}

// Hide Delete Modal
function hideDeleteModal() {
    if (deleteAccountModal) {
        deleteAccountModal.classList.remove('show');
    }
}

// Handle Delete Confirmation Input
function handleDeleteConfirmationInput() {
    updateDeleteButton();
}

// Update Delete Button State
function updateDeleteButton() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn && deleteConfirmationInput) {
        const isValid = deleteConfirmationInput.value.trim().toUpperCase() === 'DELETAR';
        confirmDeleteBtn.disabled = !isValid;
    }
}

// Handle Delete Account
async function handleDeleteAccount() {
    try {
        const token = localStorage.getItem('token');
        
        // For now, just show a message since delete endpoint might not exist
        showToast('Funcionalidade de exclusão em desenvolvimento', 'info');
        hideDeleteModal();
        
        // Uncomment when delete endpoint is available:
        /*
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            showToast('Conta deletada com sucesso', 'success');
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 2000);
        } else {
            throw new Error('Erro ao deletar conta');
        }
        */
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        showToast(error.message, 'error');
    }
}

// Utility Functions
function setFormLoading(form, loading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.setAttribute('data-original-text', originalText);
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading-btn');
            const originalText = submitBtn.getAttribute('data-original-text');
            if (originalText) {
                submitBtn.innerHTML = originalText;
            }
        }
    }
}

function setFormSuccess(form, success) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        if (success) {
            submitBtn.classList.add('btn-success');
            const originalText = submitBtn.innerHTML;
            submitBtn.setAttribute('data-original-text', originalText);
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
        } else {
            submitBtn.classList.remove('btn-success');
            const originalText = submitBtn.getAttribute('data-original-text');
            if (originalText) {
                submitBtn.innerHTML = originalText;
            }
        }
    }
}

function formatCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--white);
                border-radius: var(--border-radius-md);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-sm);
                z-index: var(--z-tooltip);
                min-width: 300px;
                border-left: 4px solid;
                animation: slideInRight 0.3s ease-out;
            }
            .toast-success { border-left-color: var(--primary-green); }
            .toast-error { border-left-color: #dc3545; }
            .toast-info { border-left-color: var(--primary-blue); }
            .toast-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            .toast-close {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary);
                padding: var(--spacing-xs);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(toast);

    // Setup close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// Menu Navigation Functions
function setupMenuNavigation() {
    // Add click event listeners to menu items
    DOM.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('data-section');
            switchToSection(targetSection);
        });
    });
    
    // Set default active section (personal info)
    switchToSection('personal');
    
    // Setup privacy toggles
    setupPrivacyToggles();
}

function switchToSection(sectionName) {
    // Remove active class from all menu items
    DOM.menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Hide all content sections
    DOM.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked menu item
    const activeMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Show target content section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function setupPrivacyToggles() {
    // Load privacy settings from localStorage
    const privacySettings = JSON.parse(localStorage.getItem('privacySettings')) || {
        dataSharing: true,
        emailNotifications: true,
        usageAnalytics: false
    };
    
    // Set initial toggle states
    if (DOM.dataSharingToggle) {
        DOM.dataSharingToggle.checked = privacySettings.dataSharing;
        DOM.dataSharingToggle.addEventListener('change', () => {
            savePrivacySetting('dataSharing', DOM.dataSharingToggle.checked);
        });
    }
    
    if (DOM.emailNotificationsToggle) {
        DOM.emailNotificationsToggle.checked = privacySettings.emailNotifications;
        DOM.emailNotificationsToggle.addEventListener('change', () => {
            savePrivacySetting('emailNotifications', DOM.emailNotificationsToggle.checked);
        });
    }
    
    if (DOM.usageAnalyticsToggle) {
        DOM.usageAnalyticsToggle.checked = privacySettings.usageAnalytics;
        DOM.usageAnalyticsToggle.addEventListener('change', () => {
            savePrivacySetting('usageAnalytics', DOM.usageAnalyticsToggle.checked);
        });
    }
}

function savePrivacySetting(setting, value) {
    const privacySettings = JSON.parse(localStorage.getItem('privacySettings')) || {};
    privacySettings[setting] = value;
    localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
    
    showToast(`Configuração de privacidade atualizada`, 'success');
}

// Profile Photo Functions
function setupProfilePhotoEvents() {
    const uploadBtn = DOM.uploadPhotoBtn;
    const removeBtn = DOM.removePhotoBtn;
    const photoInput = DOM.profilePhotoInput;
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            photoInput.click();
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', removeProfilePhoto);
    }
}

function loadProfilePhoto() {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const profileImage = userData.profileImage;
    const preview = DOM.profilePhotoPreview;
    const removeBtn = DOM.removePhotoBtn;
    
    if (preview) {
        if (profileImage) {
            preview.innerHTML = `<img src="${profileImage}" alt="Foto de perfil">`;
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        } else {
            preview.innerHTML = '<i class="fas fa-user"></i>';
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        updateProfilePhoto(imageDataUrl);
    };
    reader.readAsDataURL(file);
}

function updateProfilePhoto(imageDataUrl) {
    const preview = DOM.profilePhotoPreview;
    const removeBtn = DOM.removePhotoBtn;
    
    if (preview) {
        preview.innerHTML = `<img src="${imageDataUrl}" alt="Foto de perfil">`;
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    }
    
    // Save to localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData.profileImage = imageDataUrl;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update header if it exists
    updateHeaderProfilePhoto();
    
    showToast('Foto de perfil atualizada com sucesso!', 'success');
}

function removeProfilePhoto() {
    const preview = DOM.profilePhotoPreview;
    const removeBtn = DOM.removePhotoBtn;
    const photoInput = DOM.profilePhotoInput;
    
    if (preview) {
        preview.innerHTML = '<i class="fas fa-user"></i>';
        if (removeBtn) removeBtn.style.display = 'none';
    }
    
    if (photoInput) {
        photoInput.value = '';
    }
    
    // Remove from localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    delete userData.profileImage;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update header if it exists
    updateHeaderProfilePhoto();
    
    showToast('Foto de perfil removida com sucesso!', 'success');
}

function updateHeaderProfilePhoto() {
    // Try to update the header avatar if the header component is present
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const profileImage = userData.profileImage;
        
        if (profileImage) {
            userAvatar.innerHTML = `<img src="${profileImage}" alt="Foto de perfil" class="profile-image">`;
        } else {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
    }
}