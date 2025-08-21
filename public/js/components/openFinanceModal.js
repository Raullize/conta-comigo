/**
 * Open Finance Modal Component
 * Handles the modal for linking bank accounts via Open Finance
 */

class OpenFinanceModal {
  constructor() {
    this.modal = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="openFinanceModal" class="modal-overlay open-finance-modal" style="display: none;">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Vincular Conta Bancária</h2>
            <p>Para continuar usando o ContaComigo, você precisa vincular pelo menos uma conta bancária via Open Finance.</p>
          </div>
          
          <div class="modal-content">
            <div class="institution-selection">
              <h3>Selecione uma instituição financeira:</h3>
              
              <div class="institutions-grid">
                <div class="institution-card">
                  <div class="institution-info">
                    <div class="institution-logo vitor">V</div>
                    <div class="institution-details">
                      <h4>Banco Vitor</h4>
                      <p>API Vitor</p>
                    </div>
                  </div>
                  <button class="btn-link-account" data-bank-id="vitor">
                    <span>🔗</span>
                    Conectar
                  </button>
                </div>
                
                <div class="institution-card">
                  <div class="institution-info">
                    <div class="institution-logo lucas">L</div>
                    <div class="institution-details">
                      <h4>Banco Lucas</h4>
                      <p>API Lucas</p>
                    </div>
                  </div>
                  <button class="btn-link-account" data-bank-id="lucas">
                    <span>🔗</span>
                    Conectar
                  </button>
                </div>
                
                <div class="institution-card">
                  <div class="institution-info">
                    <div class="institution-logo patricia">P</div>
                    <div class="institution-details">
                      <h4>Banco Patricia</h4>
                      <p>API Patricia</p>
                    </div>
                  </div>
                  <button class="btn-link-account" data-bank-id="patricia">
                    <span>🔗</span>
                    Conectar
                  </button>
                </div>
                
                <div class="institution-card">
                  <div class="institution-info">
                    <div class="institution-logo dante">D</div>
                    <div class="institution-details">
                      <h4>Banco Dante</h4>
                      <p>API Dante</p>
                    </div>
                  </div>
                  <button class="btn-link-account" data-bank-id="dante">
                    <span>🔗</span>
                    Conectar
                  </button>
                </div>
                
                <div class="institution-card">
                  <div class="institution-info">
                    <div class="institution-logo raul">R</div>
                    <div class="institution-details">
                      <h4>Banco Raul</h4>
                      <p>API Raul</p>
                    </div>
                  </div>
                  <button class="btn-link-account" data-bank-id="raul">
                    <span>🔗</span>
                    Conectar
                  </button>
                </div>
                
                <div class="institution-card">
                   <div class="institution-info">
                     <div class="institution-logo caputi">C</div>
                     <div class="institution-details">
                       <h4>Banco Caputi</h4>
                       <p>API Caputi</p>
                     </div>
                   </div>
                   <button class="btn-link-account" data-bank-id="caputi">
                     <span>🔗</span>
                     Conectar
                   </button>
                 </div>
              </div>
            </div>
            
            <div class="consent-section" id="consentSection" style="display: none;">
              <div class="consent-info">
                <h3>Autorização de Compartilhamento</h3>
                <p>Ao conectar sua conta, você autoriza o ContaComigo a:</p>
                <ul>
                  <li>Acessar informações da sua conta bancária</li>
                  <li>Visualizar seu saldo atual</li>
                  <li>Consultar seu histórico de transações</li>
                </ul>
                <p><strong>Seus dados estão seguros e protegidos.</strong></p>
              </div>
              
              <div class="consent-actions">
                <button id="btnConfirmConsent" class="btn-primary">
                  <i class="fas fa-check"></i>
                  Autorizar Conexão
                </button>
                <button id="btnCancelConsent" class="btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
              </div>
            </div>
            
            <div class="loading-section" id="loadingSection" style="display: none;">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <p>Conectando sua conta...</p>
            </div>
            
            <div class="success-section" id="successSection" style="display: none;">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3>Conta conectada com sucesso!</h3>
              <p>Seus dados bancários foram sincronizados.</p>
              <button id="btnContinue" class="btn-primary">
                Continuar para o Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('openFinanceModal');
  }

  attachEventListeners() {
    
    const linkButtons = document.querySelectorAll('.btn-link-account:not([disabled])');
    linkButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bankId = e.target.closest('.btn-link-account').dataset.bankId;
        this.showConsentSection(bankId);
      });
    });

    
    document.getElementById('btnConfirmConsent')?.addEventListener('click', () => {
      this.linkAccount();
    });

    
    document.getElementById('btnCancelConsent')?.addEventListener('click', () => {
      this.showInstitutionSelection();
    });

    
    document.getElementById('btnContinue')?.addEventListener('click', () => {
      this.hide();
      window.location.reload();
    });
  }

  show() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      this.isVisible = true;
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = 'auto';
    }
  }

  showInstitutionSelection() {
    document.querySelector('.institution-selection').style.display = 'block';
    document.getElementById('consentSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'none';
  }

  showConsentSection(bankId) {
    document.querySelector('.institution-selection').style.display = 'none';
    document.getElementById('consentSection').style.display = 'block';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'none';
    
    
    this.selectedBankId = bankId;
  }

  showLoadingSection() {
    document.querySelector('.institution-selection').style.display = 'none';
    document.getElementById('consentSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('successSection').style.display = 'none';
  }

  showSuccessSection() {
    document.querySelector('.institution-selection').style.display = 'none';
    document.getElementById('consentSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'block';
    
    
    setTimeout(() => {
      
      if (typeof window.clearCacheAndReload === 'function') {
        window.clearCacheAndReload();
      }
      
      
      window.dispatchEvent(new CustomEvent('accountConnected', {
        detail: { bankId: this.selectedBankId }
      }));
    }, 1000);
  }

  async linkAccount() {
    try {
      this.showLoadingSection();

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

  
      const endpoints = {
        vitor: '/open-finance/link-vitor',
        lucas: '/open-finance/link-lucas',
        caputi: '/open-finance/link-caputi',
        dante: '/open-finance/link-dante',
        raul: '/open-finance/link-raul',
        patricia: '/open-finance/link-patricia'
      };
      
      const endpoint = endpoints[this.selectedBankId] || endpoints.vitor;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consent: true })
      });

      const data = await response.json();

      if (response.ok) {
        this.showSuccessSection();
      } else {
        throw new Error(data.error || 'Erro ao conectar conta');
      }
    } catch (error) {
      console.error('Erro ao vincular conta:', error);
      alert('Erro ao conectar conta: ' + error.message);
      this.showInstitutionSelection();
    }
  }


  static async checkLinkedAccounts() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { hasLinkedAccounts: false };
      }

      const response = await fetch('/open-finance/check-accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { hasLinkedAccounts: false };
      }
    } catch (error) {
      console.error('Erro ao verificar contas vinculadas:', error);
      return { hasLinkedAccounts: false };
    }
  }
}


window.OpenFinanceModal = OpenFinanceModal;

export default OpenFinanceModal;