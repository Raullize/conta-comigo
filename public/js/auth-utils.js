/**
 * Auth Utils - Funções de autenticação e gerenciamento de usuário
 */

/**
 * Verifica se o usuário está logado
 * @returns {boolean} True se o usuário estiver logado, false caso contrário
 */
function isUserLoggedIn() {
  return localStorage.getItem('token') !== null;
}

/**
 * Obtém o token de autenticação do usuário
 * @returns {string|null} Token de autenticação ou null se não existir
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Obtém os dados do usuário armazenados localmente
 * @returns {Object|null} Dados do usuário ou null se não existir
 */
function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Realiza o login do usuário, armazenando seus dados e token
 * @param {Object} userData - Dados do usuário
 * @param {string} token - Token de autenticação
 */
function loginUser(userData, token) {
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('token', token);
}

/**
 * Realiza o logout do usuário
 */
function logoutUser() {
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  window.location.href = '../pages/login.html';
}

/**
 * Exibe o modal de confirmação de logout
 */
function showLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.add('show');
  } else {
    // Fallback caso o modal não exista
    logoutUser();
  }
}

/**
 * Esconde o modal de confirmação de logout
 */
function hideLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Inicializa os eventos do modal de logout
 */
function initLogoutModalEvents() {
  const logoutModal = document.getElementById('logoutModal');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');

  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', hideLogoutModal);
  }

  if (cancelLogout) {
    cancelLogout.addEventListener('click', hideLogoutModal);
  }

  if (confirmLogout) {
    confirmLogout.addEventListener('click', logoutUser);
  }

  // Fecha o modal ao clicar fora dele
  if (logoutModal) {
    window.addEventListener('click', event => {
      if (event.target === logoutModal) {
        hideLogoutModal();
      }
    });
  }
}

/**
 * Carrega os dados do usuário do localStorage e da API
 */
async function loadUserData() {
    // Primeiro, carrega dados do localStorage para exibição rápida
    const cachedUserData = getUserData();
    const userNameElement = document.getElementById('userName');
    
    if (cachedUserData && userNameElement) {
        const displayName = cachedUserData.name || 'Usuário';
        userNameElement.textContent = displayName;
    }

    // Em seguida, busca dados atualizados do servidor
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('Token não encontrado');
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Atualiza localStorage com dados reais do servidor
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Atualiza o elemento userName com o nome real do banco
            if (userNameElement) {
                const displayName = userData.name || 'Usuário';
                userNameElement.textContent = displayName;
            }
        } else {
            console.error('Erro ao carregar dados do usuário:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

/**
 * Verifica a autenticação do usuário e carrega seus dados
 * Redireciona para a página de login se não estiver autenticado
 */
async function checkAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/login.html';
    return;
  }

  try {
    await loadUserData();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    if (error.status === 401) {
      logoutUser();
    }
  }
}

/**
 * Configura os eventos básicos da interface relacionados à autenticação
 */
function setupAuthEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');

  // Configura o botão de logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }

  // Inicializa os eventos do modal de logout
  initLogoutModalEvents();
}