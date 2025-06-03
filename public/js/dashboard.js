// API URLs
const USER_URL = '/users';

function isUserLoggedIn() {
  return localStorage.getItem('token') !== null;
}

function getAuthToken() {
  return localStorage.getItem('token');
}

function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = '../pages/auth.html';
}

async function checkAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/auth.html';
    return;
  }

  try {
    await loadUserData();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    // Se houver erro de autenticação, fazer logout
    if (error.status === 401) {
      logout();
    }
  }
}

async function loadUserData() {
  const userNameElement = document.getElementById('userName');

  try {
    // Primeiro tenta usar os dados do localStorage
    const cachedUserData = getUserData();
    if (cachedUserData && userNameElement) {
      userNameElement.textContent = cachedUserData.name || 'Usuário';
    }

    // Depois busca dados atualizados da API
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(USER_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = new Error('Erro ao buscar dados do usuário');
      error.status = response.status;
      throw error;
    }

    const userData = await response.json();

    // Atualiza o localStorage com os dados mais recentes
    const currentData = getUserData() || {};
    const updatedData = { ...currentData, ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedData));

    // Atualiza a interface
    if (userNameElement) {
      userNameElement.textContent = userData.name || 'Usuário';
    }

    return userData;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    throw error;
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  setupEventListeners();
});
