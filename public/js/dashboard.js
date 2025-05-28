// Dashboard JavaScript - Versão Simplificada

// Função para verificar se o usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Função para obter dados do usuário
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Função para realizar logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    window.location.href = '../pages/auth.html';
}

// Função para verificar autenticação
function checkAuthentication() {
    if (!isUserLoggedIn()) {
        window.location.href = '../pages/auth.html';
        return;
    }
    
    // Carregar dados do usuário
    loadUserData();
}

// Função para carregar dados do usuário na interface
function loadUserData() {
    const userData = getUserData();
    const userNameElement = document.getElementById('userName');
    
    if (userData && userNameElement) {
        userNameElement.textContent = userData.name || userData.email || 'Usuário';
    }
}

// Função para configurar eventos
function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
});