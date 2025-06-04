/**
 * Common - Funções comuns utilizadas em todas as páginas
 */

// Constantes e configurações
// Nota: URLs de API serão adicionadas quando a integração com backend for implementada

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
 * Realiza o logout do usuário
 */
function logout() {
  hideLogoutModal();
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = '../pages/auth.html';
}

/**
 * Exibe o modal de confirmação de logout
 */
function showLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.add('show');
}

/**
 * Esconde o modal de confirmação de logout
 */
function hideLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('show');
}

/**
 * Verifica a autenticação do usuário e carrega seus dados
 * Redireciona para a página de login se não estiver autenticado
 */
async function checkAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/auth.html';
    return;
  }

  try {
    await loadUserData();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    if (error.status === 401) {
      logout();
    }
  }
}

/**
 * Carrega os dados do usuário do localStorage e da API
 */
async function loadUserData() {
  const userNameElement = document.getElementById('userName');

  try {
    // Primeiro usa os dados do localStorage para exibição rápida
    const cachedUserData = getUserData();
    if (cachedUserData && userNameElement) {
      userNameElement.textContent = cachedUserData.name || 'Usuário';
    }

    // Verifica se há token para buscar dados atualizados
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token não encontrado');
    }

    // Busca dados do usuário da API
    let userData;

    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do usuário: ${response.status}`);
      }

      userData = await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Fallback para dados de demonstração em caso de erro
      userData = {
        id: '123',
        name: 'Usuário',
        email: 'usuario@exemplo.com',
      };
    }

    // Dados do usuário obtidos com sucesso

    // Mescla e atualiza os dados no localStorage
    const updatedData = { ...(cachedUserData || {}), ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedData));

    // Atualiza a interface se os dados forem diferentes dos em cache
    if (
      userNameElement &&
      (!cachedUserData || cachedUserData.name !== userData.name)
    ) {
      userNameElement.textContent = userData.name || 'Usuário';
    }

    return userData;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    throw error;
  }
}

/**
 * Configura os eventos básicos da interface
 */
function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');

  // Configura o botão de logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }

  // Inicializa os eventos do modal de logout
  initLogoutModalEvents();
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
    confirmLogout.addEventListener('click', logout);
  }

  // Fecha o modal ao clicar fora dele
  window.addEventListener('click', event => {
    if (event.target === logoutModal) {
      hideLogoutModal();
    }
  });
}

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', () => {
  // Verifica autenticação do usuário
  checkAuthentication();

  // Configura eventos básicos da interface
  setupEventListeners();
});
