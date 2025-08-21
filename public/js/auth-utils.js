/**
 * Authentication - Functions for managing authentication and user data
 */

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

function loginUser(
  userData,
  token,
  redirectUrl = '../pages/dashboard.html'
) {
  localStorage.setItem('token', token);
  localStorage.setItem('userData', JSON.stringify(userData));
  window.location.href = redirectUrl;
}

function logoutUser(redirectUrl = '../pages/login.html') {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = redirectUrl;
}

function showLogoutModal() {
  const logoutModal = document.getElementById('logoutModal');
  if (logoutModal) {
    logoutModal.classList.add('show');
  } else {
    if (confirm('Deseja realmente sair?')) {
      logoutUser();
    }
  }
}

function hideLogoutModal() {
  const logoutModal = document.getElementById('logoutModal');
  if (logoutModal) {
    logoutModal.classList.remove('show');
  }
}

function initLogoutModalEvents() {
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const logoutModal = document.getElementById('logoutModal');

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      hideLogoutModal();
      logoutUser();
    });
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', () => {
      hideLogoutModal();
    });
  }

  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', () => {
      hideLogoutModal();
    });
  }

  if (logoutModal) {
    logoutModal.addEventListener('click', event => {
      if (event.target === logoutModal) {
        hideLogoutModal();
      }
    });
  }

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      logoutModal &&
      logoutModal.classList.contains('show')
    ) {
      hideLogoutModal();
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  initLogoutModalEvents();
});

async function loadUserData() {
  const userNameElement = document.getElementById('userName');
  const cachedUserData = getUserData();

  if (cachedUserData && userNameElement) {
    userNameElement.textContent = cachedUserData.name || 'Usuário';
  }

  const token = getAuthToken();
  if (!token) {
    return;
  }

  try {
    const response = await fetch('/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('userData', JSON.stringify(userData));

      if (userNameElement) {
        userNameElement.textContent = userData.name || 'Usuário';
      }
    } else if (response.status === 401) {

      logoutUser();
    } else {
      console.error('Erro ao carregar dados do usuário:', response.status);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

async function checkAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/login.html';
    return;
  }

  
  await loadUserData();
}

export { isUserLoggedIn as isAuthenticated, getAuthToken, getUserData, loginUser, logoutUser, showLogoutModal, hideLogoutModal, initLogoutModalEvents, checkAuthentication, loadUserData };
