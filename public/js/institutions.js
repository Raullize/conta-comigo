/**
 * Institutions - Financial Institution Management
 */

// Application state
let currentFilter = 'recent';
let institutions = [];
let isLoading = false;

// DOM elements
let institutionsGrid;
let filterButtons;

// Initialize the institutions page
function initializeInstitutions() {
    institutionsGrid = document.getElementById('institutionsGrid');
    filterButtons = document.querySelectorAll('.filter-btn');
    
    loadConnectedInstitutions();
    setupEventListeners();
    setupCardEventListeners();
    setupModalListeners();
}

// Setup event listeners
function setupEventListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setActiveFilter(filter);
        });
    });
    
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshData);
    }
}

// Load connected institutions from backend
async function loadConnectedInstitutions() {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();
    
    try {
        // Carregar datas de sincronização salvas permanentemente
        const savedSyncDates = localStorage.getItem('institutionsSyncDates');
        let syncDatesMap = new Map();
        if (savedSyncDates) {
            try {
                const syncDatesObj = JSON.parse(savedSyncDates);
                syncDatesMap = new Map(Object.entries(syncDatesObj));
                console.log('Loaded saved sync dates:', syncDatesObj);
            } catch (e) {
                console.log('Error parsing saved sync dates:', e);
            }
        }
        
        console.log('Loading institutions from server');
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token found' : 'No token');
        console.log('Current user CPF from token:', token ? JSON.parse(atob(token.split('.')[1])).cpf : 'No CPF');
        
        console.log('Making request to /open-finance/connected-accounts');
        console.log('Request headers:', {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'No token'
        });
        
        const response = await fetch('/open-finance/connected-accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            console.error('Full response details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            throw new Error(`Failed to load institutions: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Loaded accounts from server:', data);
        console.log('Raw accounts data:', data.accounts);
        console.log('Accounts count from API:', data.count);
        console.log('Data type check:', {
            dataType: typeof data,
            accountsType: typeof data.accounts,
            isAccountsArray: Array.isArray(data.accounts),
            accountsLength: data.accounts ? data.accounts.length : 'undefined'
        });
        
        if (!data.accounts || !Array.isArray(data.accounts)) {
            console.warn('No accounts array found in response');
            institutions = [];
        } else {
            institutions = data.accounts.map(account => {
                console.log('Processing account:', account);
                console.log('Account lastSync value:', account.lastSync);
                console.log('Account lastSync type:', typeof account.lastSync);
                
                // Usar data salva permanentemente se existir, senão usar do servidor
                const savedSyncDate = syncDatesMap.get(account.id.toString());
                const lastSyncToUse = savedSyncDate || account.lastSync;
                
                console.log('Using lastSync:', lastSyncToUse, '(saved:', savedSyncDate, ', server:', account.lastSync, ')');
                
                return {
                    id: account.id,
                    name: account.name,
                    status: 'active',
                    lastSync: lastSyncToUse,
                    balance: parseFloat(account.balance) || 0
                };
            });
        }
        console.log('Mapped institutions:', institutions);
        console.log('Total institutions found:', institutions.length);
        console.log('Will render institutions now...');
        
        // Cache removido para garantir dados sempre atualizados
        
        updateStats();
        renderInstitutions();
    } catch (error) {
        console.log('Error loading from server, trying cache as fallback');
        const cachedData = localStorage.getItem('institutionsCache');
        if (cachedData) {
            institutions = JSON.parse(cachedData);
            updateStats();
            renderInstitutions();
            showNotification('Dados carregados do cache local', 'warning');
        } else {
            showNotification('Erro ao carregar instituições', 'error');
            renderEmptyState();
        }
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Update statistics
function updateStats() {
    const activeInstitutions = institutions.filter(inst => inst.status === 'active').length;
    const totalAccounts = activeInstitutions;
    const lastSync = getLastSyncTime();
    
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
        .filter(inst => inst.status === 'active' && inst.lastSync)
        .map(inst => {
            const date = new Date(inst.lastSync);
            // Verificar se a data é válida
            return isNaN(date.getTime()) ? null : date;
        })
        .filter(date => date !== null)
        .sort((a, b) => b - a);
    
    if (activeSyncs.length === 0) {
        return 'Nunca';
    }
    
    const lastSync = activeSyncs[0];
    const now = new Date();
    const diffMs = now - lastSync;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    // Garantir que diffMinutes não seja negativo
    const safeDiffMinutes = Math.max(0, diffMinutes);
    
    if (safeDiffMinutes === 0) {
        return 'Agora mesmo';
    } else if (safeDiffMinutes < 60) {
        return `${safeDiffMinutes} min atrás`;
    } else if (safeDiffMinutes < 1440) {
        const hours = Math.floor(safeDiffMinutes / 60);
        return `${hours}h atrás`;
    } else {
        const days = Math.floor(safeDiffMinutes / 1440);
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
        return sortedInstitutions.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));
    } else if (currentFilter === 'oldest') {
        return sortedInstitutions.sort((a, b) => new Date(a.lastSync) - new Date(b.lastSync));
    }
    
    return sortedInstitutions;
}

// Render institutions grid
function renderInstitutions() {
    console.log('renderInstitutions called');
    console.log('institutionsGrid element:', institutionsGrid);
    
    if (!institutionsGrid) {
        console.error('institutionsGrid element not found!');
        return;
    }
    
    const filteredInstitutions = getFilteredInstitutions();
    console.log('Filtered institutions for rendering:', filteredInstitutions);
    
    if (filteredInstitutions.length === 0) {
        console.log('No institutions to render, showing empty state');
        renderEmptyState();
        return;
    }
    
    console.log('Creating cards for', filteredInstitutions.length, 'institutions');
    const cardsHTML = filteredInstitutions.map(institution => {
        const cardHTML = createInstitutionCard(institution);
        console.log('Created card for institution:', institution.name);
        return cardHTML;
    }).join('');
    
    institutionsGrid.innerHTML = cardsHTML;
    console.log('Cards inserted into DOM');
    
    setupCardEventListeners();
}

// Create institution card HTML
function createInstitutionCard(institution) {
    // Determinar ícone baseado no nome da instituição
    let iconClass = 'fas fa-university';
    let cardClass = 'institution-card';
    
    if (institution.name.includes('Lucas')) {
        iconClass = 'fas fa-piggy-bank';
        cardClass += ' lucas-bank';
    } else if (institution.name.includes('Vitor')) {
        iconClass = 'fas fa-landmark';
        cardClass += ' vitor-bank';
    } else if (institution.name.includes('Patricia')) {
        iconClass = 'fas fa-coins';
        cardClass += ' patricia-bank';
    } else if (institution.name.includes('Dante')) {
        iconClass = 'fas fa-chart-line';
        cardClass += ' dante-bank';
    } else if (institution.name.includes('Raul')) {
        iconClass = 'fas fa-wallet';
        cardClass += ' raul-bank';
    }
    
    return `
        <div class="${cardClass}" data-id="${institution.id}" data-institution-name="${institution.name}">
            <div class="institution-header">
                <div class="institution-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="institution-info">
                    <h3 class="institution-name">${institution.name}</h3>
                    <p class="institution-sync">Última sincronização: ${formatDate(institution.lastSync)}</p>
                    <p class="institution-balance">Saldo: R$ ${(institution.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>
            
            <div class="institution-actions">
                <button class="action-btn primary" onclick="syncInstitution('${institution.id}', '${institution.name}')">
                    <i class="fas fa-sync-alt"></i>
                    Sincronizar
                </button>
                <button class="action-btn danger" onclick="disconnectInstitution('${institution.id}', '${institution.name}')">
                    <i class="fas fa-unlink"></i>
                    Desconectar
                </button>
            </div>
        </div>
    `;
}



// Format date
function formatDate(dateString) {
    if (!dateString) {
        return 'Nunca';
    }
    
    const date = new Date(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
        return 'Nunca';
    }
    
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
    console.log('renderEmptyState called - showing empty state');
    console.log('Current institutions array:', institutions);
    
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



// Setup card event listeners
function setupCardEventListeners() {
    // Card-specific event listeners can be added here if needed
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
let currentInstitutionName = null;

function setupModalListeners() {
    // Get modal elements
    syncModal = document.getElementById('syncModal');
    disconnectModal = document.getElementById('disconnectModal');
    
    // Sync modal listeners
    document.getElementById('closeSyncModal').addEventListener('click', hideSyncModal);
    document.getElementById('cancelSyncBtn').addEventListener('click', hideSyncModal);
    document.getElementById('confirmSyncBtn').addEventListener('click', () => {
        if (currentInstitutionId && currentInstitutionName) {
            handleSyncInstitution(currentInstitutionId, currentInstitutionName);
            hideSyncModal();
        }
    });
    
    // Disconnect modal listeners
    document.getElementById('closeDisconnectModal').addEventListener('click', hideDisconnectModal);
    document.getElementById('cancelDisconnectBtn').addEventListener('click', hideDisconnectModal);
    document.getElementById('confirmDisconnectBtn').addEventListener('click', () => {
        if (currentInstitutionId && currentInstitutionName) {
            handleDisconnectInstitution(currentInstitutionId, currentInstitutionName);
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
    currentInstitutionName = null;
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
    currentInstitutionName = null;
}

// Action handlers
function syncInstitution(id, institutionName) {
    console.log('syncInstitution called with:', id, institutionName);
    // Converter ID para número se necessário
    const numericId = parseInt(id);
    const institution = institutions.find(inst => inst.id === numericId || inst.id === id);
    if (institution) {
        // Armazenar informações para uso no modal
        currentInstitutionId = institution.id;
        currentInstitutionName = institutionName || institution.name;
        showSyncModal(institution);
    } else {
        console.error('Institution not found:', id, 'Available institutions:', institutions.map(i => ({id: i.id, name: i.name})));
    }
}

function disconnectInstitution(id, institutionName) {
    console.log('disconnectInstitution called with:', id, institutionName);
    // Converter ID para número se necessário
    const numericId = parseInt(id);
    const institution = institutions.find(inst => inst.id === numericId || inst.id === id);
    if (institution) {
        // Armazenar informações para uso no modal
        currentInstitutionId = institution.id;
        currentInstitutionName = institutionName || institution.name;
        showDisconnectModal(institution);
    } else {
        console.error('Institution not found:', id, 'Available institutions:', institutions.map(i => ({id: i.id, name: i.name})));
    }
}

// Make functions globally available for onclick handlers
window.syncInstitution = syncInstitution;
window.disconnectInstitution = disconnectInstitution;
window.handleSyncInstitution = handleSyncInstitution;
window.handleDisconnectInstitution = handleDisconnectInstitution;

// Sync institution
async function handleSyncInstitution(id, institutionName) {
    console.log('handleSyncInstitution called with:', id, institutionName);
    // Garantir que o ID seja do tipo correto
    const institutionId = parseInt(id) || id;
    
    try {
        // Mostrar loading no botão específico
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const syncButton = card?.querySelector('.action-btn.primary');
        
        if (syncButton) {
            syncButton.disabled = true;
            syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
        }
        
        showNotification(`Sincronizando ${institutionName}...`, 'info');
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token de autenticação não encontrado');
        }
        
        const response = await fetch(`/open-finance/sync/${institutionId}`, {
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
        
        // Update last sync time and balance
        const institution = institutions.find(inst => inst.id === institutionId);
        if (institution) {
            const newSyncDate = data.lastSync || new Date().toISOString();
            institution.lastSync = newSyncDate;
            if (data.newBalance !== undefined) {
                institution.balance = parseFloat(data.newBalance) || 0;
            }
            
            // Salvar data de sincronização permanentemente
            const savedSyncDates = localStorage.getItem('institutionsSyncDates');
            let syncDatesObj = {};
            if (savedSyncDates) {
                try {
                    syncDatesObj = JSON.parse(savedSyncDates);
                } catch (e) {
                    console.log('Error parsing saved sync dates:', e);
                }
            }
            syncDatesObj[institutionId.toString()] = newSyncDate;
            localStorage.setItem('institutionsSyncDates', JSON.stringify(syncDatesObj));
            console.log('Saved sync date permanently for institution', institutionId, ':', newSyncDate);
            
            // Atualizar cache
            localStorage.setItem('institutionsCache', JSON.stringify(institutions));
            localStorage.setItem('institutionsCacheTimestamp', Date.now().toString());
        }
        
        updateStats();
        renderInstitutions();
        
        showNotification(`${institutionName} sincronizado com sucesso!`, 'success');
        
        // Não recarregar automaticamente para preservar a data de sincronização atualizada
        
    } catch (error) {
        console.error('Error syncing account:', error);
        showNotification(`Erro ao sincronizar ${institutionName || 'conta'}: ${error.message}`, 'error');
    } finally {
        // Restaurar botão
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const syncButton = card?.querySelector('.action-btn.primary');
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar';
        }
    }
}

// Disconnect institution
async function handleDisconnectInstitution(id, institutionName) {
    console.log('handleDisconnectInstitution called with:', id, institutionName);
    // Garantir que o ID seja do tipo correto
    const institutionId = parseInt(id) || id;
    
    try {
        // Mostrar loading no botão específico
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const disconnectButton = card?.querySelector('.action-btn.danger');
        
        if (disconnectButton) {
            disconnectButton.disabled = true;
            disconnectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Desconectando...';
        }
        
        showNotification(`Desconectando ${institutionName}...`, 'info');
        
        const response = await fetch(`/open-finance/disconnect/${institutionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to disconnect institution');
        }
        
        // Remover a data de sincronização salva permanentemente para esta instituição
        const savedSyncDates = localStorage.getItem('institutionsSyncDates');
        if (savedSyncDates) {
            try {
                const syncDatesObj = JSON.parse(savedSyncDates);
                delete syncDatesObj[institutionId.toString()];
                localStorage.setItem('institutionsSyncDates', JSON.stringify(syncDatesObj));
                console.log('Removed saved sync date for disconnected institution:', institutionId);
            } catch (e) {
                console.log('Error removing saved sync date:', e);
            }
        }
        
        // Remove institution from list
        institutions = institutions.filter(inst => inst.id !== institutionId);
        
        // Update cache
        localStorage.setItem('institutionsCache', JSON.stringify(institutions));
        localStorage.setItem('institutionsCacheTimestamp', Date.now().toString());
        
        updateStats();
        renderInstitutions();
        showNotification(`${institutionName} desconectado com sucesso!`, 'success');
        
        // Disparar evento personalizado para notificar desconexão
        window.dispatchEvent(new CustomEvent('accountDisconnected', {
            detail: { institutionId: institutionId, institutionName: institutionName }
        }));
    } catch (error) {
        console.error('Error disconnecting institution:', error);
        showNotification(`Erro ao desconectar ${institutionName || 'instituição'}: ${error.message}`, 'error');
    } finally {
        // Restaurar botão
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const disconnectButton = card?.querySelector('.action-btn.danger');
        if (disconnectButton) {
            disconnectButton.disabled = false;
            disconnectButton.innerHTML = '<i class="fas fa-unlink"></i> Desconectar';
        }
    }
}

function handleConnectInstitution() {
    showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Make function globally available for onclick handlers
window.handleConnectInstitution = handleConnectInstitution;

// Função para limpar cache e recarregar dados (útil após conectar nova conta)
function clearCacheAndReload() {
    console.log('Recarregando dados...');
    
    // Resetar variável de loading para forçar nova busca
    isLoading = false;
    
    // Limpar array de instituições
    institutions = [];
    
    // Recarregar dados
    console.log('Forçando reload completo dos dados...');
    loadConnectedInstitutions();
}

// Tornar função disponível globalmente
window.clearCacheAndReload = clearCacheAndReload;

function handleRefreshData() {
    // Recarregar dados do servidor
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

// Listen for account connection events
window.addEventListener('accountConnected', (event) => {
    console.log('Nova conta conectada:', event.detail);
    // Aguardar um pouco para garantir que o servidor processou completamente
    setTimeout(() => {
        clearCacheAndReload();
    }, 2000);
});

// Listen for account disconnection events
window.addEventListener('accountDisconnected', (event) => {
    console.log('Conta desconectada:', event.detail);
    // Aguardar um pouco para garantir que o servidor processou completamente
    setTimeout(() => {
        clearCacheAndReload();
    }, 2000);
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInstitutions);
} else {
    initializeInstitutions();
}