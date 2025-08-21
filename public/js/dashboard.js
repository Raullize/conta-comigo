/**
 * Dashboard - Specific functions for the dashboard page
 */
import { showLogoutModal } from './auth-utils.js';
import OpenFinanceModal from './components/openFinanceModal.js';

let openFinanceModal;
let categoryChart;


const API_BASE_URL = window.location.origin;


async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    
    if (!response.ok) {
      if (response.status === 401) {

        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  
  openFinanceModal = new OpenFinanceModal();

  await checkOpenFinanceAccounts();

  loadDashboardData();

  setupUIEvents();
  
  
  window.addEventListener('accountConnected', (event) => {
    setTimeout(() => {
        loadDashboardData();
    }, 2000);
});
});


async function checkOpenFinanceAccounts() {
  try {
    const result = await OpenFinanceModal.checkLinkedAccounts();
    
    if (!result.hasLinkedAccounts) {
      setTimeout(() => {
        openFinanceModal.show();
      }, 1000);
    }
  } catch (error) {
    console.error('Erro ao verificar contas vinculadas:', error);
  }
}


function loadDashboardData() {
  loadOverviewData();
  loadCategoryChart();
  loadBudgetData();
  loadRecentTransactions();
}


async function loadOverviewData() {
  try {
    const data = await apiRequest('/dashboard/overview');
  
    document.getElementById('totalBalance').textContent = formatCurrency(parseFloat(data.totalBalance));
    updateChangeIndicator('balanceChange', data.balanceChange);
  
    document.getElementById('monthlyExpenses').textContent = formatCurrency(parseFloat(data.monthlyExpenses));
    updateChangeIndicator('expensesChange', data.expensesChange);
  
    document.getElementById('monthlyIncome').textContent = formatCurrency(parseFloat(data.monthlyIncome));
    updateChangeIndicator('incomeChange', data.incomeChange);
  } catch (error) {
    console.error('Erro ao carregar dados de visão geral:', error);

    document.getElementById('totalBalance').textContent = 'R$ 0,00';
    document.getElementById('monthlyExpenses').textContent = 'R$ 0,00';
    document.getElementById('monthlyIncome').textContent = 'R$ 0,00';
  }
}


function updateChangeIndicator(elementId, changeValue) {
  const element = document.getElementById(elementId);
  const icon = element.querySelector('i');
  const span = element.querySelector('span');
  

  let percentage, isPositive;
  if (typeof changeValue === 'object' && changeValue !== null) {
    percentage = parseFloat(changeValue.percentage || 0);
    isPositive = changeValue.isPositive !== undefined ? changeValue.isPositive : percentage >= 0;
  } else {
    percentage = parseFloat(changeValue || 0);
    isPositive = percentage >= 0;
  }
  
  const isNegative = percentage < 0;
  

  element.classList.remove('positive', 'negative');
  if (isPositive && percentage !== 0) {
    element.classList.add('positive');
    icon.className = 'fas fa-arrow-up';
  } else if (isNegative) {
    element.classList.add('negative');
    icon.className = 'fas fa-arrow-down';
  } else {
    icon.className = 'fas fa-minus';
  }
  

  const prefix = isPositive && percentage > 0 ? '+' : '';
  span.textContent = `${prefix}${Math.abs(percentage).toFixed(1)}% em relação ao mês anterior`;
}


async function loadCategoryChart() {
  try {
    const data = await apiRequest('/dashboard/categories');
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (!data || data.length === 0) {
      document.getElementById('categoryChart').style.display = 'none';
      document.getElementById('categoryLegend').innerHTML = '<p>Nenhum gasto por categoria encontrado este mês.</p>';
      return;
    }
    

    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const categories = data.map((item, index) => {
      const amount = parseFloat(item.amount);
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      
      return {
        name: item.category || 'Outros',
        value: amount,
        percentage: percentage,
        color: colors[index % colors.length]
      };
    });
    

    if (categoryChart) {
      categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(cat => cat.name),
        datasets: [{
          data: categories.map(cat => cat.value),
          backgroundColor: categories.map(cat => cat.color),
          borderWidth: 0,
          cutout: '60%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = formatCurrency(context.parsed);
                const percentage = categories[context.dataIndex].percentage;
                return `${context.label}: ${value} (${percentage.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
    

    updateCategoryLegend(categories);
  } catch (error) {
    console.error('Erro ao carregar gráfico de categorias:', error);

    document.getElementById('categoryChart').style.display = 'none';
    document.getElementById('categoryLegend').innerHTML = '<p>Erro ao carregar dados de categorias.</p>';
  }
}


function formatCategoryName(category) {
  const categoryNames = {
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    saude: 'Saúde',
    lazer: 'Lazer',
    educacao: 'Educação',
    casa: 'Casa',
    utilidades: 'Utilidades',
    entretenimento: 'Entretenimento',
    salario: 'Salário',
    trabalho: 'Trabalho',
    outros: 'Outros',
    'Não classificado': 'Não classificado'
  };
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}


function updateCategoryLegend(categories) {
  const legendContainer = document.getElementById('categoryLegend');
  
  legendContainer.innerHTML = categories.map(category => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${category.color}"></div>
      <div class="legend-info">
        <div class="legend-name">${formatCategoryName(category.name)}</div>
        <div class="legend-value">${formatCurrency(category.value)} (${category.percentage.toFixed(1)}%)</div>
      </div>
    </div>
  `).join('');
}


async function loadBudgetData() {
  try {
    const data = await apiRequest('/dashboard/budget');
    
    if (!data || data.length === 0) {
      document.getElementById('budgetCategories').innerHTML = '<p>Nenhum orçamento configurado.</p>';
      return;
    }
    
    updateBudgetCategories(data);
  } catch (error) {
    console.error('Erro ao carregar dados de orçamento:', error);
    document.getElementById('budgetCategories').innerHTML = '<p>Erro ao carregar dados de orçamento.</p>';
  }
}


function updateBudgetCategories(categories) {
  const container = document.getElementById('budgetCategories');
  
  container.innerHTML = categories.map(category => {
    const spent = parseFloat(category.spent || 0);
    const limit = parseFloat(category.limit || 0);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;
    
    return `
      <div class="budget-category">
        <div class="budget-category-info">
          <div class="budget-category-name">${formatCategoryName(category.category || category.name || 'Categoria')}</div>
          <div class="budget-category-values">
            ${formatCurrency(spent)} de ${formatCurrency(limit)} 
            (${formatCurrency(remaining)} restante)
          </div>
        </div>
        <div class="budget-progress-bar">
          <div class="budget-progress-fill ${category.status}" style="width: ${Math.min(percentage, 100)}%"></div>
        </div>
        <div class="budget-status-indicator budget-status-${category.status}"></div>
      </div>
    `;
  }).join('');
}


async function loadRecentTransactions() {
  try {
    const data = await apiRequest('/dashboard/transactions');
    const container = document.getElementById('transactionsList');
    
    if (!data || data.length === 0) {
      container.innerHTML = '<p>Nenhuma transação encontrada.</p>';
      return;
    }
    
    const recentTransactions = data.slice(0, 5);
    
    container.innerHTML = recentTransactions.map(transaction => {

      const isIncome = transaction.type === 'income' || transaction.type === 'C';
      const transactionType = isIncome ? 'income' : 'expense';
      const formattedDate = formatDate(transaction.date);
      const formattedAmount = formatCurrency(parseFloat(transaction.amount));
      
      return `
        <div class="transaction-item">
          <div class="transaction-icon ${transactionType}">
            <i class="fas ${isIncome ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
          </div>
          <div class="transaction-details">
            <div class="transaction-description">${transaction.description}</div>
            <div class="transaction-category">${formatCategoryName(transaction.category)}</div>
          </div>
          <div class="transaction-info">
            <div class="transaction-amount ${transactionType}">
              ${isIncome ? '+' : '-'}${formattedAmount}
            </div>
            <div class="transaction-date">${formattedDate}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Erro ao carregar transações recentes:', error);
    const container = document.getElementById('transactionsList');
    container.innerHTML = '<p>Erro ao carregar transações.</p>';
  }
}


function setupUIEvents() {

}


function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}


export {
  loadDashboardData,
  loadOverviewData,
  loadCategoryChart,
  loadBudgetData,
  loadRecentTransactions
};
