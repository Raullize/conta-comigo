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
      <div id="openFinanceModal" class="modal-overlay" style="display: none;">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Vincular Conta Bancária</h2>
            <p>Para continuar usando o ContaComigo, você precisa vincular pelo menos uma conta bancária via Open Finance.</p>
          </div>
          
          <div class="modal-content">
            <div class="institution-selection">
              <h3>Selecione uma instituição financeira:</h3>
              
              <div class="institution-card" data-bank-id="4">
                <div class="institution-info">
                  <div class="institution-logo">
                    <i class="fas fa-university"></i>
                  </div>
                  <div class="institution-details">
                    <h4>Banco Vitor</h4>
                    <p>Conecte sua conta do Banco Vitor</p>
                  </div>
                </div>
                <button class="btn-link-account" data-bank-id="4">
                  <i class="fas fa-link"></i>
                  Conectar
                </button>
              </div>
              
              <div class="institution-card disabled">
                <div class="institution-info">
                  <div class="institution-logo">
                    <i class="fas fa-university"></i>
                  </div>
                  <div class="institution-details">
                    <h4>Outras Instituições</h4>
                    <p>Em breve mais bancos estarão disponíveis</p>
                  </div>
                </div>
                <button class="btn-link-account" disabled>
                  <i class="fas fa-clock"></i>
                  Em breve
                </button>
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
    // Botão de conectar conta
    const linkButtons = document.querySelectorAll('.btn-link-account:not([disabled])');
    linkButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bankId = e.target.closest('.btn-link-account').dataset.bankId;
        this.showConsentSection(bankId);
      });
    });

    // Botão de confirmar consentimento
    document.getElementById('btnConfirmConsent')?.addEventListener('click', () => {
      this.linkAccount();
    });

    // Botão de cancelar consentimento
    document.getElementById('btnCancelConsent')?.addEventListener('click', () => {
      this.showInstitutionSelection();
    });

    // Botão de continuar após sucesso
    document.getElementById('btnContinue')?.addEventListener('click', () => {
      this.hide();
      window.location.reload(); // Recarrega a página para atualizar os dados
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
    
    // Armazena o ID do banco selecionado
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
  }

  async linkAccount() {
    try {
      this.showLoadingSection();

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/open-finance/link-vitor', {
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

  // Método estático para verificar se o usuário tem contas vinculadas
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

// Exporta a classe para uso em outros módulos
window.OpenFinanceModal = OpenFinanceModal;

export default OpenFinanceModal;