/**
 * Institutions - Financial Institution Management
 */


let currentFilter = 'recent';
let institutions = [];
let isLoading = false;


let institutionsGrid;
let filterButtons;


function initializeInstitutions() {
    institutionsGrid = document.getElementById('institutionsGrid');
    filterButtons = document.querySelectorAll('.filter-btn');
    
    loadConnectedInstitutions();
    setupEventListeners();
    setupCardEventListeners();
    setupModalListeners();
}


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


async function loadConnectedInstitutions() {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();
    
    try {

        const savedSyncDates = localStorage.getItem('institutionsSyncDates');
        let syncDatesMap = new Map();
        if (savedSyncDates) {
            try {
                const syncDatesObj = JSON.parse(savedSyncDates);
                syncDatesMap = new Map(Object.entries(syncDatesObj));
            } catch (e) {
            }
        }
        
        const token = localStorage.getItem('token');
        
        const response = await fetch('/open-finance/connected-accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to load institutions: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.accounts || !Array.isArray(data.accounts)) {
            institutions = [];
        } else {
            institutions = data.accounts.map(account => {
                const savedSyncDate = syncDatesMap.get(account.id.toString());
                const lastSyncToUse = savedSyncDate || account.lastSync;
                
                return {
                    id: account.id,
                    name: account.name,
                    status: 'active',
                    lastSync: lastSyncToUse,
                    balance: parseFloat(account.balance) || 0
                };
            });
        }
        

        
        updateStats();
        renderInstitutions();
    } catch (error) {
        showNotification('Erro ao carregar instituições', 'error');
        renderEmptyState();
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}


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


function getLastSyncTime() {
    const activeSyncs = institutions
        .filter(inst => inst.status === 'active' && inst.lastSync)
        .map(inst => {
            const date = new Date(inst.lastSync);
        
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


function setActiveFilter(filter) {
    currentFilter = filter;
    

    filterButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });
    

    renderInstitutions();
}


function getFilteredInstitutions() {
    const sortedInstitutions = [...institutions];
    
    if (currentFilter === 'recent') {
        return sortedInstitutions.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));
    } else if (currentFilter === 'oldest') {
        return sortedInstitutions.sort((a, b) => new Date(a.lastSync) - new Date(b.lastSync));
    }
    
    return sortedInstitutions;
}


function renderInstitutions() {
    if (!institutionsGrid) {
        return;
    }
    
    const filteredInstitutions = getFilteredInstitutions();
    
    if (filteredInstitutions.length === 0) {
        renderEmptyState();
        return;
    }
    
    const cardsHTML = filteredInstitutions.map(institution => {
        return createInstitutionCard(institution);
    }).join('');
    
    institutionsGrid.innerHTML = cardsHTML;
    setupCardEventListeners();
}


function createInstitutionCard(institution) {

    const iconClass = 'fas fa-university';
    const cardClass = 'institution-card';
    
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



function formatDate(dateString) {
    if (!dateString) {
        return 'Nunca';
    }
    
    const date = new Date(dateString);
    

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
        </div>
    `;
}




function setupCardEventListeners() {

}


function showLoadingState() {
    institutionsGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Carregando instituições...</p>
        </div>
    `;
}

function hideLoadingState() {

}


let syncModal, disconnectModal;
let currentInstitutionId = null;
let currentInstitutionName = null;

function setupModalListeners() {
    
    syncModal = document.getElementById('syncModal');
    disconnectModal = document.getElementById('disconnectModal');
    
    
    document.getElementById('closeSyncModal').addEventListener('click', hideSyncModal);
    document.getElementById('cancelSyncBtn').addEventListener('click', hideSyncModal);
    document.getElementById('confirmSyncBtn').addEventListener('click', () => {
        if (currentInstitutionId && currentInstitutionName) {
            handleSyncInstitution(currentInstitutionId, currentInstitutionName);
            hideSyncModal();
        }
    });
    
    
    document.getElementById('closeDisconnectModal').addEventListener('click', hideDisconnectModal);
    document.getElementById('cancelDisconnectBtn').addEventListener('click', hideDisconnectModal);
    document.getElementById('confirmDisconnectBtn').addEventListener('click', () => {
        if (currentInstitutionId && currentInstitutionName) {
            handleDisconnectInstitution(currentInstitutionId, currentInstitutionName);
            hideDisconnectModal();
        }
    });
    
    
    window.addEventListener('click', (event) => {
        if (event.target === syncModal) {
            hideSyncModal();
        }
        if (event.target === disconnectModal) {
            hideDisconnectModal();
        }
    });
    
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
    
            if (syncModal && syncModal.classList.contains('show')) {
                hideSyncModal();
            }
            if (disconnectModal && disconnectModal.classList.contains('show')) {
                hideDisconnectModal();
            }
        }
    });
}


function showSyncModal(institution) {
    currentInstitutionId = institution.id;
    document.getElementById('syncInstitutionName').textContent = institution.name;
    syncModal.classList.add('show');

    document.querySelector('.dashboard-container').classList.add('modal-open');
}


function hideSyncModal() {
    syncModal.classList.remove('show');
    currentInstitutionId = null;
    currentInstitutionName = null;

    document.querySelector('.dashboard-container').classList.remove('modal-open');
}


function showDisconnectModal(institution) {
    currentInstitutionId = institution.id;
    document.getElementById('disconnectInstitutionName').textContent = institution.name;
    disconnectModal.classList.add('show');

    document.querySelector('.dashboard-container').classList.add('modal-open');
}


function hideDisconnectModal() {
    disconnectModal.classList.remove('show');
    currentInstitutionId = null;
    currentInstitutionName = null;

    document.querySelector('.dashboard-container').classList.remove('modal-open');
}


function syncInstitution(id, institutionName) {
    const numericId = parseInt(id);
    const institution = institutions.find(inst => inst.id === numericId || inst.id === id);
    if (institution) {
        currentInstitutionId = institution.id;
        currentInstitutionName = institutionName || institution.name;
        showSyncModal(institution);
    }
}

function disconnectInstitution(id, institutionName) {
    const numericId = parseInt(id);
    const institution = institutions.find(inst => inst.id === numericId || inst.id === id);
    if (institution) {
        currentInstitutionId = institution.id;
        currentInstitutionName = institutionName || institution.name;
        showDisconnectModal(institution);
    }
}


window.syncInstitution = syncInstitution;
window.disconnectInstitution = disconnectInstitution;
window.handleSyncInstitution = handleSyncInstitution;
window.handleDisconnectInstitution = handleDisconnectInstitution;


async function handleSyncInstitution(id, institutionName) {
    const institutionId = parseInt(id) || id;
    
    try {
    
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const syncButton = card?.querySelector('.action-btn.primary');
        
        if (syncButton) {
            syncButton.disabled = true;
            syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
        }
        
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
        

        const institution = institutions.find(inst => inst.id === institutionId);
        if (institution) {
            const newSyncDate = data.lastSync || new Date().toISOString();
            institution.lastSync = newSyncDate;
            if (data.newBalance !== undefined) {
                institution.balance = parseFloat(data.newBalance) || 0;
            }
            
    
            const savedSyncDates = localStorage.getItem('institutionsSyncDates');
            let syncDatesObj = {};
            if (savedSyncDates) {
                try {
                    syncDatesObj = JSON.parse(savedSyncDates);
                } catch (e) {
        
                }
            }
            syncDatesObj[institutionId.toString()] = newSyncDate;
            localStorage.setItem('institutionsSyncDates', JSON.stringify(syncDatesObj));
            
    
            localStorage.setItem('institutionsCache', JSON.stringify(institutions));
            localStorage.setItem('institutionsCacheTimestamp', Date.now().toString());
        }
        
        updateStats();
        renderInstitutions();
        
        showNotification(`${institutionName} sincronizado com sucesso!`, 'success');
        
    } catch (error) {
        showNotification(`Erro ao sincronizar ${institutionName || 'conta'}: ${error.message}`, 'error');
    } finally {

        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const syncButton = card?.querySelector('.action-btn.primary');
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar';
        }
    }
}


async function handleDisconnectInstitution(id, institutionName) {
    const institutionId = parseInt(id) || id;
    
    try {
    
        const card = document.querySelector(`[data-id="${institutionId}"]`);
        const disconnectButton = card?.querySelector('.action-btn.danger');
        
        if (disconnectButton) {
            disconnectButton.disabled = true;
            disconnectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Desconectando...';
        }
        

        
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
        

        const savedSyncDates = localStorage.getItem('institutionsSyncDates');
        if (savedSyncDates) {
            try {
                const syncDatesObj = JSON.parse(savedSyncDates);
                delete syncDatesObj[institutionId.toString()];
                localStorage.setItem('institutionsSyncDates', JSON.stringify(syncDatesObj));
            } catch (e) {
    
            }
        }
        

        institutions = institutions.filter(inst => inst.id !== institutionId);
        

        localStorage.setItem('institutionsCache', JSON.stringify(institutions));
        localStorage.setItem('institutionsCacheTimestamp', Date.now().toString());
        
        updateStats();
        renderInstitutions();
        showNotification(`${institutionName} desconectado com sucesso!`, 'success');
        

        window.dispatchEvent(new CustomEvent('accountDisconnected', {
            detail: { institutionId: institutionId, institutionName: institutionName }
        }));
    } catch (error) {
        showNotification(`Erro ao desconectar ${institutionName || 'instituição'}: ${error.message}`, 'error');
    } finally {

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


window.handleConnectInstitution = handleConnectInstitution;


function clearCacheAndReload() {
    isLoading = false;
    institutions = [];
    loadConnectedInstitutions();
}


window.clearCacheAndReload = clearCacheAndReload;

function handleRefreshData() {

    loadConnectedInstitutions();
}


function showNotification(message, type = 'info') {

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    

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
    

    document.body.appendChild(notification);
    

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}


window.addEventListener('accountConnected', (event) => {
    setTimeout(() => {
        clearCacheAndReload();
    }, 2000);
});


window.addEventListener('accountDisconnected', (event) => {
    setTimeout(() => {
        clearCacheAndReload();
    }, 2000);
});


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInstitutions);
} else {
    initializeInstitutions();
}