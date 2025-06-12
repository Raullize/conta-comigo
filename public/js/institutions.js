/**
 * Institutions - Financial Institution Management
 */

// Institutions page JavaScript

// Temporary data for institutions
const temporaryInstitutions = [
    {
        id: 1,
        name: 'Banco do Brasil',
        status: 'active',
        lastSync: '2025-06-12T10:30:00Z'
    },
    {
        id: 2,
        name: 'Itaú Unibanco',
        status: 'active',
        lastSync: '2025-06-12T09:15:00Z'
    },
    {
        id: 3,
        name: 'Nubank',
        status: 'active',
        lastSync: '2025-06-11T16:45:00Z'
    },
    {
        id: 4,
        name: 'Santander',
        status: 'active',
        lastSync: '2025-06-10T14:20:00Z'
    },
    {
        id: 5,
        name: 'Bradesco',
        status: 'active',
        lastSync: '2025-06-12T11:00:00Z'
    }
];

// Application state
let currentFilter = 'recent';
let institutions = [...temporaryInstitutions];

// DOM elements
let institutionsGrid;
let filterButtons;
let statsElements;

// Initialize the institutions page
function initializeInstitutions() {
    // Get DOM elements
    institutionsGrid = document.getElementById('institutionsGrid');
    filterButtons = document.querySelectorAll('.filter-btn');
    
    // Initialize stats
    updateStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render institutions
    renderInstitutions();
    
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
    
    // Connect new institution button
    const connectBtn = document.getElementById('connectInstitution');
    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnectInstitution);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshData);
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
            <button class="btn btn-primary" onclick="handleConnectInstitution()">Conectar Primeira Instituição</button>
        </div>
    `;
}

// Get filter label (não mais necessário)
// function getFilterLabel removida

// Setup card event listeners
function setupCardEventListeners() {
    // Add any additional card-specific event listeners here
}

// Action handlers
function syncInstitution(id) {
    console.log('Syncing institution:', id);
    // TODO: Implement sync functionality
    showNotification('Sincronização iniciada', 'success');
}

function disconnectInstitution(id) {
    if (confirm('Tem certeza que deseja desconectar esta instituição?')) {
        console.log('Disconnecting institution:', id);
        // Remove institution from list
        institutions = institutions.filter(inst => inst.id !== id);
        updateStats();
        renderInstitutions();
        showNotification('Instituição desconectada', 'success');
    }
}

function handleConnectInstitution() {
    console.log('Connect new institution');
    // TODO: Implement connection flow
    showNotification('Funcionalidade em desenvolvimento', 'info');
}

function handleRefreshData() {
    console.log('Refreshing data');
    // Simulate data refresh
    showNotification('Dados atualizados', 'success');
    updateStats();
    renderInstitutions();
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