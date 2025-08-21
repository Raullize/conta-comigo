import { showLogoutModal } from '../auth-utils.js';

class SidebarComponent {
  constructor() {
    this.currentPage = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'dashboard';
  }

  render() {
    return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <img src="../assets/logos/logo.png" alt="ContaComigo Logo" class="sidebar-logo-img">
                        <span class="logo-text">
                            <span class="logo-conta">Conta</span><span class="logo-comigo">Comigo</span>
                        </span>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <a href="${this.currentPage === 'dashboard' ? '#' : 'dashboard.html'}" class="nav-item ${this.currentPage === 'dashboard' ? 'active disabled' : ''}">
                        <i class="fas fa-chart-pie"></i>
                        <span class="full-text">Dashboard</span>
                        <span class="short-text">Dashboard</span>
                    </a>
                    <a href="${this.currentPage === 'expenses' ? '#' : 'expenses.html'}" class="nav-item ${this.currentPage === 'expenses' ? 'active disabled' : ''}">
                        <i class="fas fa-wallet"></i>
                        <span class="full-text">Meus Gastos</span>
                        <span class="short-text">Gastos</span>
                    </a>
                    <a href="${this.currentPage === 'institutions' ? '#' : 'institutions.html'}" class="nav-item ${this.currentPage === 'institutions' ? 'active disabled' : ''}">
                        <i class="fas fa-university"></i>
                        <span class="full-text">Minhas Instituições</span>
                        <span class="short-text">Instituições</span>
                    </a>
                    <a href="${this.currentPage === 'investments' ? '#' : 'investments.html'}" class="nav-item ${this.currentPage === 'investments' ? 'active disabled' : ''}">
                        <i class="fas fa-chart-line"></i>
                        <span class="full-text">Meus Investimentos</span>
                        <span class="short-text">Investimentos</span>
                    </a>
                    <a href="${this.currentPage === 'simulator' ? '#' : 'simulator.html'}" class="nav-item ${this.currentPage === 'simulator' ? 'active disabled' : ''}">
                        <i class="fas fa-calculator"></i>
                        <span class="full-text">Simular Investimentos</span>
                        <span class="short-text">Simular</span>
                    </a>
                    <a href="${this.currentPage === 'settings' ? '#' : 'settings.html'}" class="nav-item ${this.currentPage === 'settings' ? 'active disabled' : ''}">
                        <i class="fas fa-cog"></i>
                        <span class="full-text">Configurações</span>
                        <span class="short-text">Config</span>
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <a href="#" class="nav-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span class="full-text">Sair</span>
                        <span class="short-text">Sair</span>
                    </a>
                </div>
            </aside>
        `;
  }

  init(container) {
    container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  handleLogout() {
    showLogoutModal();
  }
}

export default SidebarComponent;
