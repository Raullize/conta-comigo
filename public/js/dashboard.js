/**
 * Dashboard - Specific functions for the dashboard page
 */
import { showLogoutModal } from './auth-utils.js';
import OpenFinanceModal from './components/openFinanceModal.js';

let openFinanceModal;

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa o modal de Open Finance
  openFinanceModal = new OpenFinanceModal();
  
  // Verifica se o usuário tem contas vinculadas
  await checkOpenFinanceAccounts();
  
  loadFinancialData();
  setupUIEvents();
  initializeFinancialTips();
});

// Função para verificar contas vinculadas
async function checkOpenFinanceAccounts() {
  try {
    const result = await OpenFinanceModal.checkLinkedAccounts();
    
    if (!result.hasLinkedAccounts) {
      // Se não tem contas vinculadas, mostra o modal
      setTimeout(() => {
        openFinanceModal.show();
      }, 1000); // Delay de 1 segundo para melhor UX
    }
  } catch (error) {
    console.error('Erro ao verificar contas vinculadas:', error);
  }
}

function loadFinancialData() {
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
        category: 'Moradia',
        spent: 1200,
        limit: 1500,
        percentage: 80,
        status: 'safe',
      },
      {
        category: 'Lazer',
        spent: 250,
        limit: 300,
        percentage: 83,
        status: 'warning',
      },
      {
        category: 'Saúde',
        spent: 180,
        limit: 200,
        percentage: 90,
        status: 'warning',
      },
      {
        category: 'Educação',
        spent: 320,
        limit: 400,
        percentage: 80,
        status: 'safe',
      },
    ],
  };

  displayFinancialData(financialData);
  return financialData;
}

function displayFinancialData(data) {
  if (!data) {
    return;
  }

  updateBalanceCard(data.balance);
  updateExpensesCard(data.expenses);
  updateTransactions(data.transactions);
  updateBudget(data.budget);
}

function updateBalanceCard(balance) {
  updateCard('balance-card', balance, '+2,5% desde o mês passado');
}

function updateExpensesCard(expenses) {
  updateCard('expenses-card', expenses, '-5,2% desde o mês passado');
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
    const isPositive = changeText.includes('+');
    changeElement.className = `balance-change ${isPositive ? 'balance-positive' : 'balance-negative'}`;

    if (iconElement) {
      iconElement.className = `fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`;
    }

    if (spanElement) {
      spanElement.textContent = changeText;
    }
  }
}



function getCategoryIcon(category) {
  const iconMap = {
    'Alimentação': 'fa-utensils',
    'Transporte': 'fa-car',
    'Moradia': 'fa-home',
    'Compras': 'fa-shopping-bag',
    'Receita': 'fa-money-check-alt',
    'Receita Extra': 'fa-money-check-alt'
  };
  return iconMap[category] || 'fa-receipt';
}

function updateTransactions(transactions) {
  if (!transactions?.length) return;

  const transactionsList = document.querySelector('.transaction-list');
  if (!transactionsList) return;

  transactionsList.innerHTML = '';

  transactions.slice(0, 4).forEach(transaction => {
    const icon = getCategoryIcon(transaction.category);
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

function getBudgetStatus(percentage) {
  if (percentage > 100) return 'budget-danger';
  if (percentage > 80) return 'budget-warning';
  return 'budget-safe';
}

function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function updateBudget(budget) {
  if (!budget?.length) return;

  const budgetProgress = document.querySelector('.budget-progress');
  if (!budgetProgress) return;

  budgetProgress.innerHTML = '';

  budget.forEach(category => {
    const statusClass = getBudgetStatus(category.percentage);
    const spentFormatted = formatCurrency(category.spent);
    const limitFormatted = formatCurrency(category.limit);

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
  setupUserDropdown();
  setupViewAllLinks();
  setupFinancialTipsButton();
}

function setupUserDropdown() {
  const userAvatar = document.querySelector('.user-avatar');
  const userDropdown = document.getElementById('userDropdown');
  const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

  if (userAvatar && userDropdown) {
    userAvatar.addEventListener('click', e => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

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
}

function setupViewAllLinks() {
  const viewAllLinks = document.querySelectorAll('.view-all');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
    });
  });
}

function setupFinancialTipsButton() {
  const refreshTipBtn = document.getElementById('refreshTip');
  if (refreshTipBtn) {
    refreshTipBtn.addEventListener('click', displayRandomTip);
  }
}

const financialTips = [
  "Crie um orçamento mensal e acompanhe seus gastos para ter controle total das suas finanças.",
  "Reserve pelo menos 20% da sua renda para uma reserva de emergência antes de investir.",
  "Quite primeiro as dívidas com juros mais altos, como cartão de crédito e cheque especial.",
  "Diversifique seus investimentos para reduzir riscos e aumentar as chances de retorno.",
  "Automatize suas economias: programe transferências mensais para sua conta poupança.",
  "Compare preços antes de fazer compras grandes e pesquise por promoções e descontos.",
  "Evite compras por impulso: espere 24 horas antes de comprar algo que não estava planejado.",
  "Negocie suas contas fixas anualmente: telefone, internet, seguros e planos de saúde.",
  "Invista em educação financeira: conhecimento é a melhor ferramenta para multiplicar seu dinheiro.",
  "Use a regra 50-30-20: 50% para necessidades, 30% para desejos e 20% para poupança e investimentos."
];

function initializeFinancialTips() {
  displayRandomTip();
}

function displayRandomTip() {
  const tipElement = document.getElementById('dailyTip');
  if (!tipElement || !financialTips.length) return;

  const randomIndex = Math.floor(Math.random() * financialTips.length);
  const selectedTip = financialTips[randomIndex];
  
  tipElement.style.opacity = '0';
  
  setTimeout(() => {
    tipElement.textContent = selectedTip;
    tipElement.style.opacity = '1';
  }, 150);
}
