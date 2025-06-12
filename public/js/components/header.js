/**
 * Header Component - Dashboard header component
 */
import { showLogoutModal, getUserData } from '../auth-utils.js';

class HeaderComponent {
  constructor(options = {}) {
    this.showNotifications = options.showNotifications !== false;
    this.showUserProfile = options.showUserProfile !== false;
    this.pageTitle = options.pageTitle || 'Dashboard';
    this.pageSubtitle =
      options.pageSubtitle || 'Bem-vindo ao seu painel financeiro';
    this.showBreadcrumb = options.showBreadcrumb !== false;
  }

  render() {
    return `
            <header class="dashboard-header">
                <div class="welcome-section">
                    ${this.showBreadcrumb ? this.renderBreadcrumb() : ''}
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
                <span class="notification-badge">1</span>
            </button>
        `;
  }

  renderBreadcrumb() {
    if (this.pageTitle === 'Dashboard') {
      return `
                <div class="breadcrumb">
                    <span class="breadcrumb-item current">Dashboard</span>
                </div>
            `;
    } else {
      return `
                <div class="breadcrumb">
                    <span class="breadcrumb-item">Dashboard</span>
                    <i class="fas fa-chevron-right breadcrumb-separator"></i>
                    <span class="breadcrumb-item current">${this.pageTitle}</span>
                </div>
            `;
    }
  }

  renderUserProfile() {
    const userData = getUserData();
    const profileImage = userData?.profileImage;
    
    return `
            <div class="user-profile">
                <div class="user-avatar">
                    ${profileImage ? 
                        `<img src="${profileImage}" alt="Foto de perfil" class="profile-image">` : 
                        `<i class="fas fa-user"></i>`
                    }
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
    // Uses getUserData function from auth-utils.js to display user name
    this.updateUserName();
    // Update profile photo if exists
    this.updateProfilePhoto();
  }
  
  updateProfilePhoto() {
    const userData = getUserData();
    const profileImage = userData?.profileImage;
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userAvatar) {
      if (profileImage) {
        userAvatar.innerHTML = `<img src="${profileImage}" alt="Foto de perfil" class="profile-image">`;
      } else {
        userAvatar.innerHTML = '<i class="fas fa-user"></i>';
      }
    }
  }

  bindEvents() {
    this.bindUserProfileEvents();
    this.bindNotificationEvents();
  }

  /**
   * Bind events related to user profile
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
   * Bind events related to notifications
   */
  bindNotificationEvents() {
    if (!this.showNotifications) {
      return;
    }

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        // TODO: Implement notifications functionality
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

export default HeaderComponent;
