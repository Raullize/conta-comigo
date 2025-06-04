/**
 * Componente de barra lateral para navegação
 */
class SidebarComponent {
  constructor() {
    this.currentPage = this.getCurrentPage();
  }

  /**
   * Determina a página atual com base na URL
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'dashboard';
  }

  /**
   * Renderiza o HTML da barra lateral
   */
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
                    <a href="dashboard.html" class="nav-item ${this.currentPage === 'dashboard' ? 'active' : ''}">
                        <i class="fas fa-chart-pie"></i>
                        <span class="full-text">Dashboard</span>
                        <span class="short-text">Dashboard</span>
                    </a>
                    <a href="expenses.html" class="nav-item ${this.currentPage === 'expenses' ? 'active' : ''}">
                        <i class="fas fa-wallet"></i>
                        <span class="full-text">Meus Gastos</span>
                        <span class="short-text">Gastos</span>
                    </a>
                    <a href="institutions.html" class="nav-item ${this.currentPage === 'institutions' ? 'active' : ''}">
                        <i class="fas fa-university"></i>
                        <span class="full-text">Minhas Instituições</span>
                        <span class="short-text">Instituições</span>
                    </a>
                    <a href="investments.html" class="nav-item ${this.currentPage === 'investments' ? 'active' : ''}">
                        <i class="fas fa-chart-line"></i>
                        <span class="full-text">Meus Investimentos</span>
                        <span class="short-text">Investimentos</span>
                    </a>
                    <a href="simulator.html" class="nav-item ${this.currentPage === 'simulator' ? 'active' : ''}">
                        <i class="fas fa-calculator"></i>
                        <span class="full-text">Simular Investimentos</span>
                        <span class="short-text">Simular</span>
                    </a>
                    <a href="settings.html" class="nav-item ${this.currentPage === 'settings' ? 'active' : ''}">
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

  /**
   * Inicializa o componente no container especificado
   */
  init(container) {
    container.innerHTML = this.render();
    this.bindEvents();
  }

  /**
   * Vincula eventos aos elementos do componente
   */
  bindEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Gerencia o processo de logout usando a função showLogoutModal do auth-utils.js
   */
  handleLogout() {
    // Usa a função showLogoutModal do auth-utils.js
    showLogoutModal();
  }
}

// Exporta o componente para uso global
window.SidebarComponent = SidebarComponent;
