// Expenses Manager - Gerenciamento de gastos com paginação, filtros e orçamento
class ExpensesManager {
    constructor() {
        // Ícones das categorias usando Font Awesome
        this.categoryIcons = {
            alimentacao: 'fas fa-utensils',
            transporte: 'fas fa-car',
            saude: 'fas fa-heartbeat',
            lazer: 'fas fa-gamepad',
            educacao: 'fas fa-graduation-cap',
            casa: 'fas fa-home',
            utilidades: 'fas fa-bolt',
            entretenimento: 'fas fa-film',
            salario: 'fas fa-money-bill-wave',
            trabalho: 'fas fa-briefcase',
            outros: 'fas fa-ellipsis-h',
            desconhecida: 'fas fa-question-circle'
        };

        // Categorias disponíveis para classificação
        this.availableCategories = {
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
            outros: 'Outros'
        };

        // Transações serão carregadas do backend
        this.transactions = [];



        // Configurações de paginação
        this.itemsPerPage = 5;
        this.currentPage = 1;
        this.filteredTransactions = [...this.transactions];

        // Filtros ativos
        this.activeFilters = {
            category: '',
            type: '',
            startDate: '',
            endDate: ''
        };

        // Dados do orçamento mensal (simulando dados que virão do banco)
        this.monthlyBudget = {
            alimentacao: { limit: null, spent: 0 },
            transporte: { limit: null, spent: 0 },
            saude: { limit: null, spent: 0 },
            lazer: { limit: null, spent: 0 },
            educacao: { limit: null, spent: 0 },
            casa: { limit: null, spent: 0 },
            utilidades: { limit: null, spent: 0 },
            entretenimento: { limit: null, spent: 0 },
            salario: { limit: null, spent: 0 },
            trabalho: { limit: null, spent: 0 },
            outros: { limit: null, spent: 0 }
        };

    }

    async init() {
        this.setupEventListeners();
        
        // Carregar orçamentos do banco de dados
        try {
            await this.loadBudgetsFromDatabase();
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        }
        
        await this.loadTransactions();
        this.renderTransactions();
        this.updatePagination();
        this.calculateSpentAmounts();
        this.renderBudgetSection();
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('startDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDate').addEventListener('change', () => this.applyFilters());

        // Filtros mobile
        document.getElementById('categoryFilterMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilterMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('startDateMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDateMobile').addEventListener('change', () => this.applyFilters());

        // Botão limpar filtros
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());
        document.getElementById('clearFiltersBtnMobile').addEventListener('click', () => this.clearFilters());

        // Toggle dropdown mobile
        document.getElementById('filtersToggle').addEventListener('click', () => this.toggleFiltersDropdown());

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            const filtersToggle = document.getElementById('filtersToggle');
            const filtersDropdown = document.getElementById('filtersDropdown');
            if (!filtersToggle.contains(e.target) && !filtersDropdown.contains(e.target)) {
                this.closeFiltersDropdown();
            }
        });

        // Paginação
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }



    applyFilters() {
        // Verificar se estamos no desktop ou mobile e pegar os valores corretos
        const isDesktop = window.innerWidth > 768;
        
        const categoryFilter = isDesktop ? 
            document.getElementById('categoryFilter').value : 
            document.getElementById('categoryFilterMobile').value;
        const typeFilter = isDesktop ? 
            document.getElementById('typeFilter').value : 
            document.getElementById('typeFilterMobile').value;
        const startDate = isDesktop ? 
            document.getElementById('startDate').value : 
            document.getElementById('startDateMobile').value;
        const endDate = isDesktop ? 
            document.getElementById('endDate').value : 
            document.getElementById('endDateMobile').value;

        this.activeFilters = {
            category: categoryFilter,
            type: typeFilter,
            startDate: startDate,
            endDate: endDate
        };

        // Sincronizar valores entre desktop e mobile
        if (isDesktop) {
            document.getElementById('categoryFilterMobile').value = categoryFilter;
            document.getElementById('typeFilterMobile').value = typeFilter;
            document.getElementById('startDateMobile').value = startDate;
            document.getElementById('endDateMobile').value = endDate;
        } else {
            document.getElementById('categoryFilter').value = categoryFilter;
            document.getElementById('typeFilter').value = typeFilter;
            document.getElementById('startDate').value = startDate;
            document.getElementById('endDate').value = endDate;
        }

        // Debug: log dos filtros aplicados

        this.filteredTransactions = this.transactions.filter(transaction => {
            let matches = true;
            const transactionDate = new Date(transaction.date);

            if (categoryFilter && transaction.category !== categoryFilter) {
                matches = false;
            }

            if (typeFilter && transaction.type !== typeFilter) {
                matches = false;
            }

            if (startDate) {
                const filterStartDate = new Date(startDate);
                if (transactionDate < filterStartDate) {
                    matches = false;
                }
            }

            if (endDate) {
                const filterEndDate = new Date(endDate);
                if (transactionDate > filterEndDate) {
                    matches = false;
                }
            }

            // Debug: log de cada transação filtrada

            return matches;
        });

        this.currentPage = 1;
        this.renderTransactions();
        this.updatePagination();
    }

    clearFilters() {
        // Limpar filtros desktop
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        
        // Limpar filtros mobile
        document.getElementById('categoryFilterMobile').value = '';
        document.getElementById('typeFilterMobile').value = '';
        document.getElementById('startDateMobile').value = '';
        document.getElementById('endDateMobile').value = '';
        
        this.activeFilters = {
            category: '',
            type: '',
            startDate: '',
            endDate: ''
        };

        this.filteredTransactions = [...this.transactions];
        this.currentPage = 1;
        this.renderTransactions();
        this.updatePagination();
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);

        if (pageTransactions.length === 0) {
            container.innerHTML = '<div class="no-transactions">Nenhuma transação encontrada</div>';
            return;
        }

        container.innerHTML = pageTransactions.map(transaction => {
            const isUnclassified = transaction.category === 'desconhecida';
            const categoryDisplay = isUnclassified ? 
                '<span class="unclassified-label">Não classificada - Clique para classificar</span>' : 
                `<span class="classified-label">${this.getCategoryName(transaction.category)} - Clique para reclassificar</span>`;
            
            return `
                <div class="transaction-item transaction-item-clickable" onclick="expensesManager.openCategoryModal(${transaction.id})">
                    <div class="transaction-icon">
                        <i class="${this.getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.title}</div>
                        <div class="transaction-category">${categoryDisplay}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'receita' ? '+' : '-'} R$ ${transaction.amount.toFixed(2).replace('.', ',')}
                    </div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
            `;
        }).join('');
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('pagination');

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botão anterior
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="expensesManager.goToPage(${this.currentPage - 1})">&laquo;</button>`;
        }

        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="pagination-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-btn" onclick="expensesManager.goToPage(${i})">${i}</button>`;
            }
        }

        // Botão próximo
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="expensesManager.goToPage(${this.currentPage + 1})">&raquo;</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTransactions();
        this.updatePagination();
    }



    getCategoryName(category) {
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
            desconhecida: 'Não classificada'
        };
        return categoryNames[category] || 'Outros';
    }

    getCategoryIcon(category) {
        return this.categoryIcons[category] || this.categoryIcons.outros;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    toggleFiltersDropdown() {
        const toggle = document.getElementById('filtersToggle');
        const dropdown = document.getElementById('filtersDropdown');
        
        toggle.classList.toggle('active');
        dropdown.classList.toggle('show');
    }

    closeFiltersDropdown() {
        const toggle = document.getElementById('filtersToggle');
        const dropdown = document.getElementById('filtersDropdown');
        
        toggle.classList.remove('active');
        dropdown.classList.remove('show');
    }

    // Métodos para classificação de transações
    openCategoryModal(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        // Criar modal dinamicamente
        const modalHTML = `
            <div id="categoryModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Classificar Transação</h3>
                        <button class="modal-close" onclick="expensesManager.closeCategoryModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="transaction-info">
                            <h4>${transaction.title}</h4>
                            <p>Valor: ${transaction.type === 'receita' ? '+' : '-'} R$ ${transaction.amount.toFixed(2).replace('.', ',')}</p>
                            <p>Data: ${this.formatDate(transaction.date)}</p>
                        </div>
                        <div class="category-selection">
                            <h4>Selecione uma categoria:</h4>
                            <div class="category-grid">
                                ${Object.entries(this.availableCategories).map(([key, name]) => `
                                    <button class="category-option" onclick="expensesManager.classifyTransaction(${transactionId}, '${key}')">
                                        <i class="${this.categoryIcons[key]}"></i>
                                        <span>${name}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Adicionar event listener para fechar ao clicar fora
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeCategoryModal();
            }
        });
        
        // Adicionar event listener para fechar com ESC
        this.handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                this.closeCategoryModal();
            }
        };
        document.addEventListener('keydown', this.handleEscapeKey);
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.remove();
            // Remover o event listener da tecla ESC
            if (this.handleEscapeKey) {
                document.removeEventListener('keydown', this.handleEscapeKey);
                this.handleEscapeKey = null;
            }
        }
    }

    async classifyTransaction(transactionId, category) {
        try {
            // Chamar a API para salvar no banco de dados
            await this.updateTransactionCategory(transactionId, category);
            
            // Encontrar e atualizar a transação localmente
            const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex !== -1) {
                this.transactions[transactionIndex].category = category;
                
                // Atualizar a visualização
                this.applyFilters();
                
                // Fechar modal
                this.closeCategoryModal();
                
                // Mostrar feedback ao usuário
                this.showNotification(`Transação classificada como ${this.getCategoryName(category)}!`);
            }
        } catch (error) {
            console.error('Erro ao classificar transação:', error);
            this.showNotification('Erro ao classificar transação. Tente novamente.', 'error');
        }
    }

    // Método para atualizar categoria da transação via API
    async updateTransactionCategory(transactionId, category) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/transactions/${transactionId}/category`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar categoria');
        }
        
        return response.json();
    }

    showNotification(message, type = 'success') {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const backgroundColor = type === 'error' ? '#f44336' : '#4CAF50';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Funções do Orçamento Mensal
    renderBudgetSection() {
        const budgetContainer = document.getElementById('budgetCategories');
        if (!budgetContainer) {
            console.error('budgetCategories container não encontrado!');
            return;
        }

        budgetContainer.innerHTML = '';

        Object.keys(this.monthlyBudget).forEach(categoryKey => {
            const categoryData = this.monthlyBudget[categoryKey];
            const categoryName = this.availableCategories[categoryKey];
            const categoryIcon = this.categoryIcons[categoryKey];

            const budgetCard = document.createElement('div');
            budgetCard.className = 'budget-category';
            budgetCard.dataset.category = categoryKey;
            budgetCard.innerHTML = `
                <div class="budget-category-info">
                    <div class="budget-category-name">
                        <i class="${categoryIcon} budget-category-icon"></i>
                        ${categoryName}
                    </div>
                    <div class="budget-category-details">
                        <div class="budget-category-limit">
                            ${categoryData.limit ? `Limite: R$ ${categoryData.limit.toFixed(2).replace('.', ',')}` : 'Limite não definido'}
                        </div>
                    </div>
                </div>
                <div class="budget-category-status ${this.getBudgetStatusClass(categoryData)}">
                    ${this.getBudgetStatusText(categoryData)}
                </div>
            `;

            budgetContainer.appendChild(budgetCard);
        });

        this.setupBudgetEventListeners();
    }

    setupBudgetEventListeners() {
        // Event listeners para os cards de categoria
        const budgetCards = document.querySelectorAll('.budget-category');
        
        budgetCards.forEach((card) => {
            const category = card.dataset.category;
            
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.openBudgetModal(category);
            });
        });

        // Event listeners para o modal (apenas se ainda não foram configurados)
        if (!this.budgetModalListenersSetup) {
            this.setupBudgetModalListeners();
            this.budgetModalListenersSetup = true;
        }
    }

    setupBudgetModalListeners() {
        const modal = document.getElementById('budgetModal');
        const closeBtn = document.getElementById('closeBudgetModal');
        const cancelBtn = document.getElementById('cancelBudgetBtn');
        const saveBtn = document.getElementById('saveBudgetBtn');
        const input = document.getElementById('budgetModalInput');

        if (!modal || !closeBtn || !cancelBtn || !saveBtn || !input) {
            console.warn('Elementos do modal de orçamento não encontrados');
            return;
        }

        // Fechar modal
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => this.closeBudgetModal());
        });

        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBudgetModal();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeBudgetModal();
            }
        });

        // Salvar orçamento
        saveBtn.addEventListener('click', () => this.saveBudgetFromModal());
        
        // Salvar com Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveBudgetFromModal();
            }
        });
    }

    openBudgetModal(category) {
        const categoryData = this.monthlyBudget[category];
        const categoryName = this.availableCategories[category];
        const categoryIcon = this.categoryIcons[category];

        // Verificar se os elementos do modal existem
        const modal = document.getElementById('budgetModal');
        const title = document.getElementById('budgetModalTitle');
        const icon = document.getElementById('budgetModalIcon');
        const name = document.getElementById('budgetModalCategoryName');
        const currentValue = document.getElementById('budgetModalCurrentValue');
        const input = document.getElementById('budgetModalInput');
        const statusElement = document.getElementById('budgetModalStatus');

        if (!modal || !title || !icon || !name || !currentValue || !input || !statusElement) {
            console.error('Elementos do modal não encontrados!');
            return;
        }

        // Preencher dados do modal
        title.textContent = `Configurar Orçamento - ${categoryName}`;
        icon.className = categoryIcon;
        name.textContent = categoryName;
        currentValue.textContent = `R$ ${categoryData.spent.toFixed(2).replace('.', ',')}`;
        input.value = categoryData.limit || '';
        
        // Aplicar status com cores
        const statusClass = this.getBudgetStatusClass(categoryData);
        const statusText = this.getBudgetStatusText(categoryData);
        statusElement.className = `budget-category-status ${statusClass}`;
        statusElement.textContent = statusText;
        
        // Armazenar categoria atual
        this.currentBudgetCategory = category;
        
        // Mostrar modal
        modal.classList.add('show');
        
        // Focar no input
        setTimeout(() => {
            input.focus();
        }, 100);
    }

    closeBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) {
            modal.classList.remove('show');
        }
        const input = document.getElementById('budgetModalInput');
        if (input) {
            input.value = '';
        }
        this.currentBudgetCategory = null;
    }

    async saveBudgetFromModal() {
        const input = document.getElementById('budgetModalInput');
        const value = parseFloat(input.value);

        if (isNaN(value) || value < 0) {
            this.showNotification('Por favor, insira um valor válido.');
            return;
        }

        try {
            // Salvar no banco de dados
            await this.updateBudgetInDatabase(this.currentBudgetCategory, value);

            // Atualizar no objeto local
            this.monthlyBudget[this.currentBudgetCategory].limit = value;
            
            this.showNotification(`Orçamento para ${this.availableCategories[this.currentBudgetCategory]} salvo com sucesso!`);
            this.closeBudgetModal();
            this.calculateSpentAmounts();
            this.renderBudgetSection();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            this.showNotification('Erro ao salvar orçamento. Tente novamente.', 'error');
        }
    }

    calculateSpentAmounts() {
        // Resetar valores gastos
        Object.keys(this.monthlyBudget).forEach(category => {
            this.monthlyBudget[category].spent = 0;
        });

        // Calcular gastos por categoria baseado nas transações
        this.transactions.forEach(transaction => {
            if (transaction.type === 'gasto' && transaction.category !== 'desconhecida') {
                if (this.monthlyBudget[transaction.category]) {
                    this.monthlyBudget[transaction.category].spent += transaction.amount;
                }
            }
        });
    }

    getBudgetStatusClass(categoryData) {
        if (!categoryData.limit) return 'budget-status-undefined';
        
        const percentage = (categoryData.spent / categoryData.limit) * 100;
        
        if (percentage > 100) return 'budget-status-danger';
        if (percentage > 80) return 'budget-status-warning';
        return 'budget-status-safe';
    }

    getBudgetStatusText(categoryData) {
        if (!categoryData.limit) return 'Indefinido';
        
        const percentage = (categoryData.spent / categoryData.limit) * 100;
        
        if (percentage > 100) return 'Excedido';
        if (percentage > 80) return 'Atenção';
        return 'Dentro do limite';
    }

    // Função para atualizar orçamento no banco
    async loadBudgetsFromDatabase() {
    try {
      const response = await fetch('/budgets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar orçamentos');
      }

      const data = await response.json();
      
      // Atualizar orçamentos locais com dados do banco
      if (data.success && data.budgets) {
        data.budgets.forEach(budget => {
          if (this.monthlyBudget[budget.category]) {
            this.monthlyBudget[budget.category].limit = budget.limit_amount;
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Erro ao carregar orçamentos do banco:', error);
      throw error;
    }
  }

  async updateBudgetInDatabase(category, limit) {
    try {
      const response = await fetch('/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ category, limit })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar orçamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar orçamento no banco:', error);
      throw error;
    }
  }

    // Método para carregar transações do backend
    async loadTransactions() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token de autenticação não encontrado');
                return;
            }

            const response = await fetch('/transactions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar transações: ${response.status}`);
            }

            const data = await response.json();
            
            // Converter os dados do backend para o formato esperado pelo frontend
            this.transactions = data.transactions.map(transaction => {
                return {
                    id: transaction.id,
                    title: transaction.title,
                    category: transaction.category,
                    type: transaction.type === 'C' ? 'receita' : 'gasto', // Converter C/D para receita/gasto
                    amount: transaction.amount,
                    date: transaction.date,
                    origin_cpf: transaction.origin_cpf,
                    destination_cpf: transaction.destination_cpf,
                    id_bank: transaction.id_bank
                };
            });

            // Atualizar filteredTransactions
            this.filteredTransactions = [...this.transactions];
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            // Em caso de erro, manter array vazio
            this.transactions = [];
            this.filteredTransactions = [];
        }
    }
}

// Tornar a instância global para uso nos botões de paginação
let expensesManager;

export default ExpensesManager;