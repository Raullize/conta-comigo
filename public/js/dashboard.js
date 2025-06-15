/**
 * Dashboard - Specific functions for the dashboard page
 */
import { showLogoutModal } from './auth-utils.js';
import OpenFinanceModal from './components/openFinanceModal.js';

let openFinanceModal;
let categoryChart;

// Configuração da API
const API_BASE_URL = window.location.origin;

// Função para fazer requisições autenticadas
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
        // Token expirado ou inválido
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
  // Initialize Open Finance modal
  openFinanceModal = new OpenFinanceModal();
  
  // Check linked accounts
  await checkOpenFinanceAccounts();
  
  // Load dashboard data
  loadDashboardData();
  
  // Setup UI events
  setupUIEvents();
});

// Check Open Finance accounts
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

// Load all dashboard data
function loadDashboardData() {
  loadOverviewData();
  loadCategoryChart();
  loadBudgetData();
  loadRecentTransactions();
}

// Load overview cards data
async function loadOverviewData() {
  try {
    const data = await apiRequest('/dashboard/overview');
    
    // Total Balance
    document.getElementById('totalBalance').textContent = formatCurrency(parseFloat(data.totalBalance));
    updateChangeIndicator('balanceChange', data.balanceChange);
    
    // Monthly Expenses
    document.getElementById('monthlyExpenses').textContent = formatCurrency(parseFloat(data.monthlyExpenses));
    updateChangeIndicator('expensesChange', data.expensesChange);
    
    // Monthly Income
    document.getElementById('monthlyIncome').textContent = formatCurrency(parseFloat(data.monthlyIncome));
    updateChangeIndicator('incomeChange', data.incomeChange);
  } catch (error) {
    console.error('Erro ao carregar dados de visão geral:', error);
    // Show error state
    document.getElementById('totalBalance').textContent = 'R$ 0,00';
    document.getElementById('monthlyExpenses').textContent = 'R$ 0,00';
    document.getElementById('monthlyIncome').textContent = 'R$ 0,00';
  }
}

// Update change indicators
function updateChangeIndicator(elementId, changeValue) {
  const element = document.getElementById(elementId);
  const icon = element.querySelector('i');
  const span = element.querySelector('span');
  
  // Handle both number and object formats
  let percentage, isPositive;
  if (typeof changeValue === 'object' && changeValue !== null) {
    percentage = parseFloat(changeValue.percentage || 0);
    isPositive = changeValue.isPositive !== undefined ? changeValue.isPositive : percentage >= 0;
  } else {
    percentage = parseFloat(changeValue || 0);
    isPositive = percentage >= 0;
  }
  
  const isNegative = percentage < 0;
  
  // Update classes
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
  
  // Update text
  const prefix = isPositive && percentage > 0 ? '+' : '';
  span.textContent = `${prefix}${Math.abs(percentage).toFixed(1)}% em relação ao mês anterior`;
}

// Load category expenses chart
async function loadCategoryChart() {
  try {
    const data = await apiRequest('/dashboard/categories');
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (!data || data.length === 0) {
      document.getElementById('categoryChart').style.display = 'none';
      document.getElementById('categoryLegend').innerHTML = '<p>Nenhum gasto por categoria encontrado este mês.</p>';
      return;
    }
    
    // Transform API data to chart format
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
    
    // Destroy existing chart if it exists
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
    
    // Update legend
    updateCategoryLegend(categories);
  } catch (error) {
    console.error('Erro ao carregar gráfico de categorias:', error);
    // Show error state
    document.getElementById('categoryChart').style.display = 'none';
    document.getElementById('categoryLegend').innerHTML = '<p>Erro ao carregar dados de categorias.</p>';
  }
}

// Update category legend
function updateCategoryLegend(categories) {
  const legendContainer = document.getElementById('categoryLegend');
  
  legendContainer.innerHTML = categories.map(category => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${category.color}"></div>
      <div class="legend-info">
        <div class="legend-name">${category.name}</div>
        <div class="legend-value">${formatCurrency(category.value)} (${category.percentage.toFixed(1)}%)</div>
      </div>
    </div>
  `).join('');
}



// Load budget data
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

// Update budget categories
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
          <div class="budget-category-name">${category.category || category.name || 'Categoria'}</div>
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

// Load recent transactions
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
      // Map transaction type correctly: 'income' for C/credit, 'expense' for D/debit
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
            <div class="transaction-category">${transaction.category}</div>
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

// Setup UI events
function setupUIEvents() {
  // UI events can be added here as needed
}

// Utility functions
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



// Export functions for potential external use
export {
  loadDashboardData,
  loadOverviewData,
  loadCategoryChart,
  loadBudgetData,
  loadRecentTransactions
};
