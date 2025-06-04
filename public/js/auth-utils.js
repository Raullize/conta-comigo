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

function loginUser(userData, token, redirectUrl = '../pages/dashboard.html') {
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
    console.log('Modal exibido');
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
    console.log('Modal fechado');
  }
}

function initLogoutModalEvents() {
  console.log('Inicializando eventos do modal de logout');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const logoutModal = document.getElementById('logoutModal');

  console.log('Botões encontrados:', {
    confirmLogoutBtn: !!confirmLogoutBtn,
    cancelLogoutBtn: !!cancelLogoutBtn,
    closeLogoutModal: !!closeLogoutModal,
    logoutModal: !!logoutModal
  });

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      console.log('Botão confirmar clicado');
      hideLogoutModal();
      logoutUser();
    });
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', () => {
      console.log('Botão cancelar clicado');
      hideLogoutModal();
    });
  }

  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', () => {
      console.log('Botão fechar clicado');
      hideLogoutModal();
    });
  }

  if (logoutModal) {
    logoutModal.addEventListener('click', (event) => {
      if (event.target === logoutModal) {
        console.log('Clique fora do modal');
        hideLogoutModal();
      }
    });
  }
  
  // Adiciona evento para fechar o modal ao pressionar ESC
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && logoutModal && logoutModal.classList.contains('show')) {
      console.log('Tecla ESC pressionada');
      hideLogoutModal();
    }
  });
}

// Garantir que os eventos do modal de logout sejam inicializados quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado - inicializando eventos do modal de logout');
  initLogoutModalEvents();
});

async function loadUserData() {
    const userNameElement = document.getElementById('userName');
    const cachedUserData = getUserData();
    
    if (cachedUserData && userNameElement) {
        userNameElement.textContent = cachedUserData.name || 'Usuário';
    }

    const token = getAuthToken();
    if (!token) return;

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
            localStorage.setItem('userData', JSON.stringify(userData));
            
            if (userNameElement) {
                userNameElement.textContent = userData.name || 'Usuário';
            }
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

  try {
    await loadUserData();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    if (error.status === 401) {
      logoutUser();
    }
  }
}

function setupAuthEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }
  initLogoutModalEvents();
}