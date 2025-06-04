class HeaderComponent {
  constructor(options = {}) {
    this.showNotifications = options.showNotifications !== false;
    this.showUserProfile = options.showUserProfile !== false;
    this.pageTitle = options.pageTitle || 'Dashboard';
    this.pageSubtitle =
      options.pageSubtitle || 'Bem-vindo ao seu painel financeiro';
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
    // Usa a função getUserData do auth-utils.js para exibir o nome do usuário
    this.updateUserName();
  }

  bindEvents() {
    this.bindUserProfileEvents();
    this.bindNotificationEvents();
  }

  /**
   * Vincula eventos relacionados ao perfil do usuário
   */
  bindUserProfileEvents() {
    if (!this.showUserProfile) {
      return;
    }

    const userProfile = document.querySelector('.user-profile');
    const userDropdown = document.getElementById('userDropdown');

    if (userProfile && userDropdown) {
      userProfile.addEventListener('click', e => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
      });
    }

    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.addEventListener('click', e => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Vincula eventos relacionados às notificações
   */
  bindNotificationEvents() {
    if (!this.showNotifications) {
      return;
    }

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        // Implementar funcionalidade de notificações
      });
    }
  }

  updateUserName() {
    const userData = getUserData();
    const userNameElement = document.getElementById('userName');

    if (userNameElement) {
      userNameElement.textContent = userData?.name || 'Usuário';
    }
  }

  handleLogout() {
    showLogoutModal();
  }
}

// Exporta o componente para uso global
window.HeaderComponent = HeaderComponent;
