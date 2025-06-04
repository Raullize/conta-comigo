/**
 * Dashboard - Specific functions for the dashboard page
 */
import { showLogoutModal } from './auth-utils.js';

/**
 * Initializes the application when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  loadFinancialData();
  setupUIEvents();
});

// Temporary financial data
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

  // Save data to localStorage to simulate persistence
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

function updateCard(cardClass, data, changeText = null) {
  if (!data) return;

  const valueElement = document.querySelector(`.${cardClass} .balance-value`);
  const changeElement = document.querySelector(`.${cardClass} .balance-change`);
  const iconElement = document.querySelector(`.${cardClass} .balance-change i`);
  const spanElement = document.querySelector(`.${cardClass} .balance-change span`);

  if (valueElement) {
    valueElement.textContent = data.total || 'R$ 0,00';
  }

  if (changeElement && changeText) {
    const isPositive = changeText.includes('+') || !data.total?.includes('-');
    changeElement.className = `balance-change ${isPositive ? 'balance-positive' : 'balance-negative'}`;

    if (iconElement) {
      iconElement.className = `fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`;
    }

    if (spanElement) {
      spanElement.textContent = changeText;
    }
  }
}

function updateBalanceCard(balance) {
  updateCard('balance-card', balance, '2,5% desde o mês passado');
}

function updateExpensesCard(expenses) {
  updateCard('expenses-card', expenses, '-5,2% desde o mês passado');
}

function updateInvestmentsCard(investments) {
  const changeText = investments?.growth ? `${investments.growth} desde o mês passado` : '+5,2% desde o mês passado';
  updateCard('investments-card', investments, changeText);
}

function updateSavingsCard(savings) {
  const changeText = savings?.percentage ? `${savings.percentage} desde o mês passado` : '+3,1% desde o mês passado';
  updateCard('savings-card', savings, changeText);
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

    // Create transaction element
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
  // Configure dropdown event on user icon
  const userAvatar = document.querySelector('.user-avatar');
  const userDropdown = document.getElementById('userDropdown');
  const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
  const notificationBtn = document.querySelector('.notification-btn');

  // Configure user dropdown
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
      // TODO: Implement notifications functionality
    });
  }

  const viewAllLinks = document.querySelectorAll('.view-all');
  if (viewAllLinks.length > 0) {
    viewAllLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        // TODO: Implement view all functionality
      });
    });
  }
}
