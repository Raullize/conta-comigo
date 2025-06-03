// Constantes e configurações
// Nota: URLs de API serão adicionadas quando a integração com backend for implementada

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
  // Redireciona para a página de autenticação se não estiver logado
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/auth.html';
    return;
  }

  try {
    await loadUserData();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    // Se houver erro de autenticação (401), faz logout automático
    if (error.status === 401) {
      logout();
    }
  }
}

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

    // Simulação de busca de dados da API (será substituída pela API real)
    // Usando setTimeout para simular uma chamada assíncrona
    const userData = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: '123',
          name: 'Usuário Demo',
          email: 'usuario@exemplo.com'
        });
      }, 300);
    });
    
    // Quando a API estiver pronta, substituir pelo código abaixo:
    /*
    const response = await fetch('/api/users/me', {
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
    */

    // Mescla e atualiza os dados no localStorage
    const updatedData = { ...cachedUserData || {}, ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedData));

    // Atualiza a interface se os dados forem diferentes dos em cache
    if (userNameElement && (!cachedUserData || cachedUserData.name !== userData.name)) {
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

  // Verifica se todos os elementos necessários existem antes de configurar os event listeners
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
  // Verifica se já existem dados no localStorage
  const existingData = localStorage.getItem('financialData');
  
  if (existingData) {
    // Se existirem dados, usa-os
    const financialData = JSON.parse(existingData);
    displayFinancialData(financialData);
    return financialData;
  }
  
  // Dados temporários para o dashboard (apenas para demonstração)
  const financialData = {
    balance: {
      total: 'R$ 5.750,00',
      income: 'R$ 7.200,00',
      expenses: 'R$ 1.450,00'
    },
    expenses: {
      total: 'R$ 1.450,00',
      categories: [
        { name: 'Alimentação', value: 'R$ 650,00', percentage: '45%' },
        { name: 'Transporte', value: 'R$ 350,00', percentage: '24%' },
        { name: 'Lazer', value: 'R$ 250,00', percentage: '17%' },
        { name: 'Outros', value: 'R$ 200,00', percentage: '14%' }
      ]
    },
    investments: {
      total: 'R$ 12.500,00',
      growth: '+5,2%',
      details: [
        { name: 'Renda Fixa', value: 'R$ 7.500,00', percentage: '60%' },
        { name: 'Ações', value: 'R$ 3.000,00', percentage: '24%' },
        { name: 'Fundos', value: 'R$ 2.000,00', percentage: '16%' }
      ]
    },
    savings: {
      total: 'R$ 3.200,00',
      goal: 'R$ 10.000,00',
      percentage: '32%'
    },
    transactions: [
      {
        type: 'income',
        description: 'Salário',
        category: 'Receita',
        value: 'R$ 5.000,00',
        date: '05/06/2023'
      },
      {
        type: 'expense',
        description: 'Supermercado',
        category: 'Alimentação',
        value: 'R$ 350,00',
        date: '10/06/2023'
      },
      {
        type: 'income',
        description: 'Freelance',
        category: 'Receita Extra',
        value: 'R$ 1.200,00',
        date: '15/06/2023'
      },
      {
        type: 'expense',
        description: 'Restaurante',
        category: 'Alimentação',
        value: 'R$ 120,00',
        date: '18/06/2023'
      },
      {
        type: 'expense',
        description: 'Uber',
        category: 'Transporte',
        value: 'R$ 35,00',
        date: '20/06/2023'
      }
    ],
    budget: [
      {
        category: 'Alimentação',
        spent: 650,
        limit: 800,
        percentage: 81,
        status: 'safe'
      },
      {
        category: 'Transporte',
        spent: 350,
        limit: 400,
        percentage: 88,
        status: 'warning'
      },
      {
        category: 'Lazer',
        spent: 250,
        limit: 300,
        percentage: 83,
        status: 'warning'
      },
      {
        category: 'Compras',
        spent: 420,
        limit: 400,
        percentage: 105,
        status: 'danger'
      }
    ]
  };

  // Salva os dados no localStorage para simular persistência
  localStorage.setItem('financialData', JSON.stringify(financialData));

  // Exibe os dados no dashboard
  displayFinancialData(financialData);
  
  return financialData;
}

function displayFinancialData(data) {
    if (!data) {
        console.error('Dados financeiros não disponíveis');
        return;
    }
    
    console.log('Exibindo dados financeiros');
    
    // Atualiza o card de saldo
    updateBalanceCard(data.balance);
    
    // Atualiza o card de despesas
    updateExpensesCard(data.expenses);
    
    // Atualiza o card de investimentos
    updateInvestmentsCard(data.investments);
    
    // Atualiza o card de economia
    updateSavingsCard(data.savings);
    
    // Atualiza as transações recentes
    updateTransactions(data.transactions);
    
    // Atualiza o orçamento mensal
    updateBudget(data.budget);
}

// Funções auxiliares para atualizar cada seção do dashboard
function updateBalanceCard(balance) {
    if (!balance) return;
    
    const totalElement = document.querySelector('.balance-card .balance-total');
    const incomeElement = document.querySelector('.balance-card .balance-income .value');
    const expensesElement = document.querySelector('.balance-card .balance-expenses .value');
    
    if (totalElement) totalElement.textContent = balance.total || 'R$ 0,00';
    if (incomeElement) incomeElement.textContent = balance.income || 'R$ 0,00';
    if (expensesElement) expensesElement.textContent = balance.expenses || 'R$ 0,00';
}

function updateExpensesCard(expenses) {
    if (!expenses) return;
    
    const totalElement = document.querySelector('.expenses-card .expenses-total');
    if (totalElement) totalElement.textContent = expenses.total || 'R$ 0,00';
    
    // Implementar atualização das categorias quando necessário
}

function updateInvestmentsCard(investments) {
    if (!investments) return;
    
    const totalElement = document.querySelector('.investments-card .investments-total');
    const growthElement = document.querySelector('.investments-card .investments-growth');
    
    if (totalElement) totalElement.textContent = investments.total || 'R$ 0,00';
    if (growthElement) growthElement.textContent = investments.growth || '0%';
    
    // Implementar atualização dos detalhes quando necessário
}

function updateSavingsCard(savings) {
    if (!savings) return;
    
    const totalElement = document.querySelector('.savings-card .savings-total');
    const goalElement = document.querySelector('.savings-card .savings-goal');
    const percentageElement = document.querySelector('.savings-card .savings-percentage');
    const progressElement = document.querySelector('.savings-card .progress-bar');
    
    if (totalElement) totalElement.textContent = savings.total || 'R$ 0,00';
    if (goalElement) goalElement.textContent = savings.goal || 'R$ 0,00';
    if (percentageElement) percentageElement.textContent = savings.percentage || '0%';
    if (progressElement) progressElement.style.width = savings.percentage || '0%';
}

function updateTransactions(transactions) {
    if (!transactions || !transactions.length) return;
    
    const transactionsList = document.querySelector('.transactions-list');
    if (!transactionsList) return;
    
    // Limpar lista atual
    // transactionsList.innerHTML = '';
    
    // Implementar atualização das transações quando necessário
    // Esta função será expandida conforme o desenvolvimento avançar
}

function updateBudget(budget) {
    if (!budget || !budget.length) return;
    
    const budgetList = document.querySelector('.budget-list');
    if (!budgetList) return;
    
    // Limpar lista atual
    // budgetList.innerHTML = '';
    
    // Implementar atualização do orçamento quando necessário
    // Esta função será expandida conforme o desenvolvimento avançar
}

function setupUIEvents() {
    // Configurar evento de dropdown no ícone do usuário
    const userAvatar = document.querySelector('.user-avatar');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const notificationBtn = document.querySelector('.notification-btn');
    
    // Configurar dropdown do usuário
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que o clique se propague para o document
            userDropdown.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (userDropdown.classList.contains('show') && 
                !userDropdown.contains(e.target) && 
                !userAvatar.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Configurar evento para o botão de logout no dropdown
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutModal();
        });
    }
    
    // Configurar evento para o botão de notificações
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Funcionalidade de notificações em desenvolvimento!');
        });
    }
    
    // Configurar eventos para os links "Ver todos"
    const viewAllLinks = document.querySelectorAll('.view-all');
    if (viewAllLinks.length > 0) {
        viewAllLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Funcionalidade em desenvolvimento!');
            });
        });
    }
    
    // Configurar eventos para os itens da sidebar
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            if (!item.classList.contains('active')) {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Funcionalidade em desenvolvimento!');
                });
            }
        });
    }
}
