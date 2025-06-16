/**
 * Settings - User Settings and Preferences
 */

// DOM Elements
const DOM = {
    menuItems: document.querySelectorAll('.settings-nav-item'),
    contentSections: document.querySelectorAll('.content-section'),
    userInfoForm: document.getElementById('userInfoForm'),
    nameInput: document.getElementById('name'),
    emailInput: document.getElementById('email'),
    cpfInput: document.getElementById('cpf'),
    birthDateInput: document.getElementById('birthDate'),
    profilePhotoInput: document.getElementById('profilePhotoInput'),
    profilePhotoPreview: document.getElementById('profilePhotoPreview'),
    uploadPhotoBtn: document.getElementById('uploadPhotoBtn'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    passwordForm: document.getElementById('passwordForm'),
    currentPasswordInput: document.getElementById('currentPassword'),
    newPasswordInput: document.getElementById('newPassword'),
    confirmPasswordInput: document.getElementById('confirmPassword'),
    currentPasswordToggle: document.getElementById('currentPasswordToggle'),
    newPasswordToggle: document.getElementById('newPasswordToggle'),
    confirmPasswordToggle: document.getElementById('confirmPasswordToggle'),
    strengthBar: document.querySelector('.strength-fill'),
    strengthText: document.querySelector('.strength-text'),
    dataSharingToggle: document.getElementById('dataSharing'),
    emailNotificationsToggle: document.getElementById('emailNotifications'),
    usageAnalyticsToggle: document.getElementById('usageAnalytics'),
    logoutBtn: document.getElementById('logoutBtn'),
    disconnectBtn: document.getElementById('disconnectBtn'),
    deleteAccountBtn: document.getElementById('deleteAccountBtn'),
    logoutModal: document.getElementById('logoutModal'),
    disconnectModal: document.getElementById('disconnectModal'),
    deleteAccountModal: document.getElementById('deleteAccountModal')
};

let profileForm, passwordForm, deleteConfirmationInput;
let disconnectModal, deleteAccountModal;
let passwordToggles = [];
let currentUser = null;
let connectedBanks = [];


document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadUserData();
    setupPasswordStrength();
    setupPasswordToggles();
    loadConnectedAccounts();
});

// Carrega as contas conectadas do banco de dados
async function loadConnectedAccounts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await fetch('/open-finance/connected-accounts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            connectedBanks = data.accounts || [];
            renderConnectedAccounts();
            // Update multi-connect UI after loading accounts
            updateConnectionStatus();
        } else {
            console.error('Failed to load connected accounts:', response.status);
            connectedBanks = [];
            renderConnectedAccounts();
            updateConnectionStatus();
        }
    } catch (error) {
        console.error('Error loading connected accounts:', error);
        connectedBanks = [];
        renderConnectedAccounts();
        updateConnectionStatus();
    }
}


function initializeElements() {
    profileForm = document.getElementById('profileForm');
    passwordForm = document.getElementById('passwordForm');
    deleteConfirmationInput = document.getElementById('deleteConfirmation');
    disconnectModal = document.getElementById('disconnectModal');
    deleteAccountModal = document.getElementById('deleteAccountModal');
    passwordToggles = document.querySelectorAll('.password-toggle');
}


function setupEventListeners() {
    setupMenuNavigation();
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    setupProfilePhotoEvents();
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }


    const disconnectBtn = document.getElementById('disconnectAccountsBtn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', showDisconnectModal);
    }


    // Multi-connect event listeners
    setupMultiConnectEventListeners();


    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', showDeleteModal);
    }

    setupModalEventListeners();
    if (deleteConfirmationInput) {
        deleteConfirmationInput.addEventListener('input', handleDeleteConfirmationInput);
    }
    
    setupSingleDisconnectModalListeners();
}


function setupModalEventListeners() {

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


    window.addEventListener('click', function(event) {
        if (event.target === disconnectModal) {
            hideDisconnectModal();
        }
        if (event.target === deleteAccountModal) {
            hideDeleteModal();
        }
    });


    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {

            if (disconnectModal && disconnectModal.classList.contains('show')) {
                hideDisconnectModal();
            }
            if (deleteAccountModal && deleteAccountModal.classList.contains('show')) {
                hideDeleteModal();
            }

            const singleDisconnectModal = document.getElementById('disconnectSingleModal');
            if (singleDisconnectModal && singleDisconnectModal.classList.contains('show')) {
                hideSingleDisconnectModal();
            }
        }
    });
}


async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch('/users', {
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


function populateUserData() {
    if (!currentUser) return;

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const birthDateInput = document.getElementById('birthDate');

    if (fullNameInput) fullNameInput.value = currentUser.name || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (cpfInput) cpfInput.value = formatCPF(currentUser.cpf) || '';
    if (birthDateInput && currentUser.birth_date) {

        const date = new Date(currentUser.birth_date);
        const formattedDate = date.toISOString().split('T')[0];
        birthDateInput.value = formattedDate;
    }

    loadProfilePhoto();
}


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
        const response = await fetch('/users', {
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


async function handlePasswordUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(passwordForm);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');


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
        const response = await fetch('/users', {
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


function setupPasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
}


function updatePasswordStrength(event) {
    const password = event.target.value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;

    const strength = calculatePasswordStrength(password);
    

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


function showDisconnectModal() {
    if (disconnectModal) {
        disconnectModal.classList.add('show');
    }
}


function hideDisconnectModal() {
    if (disconnectModal) {
        disconnectModal.classList.remove('show');
    }
}


async function handleDisconnectAccounts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Erro: Token de autenticação não encontrado', 'error');
            hideDisconnectModal();
            return;
        }

        const response = await fetch('/open-finance/disconnect-all', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Limpar todas as datas de sincronização salvas permanentemente
            localStorage.removeItem('institutionsSyncDates');
            // Datas de sincronização removidas
            
            // Recarrega as contas conectadas
            await loadConnectedAccounts();
            showToast('Todas as contas foram desvinculadas com sucesso!', 'success');
        } else {
            const errorData = await response.json();
            showToast(`Erro ao desvincular contas: ${errorData.error || 'Erro desconhecido'}`, 'error');
        }
    } catch (error) {
        console.error('Error disconnecting all accounts:', error);
        showToast('Erro ao desvincular todas as contas', 'error');
    }
    
    hideDisconnectModal();
}


function renderConnectedAccounts() {
    const connectedAccountsContainer = document.querySelector('.connected-accounts');
    const accountCountElement = document.querySelector('.open-finance-info .info-content p strong');
    
    if (!connectedAccountsContainer) return;
    

    if (accountCountElement) {
        accountCountElement.textContent = connectedBanks.length;
    }
    

    connectedAccountsContainer.innerHTML = '';
    

    connectedBanks.forEach(bank => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        
        accountItem.innerHTML = `
            <div class="account-info">
                <i class="fas fa-building"></i>
                <span>${bank.name}</span>
            </div>
            <div class="account-actions">
                <span class="account-status connected">Conectado</span>
                <button type="button" class="btn btn-sm btn-outline disconnect-single-btn" data-bank="${bank.name}" data-bank-id="${bank.id}">
                    <i class="fas fa-unlink"></i>
                    Desvincular
                </button>
            </div>
        `;
        
        connectedAccountsContainer.appendChild(accountItem);
    });
    

    setupIndividualDisconnectButtons();
}


function setupIndividualDisconnectButtons() {
    const disconnectButtons = document.querySelectorAll('.disconnect-single-btn');
    disconnectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bankName = this.getAttribute('data-bank');
            const bankId = this.getAttribute('data-bank-id');
            showSingleDisconnectModal(bankName, bankId);
        });
    });
}


function setupSingleDisconnectModalListeners() {
    const singleDisconnectModal = document.getElementById('disconnectSingleModal');
    const closeSingleDisconnectModal = document.getElementById('closeDisconnectSingleModal');
    const cancelSingleDisconnectBtn = document.getElementById('cancelDisconnectSingleBtn');
    const confirmSingleDisconnectBtn = document.getElementById('confirmDisconnectSingleBtn');

    if (closeSingleDisconnectModal) {
        closeSingleDisconnectModal.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideSingleDisconnectModal();
        });
    }
    if (cancelSingleDisconnectBtn) {
        cancelSingleDisconnectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideSingleDisconnectModal();
        });
    }
    if (confirmSingleDisconnectBtn) {
        confirmSingleDisconnectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleSingleDisconnect();
        });
    }

    // Click outside modal to close
    if (singleDisconnectModal) {
        window.addEventListener('click', function(event) {
            if (event.target === singleDisconnectModal) {
                hideSingleDisconnectModal();
            }
        });
    }
}


function showSingleDisconnectModal(bankName, bankId) {
    const singleDisconnectModal = document.getElementById('disconnectSingleModal');
    const bankNameSpan = document.getElementById('bankNameToDisconnect');
    
    if (singleDisconnectModal && bankNameSpan) {
        bankNameSpan.textContent = bankName;
        singleDisconnectModal.classList.add('show');

        singleDisconnectModal.setAttribute('data-bank', bankName);
        singleDisconnectModal.setAttribute('data-bank-id', bankId);
    }
}


function hideSingleDisconnectModal() {
    const singleDisconnectModal = document.getElementById('disconnectSingleModal');
    if (singleDisconnectModal) {
        singleDisconnectModal.classList.remove('show');
        singleDisconnectModal.removeAttribute('data-bank');
        singleDisconnectModal.removeAttribute('data-bank-id');
    }
}


async function handleSingleDisconnect() {
    const singleDisconnectModal = document.getElementById('disconnectSingleModal');
    const bankName = singleDisconnectModal ? singleDisconnectModal.getAttribute('data-bank') : '';
    const bankId = singleDisconnectModal ? singleDisconnectModal.getAttribute('data-bank-id') : '';
    
    if (!bankId) {
        showToast('Erro: ID do banco não encontrado', 'error');
        hideSingleDisconnectModal();
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Erro: Token de autenticação não encontrado', 'error');
            hideSingleDisconnectModal();
            return;
        }

        const response = await fetch(`/open-finance/disconnect/${bankId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Remover a data de sincronização salva permanentemente para esta instituição
            const savedSyncDates = localStorage.getItem('institutionsSyncDates');
            if (savedSyncDates) {
                try {
                    const syncDatesObj = JSON.parse(savedSyncDates);
                    delete syncDatesObj[bankId.toString()];
                    localStorage.setItem('institutionsSyncDates', JSON.stringify(syncDatesObj));
                    // Data de sincronização removida
                } catch (e) {
                    // Erro ao remover data de sincronização
                }
            }
            
            // Recarrega as contas conectadas
            await loadConnectedAccounts();
            showToast(`${bankName} desvinculado com sucesso!`, 'success');
        } else {
            const errorData = await response.json();
            showToast(`Erro ao desvincular ${bankName}: ${errorData.error || 'Erro desconhecido'}`, 'error');
        }
    } catch (error) {
        console.error('Error disconnecting account:', error);
        showToast(`Erro ao desvincular ${bankName}`, 'error');
    }
    
    hideSingleDisconnectModal();
}


function addConnectedBank(bankData) {

    const existingBank = connectedBanks.find(bank => bank.name === bankData.name);
    if (existingBank) {
        showToast(`${bankData.name} já está conectado!`, 'info');
        return;
    }

    const newBank = {
        id: Date.now(),
        name: bankData.name
    };
    
    connectedBanks.push(newBank);

    renderConnectedAccounts();
    
    showToast(`${bankData.name} conectado com sucesso!`, 'success');
}


// Multi-connect functionality
let selectedBanks = new Set();
let connectingBanks = new Set();
let connectionProgress = 0;

function handleConnectNewAccount() {
    // This function is now replaced by the multi-connect functionality
    console.log('Multi-connect functionality is now active');
}


function showDeleteModal() {
    if (deleteAccountModal) {
        deleteAccountModal.classList.add('show');

        if (deleteConfirmationInput) {
            deleteConfirmationInput.value = '';
            updateDeleteButton();
        }
    }
}


function hideDeleteModal() {
    if (deleteAccountModal) {
        deleteAccountModal.classList.remove('show');
    }
}


function handleDeleteConfirmationInput() {
    updateDeleteButton();
}


function updateDeleteButton() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn && deleteConfirmationInput) {
        const isValid = deleteConfirmationInput.value.trim().toUpperCase() === 'DELETAR';
        confirmDeleteBtn.disabled = !isValid;
    }
}


async function handleDeleteAccount() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/users', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            showToast('Conta deletada com sucesso', 'success');
            hideDeleteModal();
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao deletar conta');
        }
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        showToast(error.message, 'error');
    }
}


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


    document.body.appendChild(toast);


    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });


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


function setupMenuNavigation() {

    DOM.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('data-section');
            switchToSection(targetSection);
        });
    });
    
    switchToSection('personal');
    setupPrivacyToggles();
}

function switchToSection(sectionName) {

    DOM.menuItems.forEach(item => {
        item.classList.remove('active');
    });

    DOM.contentSections.forEach(section => {
        section.classList.remove('active');
    });

    const activeMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function setupPrivacyToggles() {

    const privacySettings = JSON.parse(localStorage.getItem('privacySettings')) || {
        dataSharing: true,
        emailNotifications: true,
        usageAnalytics: false
    };

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
    

    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
    }

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

    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData.profileImage = imageDataUrl;
    localStorage.setItem('userData', JSON.stringify(userData));

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

    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    delete userData.profileImage;
    localStorage.setItem('userData', JSON.stringify(userData));

    updateHeaderProfilePhoto();
    
    showToast('Foto de perfil removida com sucesso!', 'success');
}

function updateHeaderProfilePhoto() {
    // Get user avatar element
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

// ===== MULTI-CONNECT FUNCTIONALITY =====

function setupMultiConnectEventListeners() {
    // Checkbox change events
    const bankCheckboxes = document.querySelectorAll('.bank-checkbox');
    bankCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleBankSelection);
    });
    
    // Institution card click events
    const institutionCards = document.querySelectorAll('.institution-card-settings');
    institutionCards.forEach(card => {
        card.addEventListener('click', handleCardClick);
    });
    
    // Connect buttons
    const selectAllBtn = document.getElementById('selectAllBtn');
    const connectSelectedBtn = document.getElementById('connectSelectedBtn');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', handleSelectAll);
    }
    
    if (connectSelectedBtn) {
        connectSelectedBtn.addEventListener('click', handleConnectSelected);
    }
    
    // Initialize connection status after a short delay to ensure connectedBanks is loaded
    setTimeout(() => {
        updateConnectionStatus();
    }, 100);
}

function handleBankSelection(event) {
    const bankId = event.target.id.replace('bank-', '');
    const card = event.target.closest('.institution-card-settings');
    
    if (event.target.checked) {
        selectedBanks.add(bankId);
        card.classList.add('selected');
    } else {
        selectedBanks.delete(bankId);
        card.classList.remove('selected');
    }
    
    updateSelectionUI();
}

function handleCardClick(event) {
    // Don't trigger if clicking on checkbox or if card is connected/connecting
    if (event.target.type === 'checkbox' || 
        event.currentTarget.classList.contains('connected') ||
        event.currentTarget.classList.contains('connecting')) {
        return;
    }
    
    const checkbox = event.currentTarget.querySelector('.bank-checkbox');
    if (checkbox && !checkbox.disabled) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
    }
}

function handleSelectAll() {
    const availableCheckboxes = document.querySelectorAll('.bank-checkbox:not(:disabled)');
    const allSelected = Array.from(availableCheckboxes).every(cb => cb.checked);
    
    availableCheckboxes.forEach(checkbox => {
        const shouldCheck = !allSelected;
        if (checkbox.checked !== shouldCheck) {
            checkbox.checked = shouldCheck;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
    
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        const text = allSelected ? 'Selecionar Todas' : 'Desmarcar Todas';
        selectAllBtn.innerHTML = `<i class="fas fa-check-double"></i> ${text}`;
    }
}

function updateSelectionUI() {
    const selectedCount = selectedBanks.size;
    const selectedCountElement = document.getElementById('selectedCount');
    const connectSelectedBtn = document.getElementById('connectSelectedBtn');
    
    if (selectedCountElement) {
        selectedCountElement.textContent = selectedCount;
    }
    
    if (connectSelectedBtn) {
        connectSelectedBtn.disabled = selectedCount === 0;
        connectSelectedBtn.innerHTML = selectedCount === 0 
            ? '<i class="fas fa-link"></i> Conectar Selecionadas'
            : `<i class="fas fa-link"></i> Conectar ${selectedCount} Conta${selectedCount > 1 ? 's' : ''}`;
    }
}

async function handleConnectSelected() {
    if (selectedBanks.size === 0) {
        showToast('Selecione pelo menos uma instituição para conectar', 'error');
        return;
    }
    
    const selectedArray = Array.from(selectedBanks);
    const totalBanks = selectedArray.length;
    
    showConnectionProgress();
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    // Connect banks sequentially to avoid overwhelming the backend
    for (let i = 0; i < selectedArray.length; i++) {
        const bankId = selectedArray[i];
        updateProgressBar(((i + 1) / totalBanks) * 100);
        
        try {
            setCardConnecting(bankId, true);
            const result = await connectBank(bankId);
            
            if (result.success) {
                successCount++;
                setCardConnected(bankId, true);
                results.push({ bankId, success: true, message: result.message });
                
                // Remove from selected banks
                selectedBanks.delete(bankId);
                const checkbox = document.getElementById(`bank-${bankId}`);
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                }
            } else {
                errorCount++;
                results.push({ bankId, success: false, message: result.message });
            }
        } catch (error) {
            errorCount++;
            results.push({ bankId, success: false, message: error.message });
        } finally {
            setCardConnecting(bankId, false);
        }
    }
    
    updateProgressBar(100);
    
    // Hide progress after a short delay
    setTimeout(() => {
        hideConnectionProgress();
    }, 1000);
    
    // Show results
    showConnectionResults(successCount, errorCount, results);
    
    // Update UI
    updateSelectionUI();
    
    // Reload connected accounts to reflect changes
    setTimeout(() => {
        loadConnectedAccounts();
    }, 1500);
}

async function connectBank(bankId) {
    const endpoints = {
        vitor: '/open-finance/link-vitor',
        lucas: '/open-finance/link-lucas',
        caputi: '/open-finance/link-caputi',
        dante: '/open-finance/link-dante',
        raul: '/open-finance/link-raul',
        patricia: '/open-finance/link-patricia'
    };
    
    const endpoint = endpoints[bankId];
    if (!endpoint) {
        throw new Error(`Endpoint não encontrado para ${bankId}`);
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token de autenticação não encontrado');
    }
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consent: true })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        return { 
            success: true, 
            message: data.message || `Banco ${bankId} conectado com sucesso!` 
        };
    } else {
        return { 
            success: false, 
            message: data.error || `Erro ao conectar ${bankId}` 
        };
    }
}

function setCardConnecting(bankId, connecting) {
    const card = document.querySelector(`[data-bank-id="${bankId}"]`);
    const statusElement = document.getElementById(`status-${bankId}`);
    
    if (card && statusElement) {
        if (connecting) {
            card.classList.add('connecting');
            statusElement.innerHTML = '<span class="status-text">Conectando...</span>';
            connectingBanks.add(bankId);
        } else {
            card.classList.remove('connecting');
            connectingBanks.delete(bankId);
        }
    }
}

function setCardConnected(bankId, connected) {
    const card = document.querySelector(`[data-bank-id="${bankId}"]`);
    const statusElement = document.getElementById(`status-${bankId}`);
    const checkbox = document.getElementById(`bank-${bankId}`);
    
    if (card && statusElement) {
        if (connected) {
            card.classList.add('connected');
            card.classList.remove('selected');
            statusElement.classList.add('connected');
            statusElement.innerHTML = '<span class="status-text">Conectado</span>';
            
            if (checkbox) {
                checkbox.disabled = true;
                checkbox.checked = false;
            }
        } else {
            card.classList.remove('connected');
            statusElement.classList.remove('connected');
            statusElement.innerHTML = '<span class="status-text">Não conectado</span>';
            
            if (checkbox) {
                checkbox.disabled = false;
            }
        }
    }
}

function showConnectionProgress() {
    let progressElement = document.querySelector('.connection-progress');
    if (!progressElement) {
        progressElement = document.createElement('div');
        progressElement.className = 'connection-progress';
        progressElement.innerHTML = '<div class="connection-progress-bar"></div>';
        document.body.appendChild(progressElement);
    }
    progressElement.style.display = 'block';
}

function updateProgressBar(percentage) {
    const progressBar = document.querySelector('.connection-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

function hideConnectionProgress() {
    const progressElement = document.querySelector('.connection-progress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
}

function showConnectionResults(successCount, errorCount, results) {
    const totalCount = successCount + errorCount;
    
    if (successCount === totalCount) {
        showToast(`${successCount} conta${successCount > 1 ? 's' : ''} conectada${successCount > 1 ? 's' : ''} com sucesso!`, 'success');
    } else if (errorCount === totalCount) {
        showToast(`Erro ao conectar todas as contas selecionadas`, 'error');
    } else {
        showToast(`${successCount} conta${successCount > 1 ? 's' : ''} conectada${successCount > 1 ? 's' : ''}, ${errorCount} com erro`, 'info');
    }
    
    // Log detailed results for debugging
    console.log('Connection results:', results);
}

function updateConnectionStatus() {
    // Reset all cards to disconnected first
    const allCards = document.querySelectorAll('.institution-card-settings');
    allCards.forEach(card => {
        const bankId = card.getAttribute('data-bank-id');
        if (bankId) {
            setCardConnected(bankId, false);
        }
    });
    
    // This will be called after loading connected accounts to update UI
    if (connectedBanks && connectedBanks.length > 0) {
        connectedBanks.forEach(account => {
            // Extract bank ID from account data
            const bankId = getBankIdFromAccount(account);
            if (bankId) {
                setCardConnected(bankId, true);
            }
        });
        
        // Update connected count display
        const connectedCountDisplay = document.getElementById('connectedCountDisplay');
        if (connectedCountDisplay) {
            const count = connectedBanks.length;
            connectedCountDisplay.textContent = `${count} conta${count > 1 ? 's' : ''}`;
        }
    } else {
        // Update connected count display
        const connectedCountDisplay = document.getElementById('connectedCountDisplay');
        if (connectedCountDisplay) {
            connectedCountDisplay.textContent = '0 contas';
        }
    }
}

function getBankIdFromAccount(account) {
    // Map account sources to bank IDs
    const sourceMap = {
        'vitor': 'vitor',
        'lucas': 'lucas',
        'patricia': 'patricia',
        'dante': 'dante',
        'raul': 'raul',
        'caputi': 'caputi'
    };
    
    return sourceMap[account.api_source] || null;
}