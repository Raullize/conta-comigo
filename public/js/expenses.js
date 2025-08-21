class ExpensesManager {
    constructor() {

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
            'Não classificado': 'fas fa-question-circle'
        };


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


        this.transactions = [];




        this.itemsPerPage = 5;
        this.currentPage = 1;
        this.filteredTransactions = [...this.transactions];


        this.activeFilters = {
            category: '',
            type: '',
            startDate: '',
            endDate: ''
        };

        
        this.monthlyBudget = {
            alimentacao: { limit: null, spent: 0 },
            transporte: { limit: null, spent: 0 },
            saude: { limit: null, spent: 0 },
            lazer: { limit: null, spent: 0 },
            educacao: { limit: null, spent: 0 },
            casa: { limit: null, spent: 0 },
            utilidades: { limit: null, spent: 0 },
            entretenimento: { limit: null, spent: 0 },
            trabalho: { limit: null, spent: 0 },
            outros: { limit: null, spent: 0 }
        };

    }

    async init() {
        this.setupEventListeners();
        
        
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
    
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('startDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDate').addEventListener('change', () => this.applyFilters());

    
        document.getElementById('categoryFilterMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilterMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('startDateMobile').addEventListener('change', () => this.applyFilters());
        document.getElementById('endDateMobile').addEventListener('change', () => this.applyFilters());

    
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());
        document.getElementById('clearFiltersBtnMobile').addEventListener('click', () => this.clearFilters());

    
        document.getElementById('filtersToggle').addEventListener('click', () => this.toggleFiltersDropdown());

    
        document.addEventListener('click', (e) => {
            const filtersToggle = document.getElementById('filtersToggle');
            const filtersDropdown = document.getElementById('filtersDropdown');
            if (!filtersToggle.contains(e.target) && !filtersDropdown.contains(e.target)) {
                this.closeFiltersDropdown();
            }
        });

    
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }



    applyFilters() {
    
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



            return matches;
        });

        this.currentPage = 1;
        this.renderTransactions();
        this.updatePagination();
    }

    clearFilters() {

        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        

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
            const isUnclassified = transaction.category === 'Não classificado';
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


        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="expensesManager.goToPage(${this.currentPage - 1})">&laquo;</button>`;
        }


        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="pagination-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-btn" onclick="expensesManager.goToPage(${i})">${i}</button>`;
            }
        }


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
            'Não classificado': 'Não classificado'
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


    openCategoryModal(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;


        const modalHTML = `
            <div id="categoryModal" class="expenses-modal-overlay">
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


        document.body.insertAdjacentHTML('beforeend', modalHTML);
        

        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeCategoryModal();
            }
        });
        

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
    
            if (this.handleEscapeKey) {
                document.removeEventListener('keydown', this.handleEscapeKey);
                this.handleEscapeKey = null;
            }
        }
    }

    async classifyTransaction(transactionId, category) {
        try {
    
            await this.updateTransactionCategory(transactionId, category);
            
    
            const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex !== -1) {
                this.transactions[transactionIndex].category = category;
                
        
                this.applyFilters();
                
        
                this.closeCategoryModal();
                
        
                this.showNotification(`Transação classificada como ${this.getCategoryName(category)}!`);
            }
        } catch (error) {
            console.error('Erro ao classificar transação:', error);
            this.showNotification('Erro ao classificar transação. Tente novamente.', 'error');
        }
    }


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
        

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }


    renderBudgetSection() {
        const budgetContainer = document.getElementById('budgetCategories');
        if (!budgetContainer) {
            console.error('budgetCategories container não encontrado!');
            return;
        }

        budgetContainer.innerHTML = '';

        Object.keys(this.monthlyBudget).forEach(categoryKey => {
    
            if (categoryKey === 'salario') {
                return;
            }
            
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

        const budgetCards = document.querySelectorAll('.budget-category');
        
        budgetCards.forEach((card) => {
            const category = card.dataset.category;
            
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.openBudgetModal(category);
            });
        });


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

        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => this.closeBudgetModal());
        });

        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBudgetModal();
            }
        });

        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeBudgetModal();
            }
        });

        
        saveBtn.addEventListener('click', () => this.saveBudgetFromModal());
        
        
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


        title.textContent = `Configurar Orçamento - ${categoryName}`;
        icon.className = categoryIcon;
        name.textContent = categoryName;
        currentValue.textContent = `R$ ${categoryData.spent.toFixed(2).replace('.', ',')}`;
        input.value = categoryData.limit || '';
        

        const statusClass = this.getBudgetStatusClass(categoryData);
        const statusText = this.getBudgetStatusText(categoryData);
        statusElement.className = `budget-category-status ${statusClass}`;
        statusElement.textContent = statusText;
        

        this.currentBudgetCategory = category;
        

        modal.classList.add('show');
        

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
    
            await this.updateBudgetInDatabase(this.currentBudgetCategory, value);

    
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

        Object.keys(this.monthlyBudget).forEach(category => {
            this.monthlyBudget[category].spent = 0;
        });


        this.transactions.forEach(transaction => {
            if (transaction.type === 'gasto' && transaction.category !== 'Não classificado') {
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
      
      
      if (data.success && data.budgets) {
        data.budgets.forEach(budget => {
          
          if (budget.category !== 'salario' && this.monthlyBudget[budget.category]) {
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
            
            this.transactions = data.transactions.map(transaction => ({
                id: transaction.id,
                title: transaction.title,
                category: transaction.category,
                type: transaction.type === 'C' ? 'receita' : 'gasto',
                amount: transaction.amount,
                date: transaction.date,
                origin_cpf: transaction.origin_cpf,
                destination_cpf: transaction.destination_cpf,
                id_bank: transaction.id_bank
            }));


            this.filteredTransactions = [...this.transactions];
        } catch (error) {
            console.error('Erro ao carregar transações:', error);

            this.transactions = [];
            this.filteredTransactions = [];
        }
    }
}


let expensesManager;

export default ExpensesManager;