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

        // Dados temporários das transações (simulando dados vindos do banco)
        this.transactions = [
            {
                id: 1,
                title: 'Supermercado Extra',
                category: 'desconhecida',
                type: 'gasto',
                amount: 150.50,
                date: '2025-06-08'
            },
            {
                id: 2,
                title: 'Salário',
                category: 'desconhecida',
                type: 'receita',
                amount: 3500.00,
                date: '2025-06-01'
            },
            {
                id: 3,
                title: 'Conta de Luz',
                category: 'desconhecida',
                type: 'gasto',
                amount: 89.30,
                date: '2025-06-05'
            },
            {
                id: 4,
                title: 'Uber',
                category: 'desconhecida',
                type: 'gasto',
                amount: 25.80,
                date: '2025-06-10'
            },
            {
                id: 5,
                title: 'Netflix',
                category: 'desconhecida',
                type: 'gasto',
                amount: 29.90,
                date: '2025-06-03'
            },
            {
                id: 6,
                title: 'Freelance',
                category: 'desconhecida',
                type: 'receita',
                amount: 800.00,
                date: '2025-06-07'
            },
            {
                id: 7,
                title: 'Farmácia',
                category: 'desconhecida',
                type: 'gasto',
                amount: 45.60,
                date: '2025-06-09'
            },
            {
                id: 8,
                title: 'Restaurante',
                category: 'desconhecida',
                type: 'gasto',
                amount: 78.90,
                date: '2025-06-06'
            }
        ];



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


    }

    init() {
        this.setupEventListeners();
        this.renderTransactions();
        this.updatePagination();
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
        console.log('Filtros aplicados:', { categoryFilter, typeFilter, startDate, endDate });

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
            if (startDate || endDate) {
                console.log(`Transação ${transaction.title} (${transaction.date}):`, {
                    transactionDate,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    matches
                });
            }

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
            entretenimento: 'Entretenimento',
            utilidades: 'Utilidades',
            saude: 'Saúde',
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

    classifyTransaction(transactionId, category) {
        // Encontrar e atualizar a transação
        const transactionIndex = this.transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
            this.transactions[transactionIndex].category = category;
            
            // Aqui seria feita a chamada para a API para salvar no banco de dados
            // Exemplo: await this.updateTransactionCategory(transactionId, category);
            
            // Atualizar a visualização
            this.applyFilters();
            
            // Fechar modal
            this.closeCategoryModal();
            
            // Mostrar feedback ao usuário
            this.showNotification(`Transação classificada como ${this.getCategoryName(category)}!`);
        }
    }

    // Método para futuras integrações com API
    async updateTransactionCategory(transactionId, category) {
        // Este método será implementado quando integrar com o banco de dados
        // const response = await fetch(`/api/transactions/${transactionId}/category`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ category })
        // });
        // return response.json();
        
        console.log(`Transação ${transactionId} classificada como ${category} - Pronto para integração com API`);
    }

    showNotification(message) {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
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
}

// Tornar a instância global para uso nos botões de paginação
let expensesManager;

export default ExpensesManager;