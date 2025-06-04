// Header Component
class HeaderComponent {
    constructor(options = {}) {
        this.showNotifications = options.showNotifications !== false; // Default true
        this.showUserProfile = options.showUserProfile !== false; // Default true
        this.pageTitle = options.pageTitle || 'Dashboard';
        this.pageSubtitle = options.pageSubtitle || 'Bem-vindo ao seu painel financeiro';
    }

    render() {
        return `
            <header class="dashboard-header">
                <div class="welcome-section">
                    <h1>Olá, <span id="userName">Carregando...</span>!</h1>
                    <p>${this.pageSubtitle}</p>
                </div>
                <div class="header-actions">
                    ${this.showNotifications ? this.renderNotifications() : ''}
                    ${this.showUserProfile ? this.renderUserProfile() : ''}
                </div>
            </header>
        `;
    }

    renderNotifications() {
        return `
            <button class="notification-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">3</span>
            </button>
        `;
    }

    renderUserProfile() {
        return `
            <div class="user-profile">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <!-- Menu dropdown do usuário -->
                <div class="user-dropdown" id="userDropdown">
                    <a href="settings.html" class="dropdown-item">
                        <i class="fas fa-cog"></i>
                        <span>Configurações</span>
                    </a>
                    <a href="#" class="dropdown-item" id="dropdownLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </a>
                </div>
            </div>
        `;
    }

    init(container) {
        container.innerHTML = this.render();
        this.bindEvents();
        this.loadUserData();
    }

    bindEvents() {
        // User profile dropdown toggle
        const userProfile = document.querySelector('.user-profile');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userProfile && userDropdown) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }

        // Dropdown logout button
        const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                // Handle notification click
                console.log('Notifications clicked');
            });
        }
    }

    loadUserData() {
        // Load user data from localStorage or API
        const userData = localStorage.getItem('user');
        const userNameElement = document.getElementById('userName');
        
        if (userData && userNameElement) {
            try {
                const user = JSON.parse(userData);
                userNameElement.textContent = user.name || user.email || 'Usuário';
            } catch (error) {
                userNameElement.textContent = 'Usuário';
            }
        } else if (userNameElement) {
            userNameElement.textContent = 'Usuário';
        }
    }

    handleLogout() {
        // Trigger logout modal or direct logout
        if (typeof showLogoutModal === 'function') {
            showLogoutModal();
        } else {
            // Direct logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../pages/auth.html';
        }
    }
}

// Export for use in other files
window.HeaderComponent = HeaderComponent;