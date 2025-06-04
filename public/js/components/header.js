/**
 * Componente de cabeçalho para as páginas do dashboard
 */
class HeaderComponent {
  /**
   * @param {Object} options - Opções de configuração
   * @param {boolean} [options.showNotifications=true] - Exibir ou não o botão de notificações
   * @param {boolean} [options.showUserProfile=true] - Exibir ou não o perfil do usuário
   * @param {string} [options.pageTitle='Dashboard'] - Título da página
   * @param {string} [options.pageSubtitle='Bem-vindo ao seu painel financeiro'] - Subtítulo da página
   */
  constructor(options = {}) {
    this.showNotifications = options.showNotifications !== false;
    this.showUserProfile = options.showUserProfile !== false;
    this.pageTitle = options.pageTitle || 'Dashboard';
    this.pageSubtitle =
      options.pageSubtitle || 'Bem-vindo ao seu painel financeiro';
  }

  /**
   * Renderiza o HTML completo do cabeçalho
   */
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

  /**
   * Renderiza o componente de notificações
   */
  renderNotifications() {
    return `
            <button class="notification-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">3</span>
            </button>
        `;
  }

  /**
   * Renderiza o componente de perfil do usuário
   */
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

  /**
   * Inicializa o componente no container especificado
   */
  init(container) {
    container.innerHTML = this.render();
    this.bindEvents();
    this.loadUserData();
  }

  /**
   * Vincula eventos aos elementos do componente
   */
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
        console.log('Notifications clicked');
      });
    }
  }

  /**
   * Carrega os dados do usuário do localStorage
   */
  loadUserData() {
    const userData = localStorage.getItem('userData');
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

  /**
   * Gerencia o processo de logout
   */
  handleLogout() {
    if (typeof showLogoutModal === 'function') {
      showLogoutModal();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '../pages/auth.html';
    }
  }
}

// Exporta o componente para uso global
window.HeaderComponent = HeaderComponent;
