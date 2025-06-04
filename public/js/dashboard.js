/**
 * Dashboard - Funções específicas para a página de dashboard
 */

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', () => {
  loadFinancialData();
  setupUIEvents();
});

// Dados financeiros temporários
function loadFinancialData() {
  const existingData = localStorage.getItem('financialData');

  if (existingData) {
    const financialData = JSON.parse(existingData);
    displayFinancialData(financialData);
    return financialData;
  }

  const financialData = {
    balance: {
      total: 'R$ 5.750,00',
      income: 'R$ 7.200,00',
      expenses: 'R$ 1.450,00',
    },
    expenses: {
      total: 'R$ 1.450,00',
      categories: [
        { name: 'Alimentação', value: 'R$ 650,00', percentage: '45%' },
        { name: 'Transporte', value: 'R$ 350,00', percentage: '24%' },
        { name: 'Lazer', value: 'R$ 250,00', percentage: '17%' },
        { name: 'Outros', value: 'R$ 200,00', percentage: '14%' },
      ],
    },
    investments: {
      total: 'R$ 12.500,00',
      growth: '+5,2%',
      details: [
        { name: 'Renda Fixa', value: 'R$ 7.500,00', percentage: '60%' },
        { name: 'Ações', value: 'R$ 3.000,00', percentage: '24%' },
        { name: 'Fundos', value: 'R$ 2.000,00', percentage: '16%' },
      ],
    },
    savings: {
      total: 'R$ 3.200,00',
      goal: 'R$ 10.000,00',
      percentage: '32%',
    },
    transactions: [
      {
        type: 'income',
        description: 'Salário',
        category: 'Receita',
        value: 'R$ 5.000,00',
        date: '05/06/2023',
      },
      {
        type: 'expense',
        description: 'Supermercado',
        category: 'Alimentação',
        value: 'R$ 350,00',
        date: '10/06/2023',
      },
      {
        type: 'income',
        description: 'Freelance',
        category: 'Receita Extra',
        value: 'R$ 1.200,00',
        date: '15/06/2023',
      },
      {
        type: 'expense',
        description: 'Restaurante',
        category: 'Alimentação',
        value: 'R$ 120,00',
        date: '18/06/2023',
      },
      {
        type: 'expense',
        description: 'Uber',
        category: 'Transporte',
        value: 'R$ 35,00',
        date: '20/06/2023',
      },
    ],
    budget: [
      {
        category: 'Alimentação',
        spent: 650,
        limit: 800,
        percentage: 81,
        status: 'safe',
      },
      {
        category: 'Transporte',
        spent: 350,
        limit: 400,
        percentage: 88,
        status: 'warning',
      },
      {
        category: 'Lazer',
        spent: 250,
        limit: 300,
        percentage: 83,
        status: 'warning',
      },
      {
        category: 'Compras',
        spent: 420,
        limit: 400,
        percentage: 105,
        status: 'danger',
      },
    ],
  };

  // Salva os dados no localStorage para simular persistência
  localStorage.setItem('financialData', JSON.stringify(financialData));

  // Exibe os dados no dashboard
  displayFinancialData(financialData);

  return financialData;
}

function displayFinancialData(data) {
  if (!data) {
    return;
  }

  updateBalanceCard(data.balance);
  updateExpensesCard(data.expenses);
  updateInvestmentsCard(data.investments);
  updateSavingsCard(data.savings);
  updateTransactions(data.transactions);
  updateBudget(data.budget);
}

function updateBalanceCard(balance) {
  if (!balance) {
    return;
  }

  const valueElement = document.querySelector('.balance-card .balance-value');
  const changeElement = document.querySelector('.balance-card .balance-change');
  const iconElement = document.querySelector('.balance-card .balance-change i');
  const spanElement = document.querySelector(
    '.balance-card .balance-change span'
  );

  if (valueElement) {
    valueElement.textContent = balance.total || 'R$ 0,00';
  }

  if (changeElement) {
    const isPositive = !balance.total.includes('-');
    changeElement.className =
      'balance-change ' +
      (isPositive ? 'balance-positive' : 'balance-negative');

    if (iconElement) {
      iconElement.className =
        'fas ' + (isPositive ? 'fa-arrow-up' : 'fa-arrow-down');
    }

    if (spanElement) {
      spanElement.textContent = '2,5% desde o mês passado'; // Valor fixo para demonstração
    }
  }
}

function updateExpensesCard(expenses) {
  if (!expenses) {
    return;
  }

  const valueElement = document.querySelector('.expenses-card .balance-value');
  const changeElement = document.querySelector(
    '.expenses-card .balance-change'
  );
  const iconElement = document.querySelector(
    '.expenses-card .balance-change i'
  );
  const spanElement = document.querySelector(
    '.expenses-card .balance-change span'
  );

  if (valueElement) {
    valueElement.textContent = expenses.total || 'R$ 0,00';
  }

  if (changeElement) {
    changeElement.className = 'balance-change balance-negative';

    if (iconElement) {
      iconElement.className = 'fas fa-arrow-up';
    }

    if (spanElement) {
      spanElement.textContent = '5,2% desde o mês passado'; // Valor fixo para demonstração
    }
  }
}

function updateInvestmentsCard(investments) {
  if (!investments) {
    return;
  }

  const valueElement = document.querySelector(
    '.investments-card .balance-value'
  );
  const changeElement = document.querySelector(
    '.investments-card .balance-change'
  );
  const iconElement = document.querySelector(
    '.investments-card .balance-change i'
  );
  const spanElement = document.querySelector(
    '.investments-card .balance-change span'
  );

  if (valueElement) {
    valueElement.textContent = investments.total || 'R$ 0,00';
  }

  if (changeElement && investments.growth) {
    const isPositive = investments.growth.includes('+');
    changeElement.className =
      'balance-change ' +
      (isPositive ? 'balance-positive' : 'balance-negative');

    if (iconElement) {
      iconElement.className =
        'fas ' + (isPositive ? 'fa-arrow-up' : 'fa-arrow-down');
    }

    if (spanElement) {
      spanElement.textContent = investments.growth + ' desde o mês passado';
    }
  }
}

function updateSavingsCard(savings) {
  if (!savings) {
    return;
  }

  const valueElement = document.querySelector('.savings-card .balance-value');
  const changeElement = document.querySelector('.savings-card .balance-change');
  const iconElement = document.querySelector('.savings-card .balance-change i');
  const spanElement = document.querySelector(
    '.savings-card .balance-change span'
  );

  if (valueElement) {
    valueElement.textContent = savings.total || 'R$ 0,00';
  }

  if (changeElement) {
    changeElement.className = 'balance-change balance-positive';

    if (iconElement) {
      iconElement.className = 'fas fa-arrow-up';
    }

    if (spanElement) {
      spanElement.textContent = savings.percentage + ' desde o mês passado';
    }
  }
}

function updateTransactions(transactions) {
  if (!transactions || !transactions.length) {
    return;
  }

  const transactionsList = document.querySelector('.transaction-list');
  if (!transactionsList) {
    return;
  }

  transactionsList.innerHTML = '';

  const recentTransactions = transactions.slice(0, 4);

  recentTransactions.forEach(transaction => {
    let icon = 'fa-receipt';
    if (transaction.category === 'Alimentação') {
      icon = 'fa-utensils';
    } else if (transaction.category === 'Transporte') {
      icon = 'fa-car';
    } else if (transaction.category === 'Moradia') {
      icon = 'fa-home';
    } else if (transaction.category === 'Compras') {
      icon = 'fa-shopping-bag';
    } else if (
      transaction.category === 'Receita' ||
      transaction.category === 'Receita Extra'
    ) {
      icon = 'fa-money-check-alt';
    }

    // Criar o elemento da transação
    const transactionItem = document.createElement('div');
    transactionItem.className = `transaction-item transaction-${transaction.type}`;

    transactionItem.innerHTML = `
            <div class="transaction-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-category">${transaction.category}</div>
            </div>
            <div class="transaction-info">
                <div class="transaction-amount">${transaction.type === 'income' ? '+ ' : '- '}${transaction.value}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
        `;

    transactionsList.appendChild(transactionItem);
  });
}

function updateBudget(budget) {
  if (!budget || !budget.length) {
    return;
  }

  const budgetProgress = document.querySelector('.budget-progress');
  if (!budgetProgress) {
    return;
  }

  budgetProgress.innerHTML = '';

  budget.forEach(category => {
    let statusClass = 'budget-safe';
    if (category.percentage > 100) {
      statusClass = 'budget-danger';
    } else if (category.percentage > 80) {
      statusClass = 'budget-warning';
    }

    const spentFormatted = `R$ ${category.spent.toFixed(2).replace('.', ',')}`;
    const limitFormatted = `R$ ${category.limit.toFixed(2).replace('.', ',')}`;

    const budgetCategory = document.createElement('div');
    budgetCategory.className = 'budget-category';

    budgetCategory.innerHTML = `
            <div class="budget-category-header">
                <div class="budget-category-name">${category.category}</div>
                <div class="budget-category-values">
                    <span class="budget-category-spent">${spentFormatted}</span> / ${limitFormatted}
                </div>
            </div>
            <div class="budget-bar">
                <div class="budget-progress-bar ${statusClass}" style="width: ${Math.min(category.percentage, 100)}%"></div>
            </div>
        `;

    budgetProgress.appendChild(budgetCategory);
  });
}

function setupUIEvents() {
  // Configurar evento de dropdown no ícone do usuário
  const userAvatar = document.querySelector('.user-avatar');
  const userDropdown = document.getElementById('userDropdown');
  const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
  const notificationBtn = document.querySelector('.notification-btn');

  // Configurar dropdown do usuário
  if (userAvatar && userDropdown) {
    userAvatar.addEventListener('click', e => {
      e.stopPropagation(); // Evita que o clique se propague para o document
      userDropdown.classList.toggle('show');
    });

    // Fechar dropdown ao clicar fora dele
    document.addEventListener('click', e => {
      if (
        userDropdown.classList.contains('show') &&
        !userDropdown.contains(e.target) &&
        !userAvatar.contains(e.target)
      ) {
        userDropdown.classList.remove('show');
      }
    });
  }

  if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', e => {
      e.preventDefault();
      showLogoutModal();
    });
  }

  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      alert('Funcionalidade de notificações em desenvolvimento!');
    });
  }

  const viewAllLinks = document.querySelectorAll('.view-all');
  if (viewAllLinks.length > 0) {
    viewAllLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        alert('Funcionalidade em desenvolvimento!');
      });
    });
  }

  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  if (navItems.length > 0) {
    navItems.forEach(item => {
      if (!item.classList.contains('active')) {
        item.addEventListener('click', e => {
          e.preventDefault();
          alert('Funcionalidade em desenvolvimento!');
        });
      }
    });
  }
}
