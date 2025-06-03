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
  // Primeiro esconde o modal
  hideLogoutModal();
  
  // Depois faz o logout
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = '../pages/auth.html';
}

function showLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.add('show');
}

function hideLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('show');
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }

  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', hideLogoutModal);
  }

  if (cancelLogout) {
    cancelLogout.addEventListener('click', hideLogoutModal);
  }

  if (confirmLogout) {
    confirmLogout.addEventListener('click', logout);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupEventListeners();
    
    // Carregar dados financeiros temporários
    loadFinancialData();
    
    // Configurar eventos de UI adicionais
    setupUIEvents();
});

// Dados financeiros temporários
function loadFinancialData() {
    // Dados temporários para o dashboard
    const financialData = {
        balance: {
            current: 12450.75,
            previous: 12146.10,
            percentChange: 2.5
        },
        expenses: {
            current: 3280.45,
            previous: 3118.30,
            percentChange: 5.2
        },
        investments: {
            current: 45750.00,
            previous: 44075.15,
            percentChange: 3.8
        },
        savings: {
            current: 1850.30,
            previous: 1652.05,
            percentChange: 12.0
        },
        transactions: [
            {
                id: 1,
                title: 'Restaurante Sabor Caseiro',
                category: 'Alimentação',
                amount: -89.90,
                date: 'Hoje',
                icon: 'utensils',
                type: 'expense'
            },
            {
                id: 2,
                title: 'Shopping Center Norte',
                category: 'Compras',
                amount: -235.50,
                date: 'Ontem',
                icon: 'shopping-bag',
                type: 'expense'
            },
            {
                id: 3,
                title: 'Salário',
                category: 'Receita',
                amount: 5800.00,
                date: '15/05/2023',
                icon: 'money-check-alt',
                type: 'income'
            },
            {
                id: 4,
                title: 'Aluguel',
                category: 'Moradia',
                amount: -1500.00,
                date: '10/05/2023',
                icon: 'home',
                type: 'expense'
            }
        ],
        budget: [
            {
                category: 'Alimentação',
                spent: 850.30,
                limit: 1000.00,
                percentage: 85,
                status: 'safe'
            },
            {
                category: 'Transporte',
                spent: 420.75,
                limit: 600.00,
                percentage: 70,
                status: 'safe'
            },
            {
                category: 'Lazer',
                spent: 580.00,
                limit: 700.00,
                percentage: 83,
                status: 'warning'
            },
            {
                category: 'Compras',
                spent: 950.00,
                limit: 800.00,
                percentage: 118,
                status: 'danger'
            }
        ]
    };

    // Armazenar dados temporários no localStorage para uso futuro
    localStorage.setItem('tempFinancialData', JSON.stringify(financialData));

    // Exibir os dados no dashboard
    displayFinancialData(financialData);
}

function displayFinancialData(data) {
    // Exibir saldo geral
    displayBalanceCard(data.balance);
    
    // Exibir gastos do mês
    displayExpensesCard(data.expenses);
    
    // Exibir investimentos
    displayInvestmentsCard(data.investments);
    
    // Exibir economia
    displaySavingsCard(data.savings);
    
    // Exibir transações recentes
    // Nota: As transações já estão no HTML como exemplo
    
    // Exibir orçamento mensal
    // Nota: O orçamento já está no HTML como exemplo
}

function displayBalanceCard(balanceData) {
    // Os dados já estão no HTML como exemplo, mas em uma implementação real
    // atualizaríamos os valores dinamicamente aqui
}

function displayExpensesCard(expensesData) {
    // Os dados já estão no HTML como exemplo, mas em uma implementação real
    // atualizaríamos os valores dinamicamente aqui
}

function displayInvestmentsCard(investmentsData) {
    // Os dados já estão no HTML como exemplo, mas em uma implementação real
    // atualizaríamos os valores dinamicamente aqui
}

function displaySavingsCard(savingsData) {
    // Os dados já estão no HTML como exemplo, mas em uma implementação real
    // atualizaríamos os valores dinamicamente aqui
}

function setupUIEvents() {
    // Configurar evento de logout no ícone do usuário
    document.querySelector('.user-avatar').addEventListener('click', function() {
        showLogoutModal();
    });
    
    // Configurar evento para o botão de notificações
    document.querySelector('.notification-btn').addEventListener('click', function() {
        alert('Funcionalidade de notificações em desenvolvimento!');
    });
    
    // Configurar eventos para os links "Ver todos"
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funcionalidade em desenvolvimento!');
        });
    });
    
    // Configurar eventos para os itens da sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('active')) {
                e.preventDefault();
                alert('Funcionalidade em desenvolvimento!');
            }
        });
    });
}
