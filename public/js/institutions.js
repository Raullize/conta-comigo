/**
 * Institutions - Financial Institution Management
 */

// Institutions page JavaScript

// Application state
let currentFilter = 'recent';
let institutions = [];
let isLoading = false;

// DOM elements
let institutionsGrid;
let filterButtons;
let statsElements;

// Initialize the institutions page
function initializeInstitutions() {
    // Get DOM elements
    institutionsGrid = document.getElementById('institutionsGrid');
    filterButtons = document.querySelectorAll('.filter-btn');
    
    // Load connected institutions
    loadConnectedInstitutions();
    
    // Setup event listeners
    setupEventListeners();
    setupCardEventListeners();
    setupModalListeners();
    
    console.log('Institutions page initialized');
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setActiveFilter(filter);
        });
    });
    

    
    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshData);
    }
}

// Load connected institutions from backend
async function loadConnectedInstitutions() {
    try {
        isLoading = true;
        showLoadingState();
        
        const response = await fetch('/open-finance/connected-accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load institutions');
        }
        
        const data = await response.json();
        institutions = data.accounts.map(account => ({
            id: account.id,
            name: account.name,
            status: 'active',
            lastSync: new Date().toISOString()
        }));
        
        updateStats();
        renderInstitutions();
    } catch (error) {
        console.error('Error loading institutions:', error);
        showNotification('Erro ao carregar instituições', 'error');
        renderEmptyState();
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Update statistics
function updateStats() {
    const activeInstitutions = institutions.filter(inst => inst.status === 'active').length;
    const totalAccounts = activeInstitutions; // 1 conta por instituição
    const lastSync = getLastSyncTime();
    
    // Update stat numbers
    const connectedElement = document.getElementById('totalInstitutions');
    const accountsElement = document.getElementById('totalAccounts');
    const lastSyncElement = document.getElementById('lastSync');
    
    if (connectedElement) connectedElement.textContent = activeInstitutions;
    if (accountsElement) accountsElement.textContent = totalAccounts;
    if (lastSyncElement) lastSyncElement.textContent = lastSync;
}

// Get last sync time formatted
function getLastSyncTime() {
    const activeSyncs = institutions
        .filter(inst => inst.status === 'active')
        .map(inst => new Date(inst.lastSync))
        .sort((a, b) => b - a);
    
    if (activeSyncs.length === 0) return 'Nunca';
    
    const lastSync = activeSyncs[0];
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
    
    if (diffMinutes < 60) {
        return `${diffMinutes} min atrás`;
    } else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours}h atrás`;
    } else {
        const days = Math.floor(diffMinutes / 1440);
        return `${days}d atrás`;
    }
}

// Set active filter
function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    filterButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });
    
    // Render filtered institutions
    renderInstitutions();
}

// Filter institutions based on current filter
function getFilteredInstitutions() {
    const sortedInstitutions = [...institutions];
    
    if (currentFilter === 'recent') {
        // Ordenar por última sincronização (mais recente primeiro)
        return sortedInstitutions.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));
    } else if (currentFilter === 'oldest') {
        // Ordenar por sincronização mais antiga (mais antiga primeiro)
        return sortedInstitutions.sort((a, b) => new Date(a.lastSync) - new Date(b.lastSync));
    }
    
    return sortedInstitutions;
}

// Render institutions grid
function renderInstitutions() {
    if (!institutionsGrid) return;
    
    const filteredInstitutions = getFilteredInstitutions();
    
    if (filteredInstitutions.length === 0) {
        renderEmptyState();
        return;
    }
    
    institutionsGrid.innerHTML = filteredInstitutions.map(institution => 
        createInstitutionCard(institution)
    ).join('');
    
    // Setup card event listeners
    setupCardEventListeners();
}

// Create institution card HTML
function createInstitutionCard(institution) {
    return `
        <div class="institution-card" data-id="${institution.id}">
            <div class="institution-header">
                <div class="institution-icon">
                    <i class="fas fa-university"></i>
                </div>
                <div class="institution-info">
                    <h3 class="institution-name">${institution.name}</h3>
                    <p class="institution-sync">Última sincronização: ${formatDate(institution.lastSync)}</p>
                </div>
            </div>
            
            <div class="institution-actions">
                <button class="action-btn primary" onclick="syncInstitution(${institution.id})">
                    <i class="fas fa-sync-alt"></i>
                    Sincronizar
                </button>
                <button class="action-btn danger" onclick="disconnectInstitution(${institution.id})">
                    <i class="fas fa-unlink"></i>
                    Desconectar
                </button>
            </div>
        </div>
    `;
}

// Funções getStatusText e getActionButtons removidas - não mais necessárias

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Hoje';
    } else if (diffDays === 1) {
        return 'Ontem';
    } else if (diffDays < 7) {
        return `${diffDays}d atrás`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

// Render empty state
function renderEmptyState() {
    const emptyMessage = 'Nenhuma instituição conectada ainda';
    const emptyDescription = 'Conecte suas contas bancárias para começar a gerenciar suas finanças de forma integrada.';
    
    institutionsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-university"></i>
            </div>
            <h3 class="empty-title">${emptyMessage}</h3>
            <p class="empty-description">${emptyDescription}</p>
            <button class="btn btn-primary" onclick="handleConnectInstitution()">Vincular Primeira Conta</button>
        </div>
    `;
}

// Get filter label (não mais necessário)
// function getFilterLabel removida

// Setup card event listeners
function setupCardEventListeners() {
    // Add any additional card-specific event listeners here
}

// Show/hide loading state
function showLoadingState() {
    institutionsGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Carregando instituições...</p>
        </div>
    `;
}

function hideLoadingState() {
    // Loading state will be replaced by renderInstitutions or renderEmptyState
}

// Modal elements
let syncModal, disconnectModal;
let currentInstitutionId = null;

function setupModalListeners() {
    // Get modal elements
    syncModal = document.getElementById('syncModal');
    disconnectModal = document.getElementById('disconnectModal');
    
    // Sync modal listeners
    document.getElementById('closeSyncModal').addEventListener('click', hideSyncModal);
    document.getElementById('cancelSyncBtn').addEventListener('click', hideSyncModal);
    document.getElementById('confirmSyncBtn').addEventListener('click', () => {
        if (currentInstitutionId) {
            handleSyncInstitution(currentInstitutionId);
            hideSyncModal();
        }
    });
    
    // Disconnect modal listeners
    document.getElementById('closeDisconnectModal').addEventListener('click', hideDisconnectModal);
    document.getElementById('cancelDisconnectBtn').addEventListener('click', hideDisconnectModal);
    document.getElementById('confirmDisconnectBtn').addEventListener('click', () => {
        if (currentInstitutionId) {
            handleDisconnectInstitution(currentInstitutionId);
            hideDisconnectModal();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === syncModal) {
            hideSyncModal();
        }
        if (event.target === disconnectModal) {
            hideDisconnectModal();
        }
    });
    
    // Close modals with ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideSyncModal();
            hideDisconnectModal();
        }
    });
}

// Show sync modal
function showSyncModal(institution) {
    currentInstitutionId = institution.id;
    document.getElementById('syncInstitutionName').textContent = institution.name;
    syncModal.classList.add('show');
}

// Hide sync modal
function hideSyncModal() {
    syncModal.classList.remove('show');
    currentInstitutionId = null;
}

// Show disconnect modal
function showDisconnectModal(institution) {
    currentInstitutionId = institution.id;
    document.getElementById('disconnectInstitutionName').textContent = institution.name;
    disconnectModal.classList.add('show');
}

// Hide disconnect modal
function hideDisconnectModal() {
    disconnectModal.classList.remove('show');
    currentInstitutionId = null;
}

// Action handlers
function syncInstitution(id) {
    const institution = institutions.find(inst => inst.id === id);
    if (institution) {
        showSyncModal(institution);
    }
}

function disconnectInstitution(id) {
    const institution = institutions.find(inst => inst.id === id);
    if (institution) {
        showDisconnectModal(institution);
    }
}

// Make functions globally available for onclick handlers
window.syncInstitution = syncInstitution;
window.disconnectInstitution = disconnectInstitution;

// Sync institution
async function handleSyncInstitution(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token de autenticação não encontrado');
        }
        
        const response = await fetch(`/open-finance/sync/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao sincronizar instituição');
        }
        
        const data = await response.json();
        
        // Update last sync time
        const institution = institutions.find(inst => inst.id === id);
        if (institution) {
            institution.lastSync = data.lastSync || new Date().toISOString();
        }
        
        updateStats();
        renderInstitutions();
        
        showNotification('Dados sincronizados com sucesso', 'success');
    } catch (error) {
        console.error('Error syncing institution:', error);
        showNotification(error.message || 'Erro ao sincronizar dados', 'error');
    }
}

// Disconnect institution
async function handleDisconnectInstitution(id) {
    try {
        showNotification('Desconectando instituição...', 'info');
        
        const response = await fetch(`/open-finance/disconnect/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to disconnect institution');
        }
        
        // Remove institution from list
        institutions = institutions.filter(inst => inst.id !== id);
        updateStats();
        renderInstitutions();
        showNotification('Instituição desconectada com sucesso', 'success');
    } catch (error) {
        console.error('Error disconnecting institution:', error);
        showNotification('Erro ao desconectar instituição', 'error');
    }
}

function handleConnectInstitution() {
    console.log('Connect new institution');
    // TODO: Implement connection flow
    showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Make function globally available for onclick handlers
window.handleConnectInstitution = handleConnectInstitution;

function handleRefreshData() {
    loadConnectedInstitutions();
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#36b37e';
            break;
        case 'error':
            notification.style.backgroundColor = '#ff6b6b';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffa726';
            break;
        default:
            notification.style.backgroundColor = '#0066cc';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInstitutions);
} else {
    initializeInstitutions();
}