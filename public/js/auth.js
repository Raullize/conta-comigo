// ===== AUTENTICAÇÃO - FUNCIONALIDADES INTERATIVAS =====

// Estado da aplicação
const authState = {
  currentForm: 'login',
  isLoading: false,
  passwordStrength: 0,
};

// Elementos DOM
const elements = {
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  loginFormElement: document.getElementById('loginFormElement'),
  registerFormElement: document.getElementById('registerFormElement'),
  toastContainer: document.getElementById('toastContainer'),
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth();
});

function initializeAuth() {
  setupFormSwitching();
  setupPasswordToggles();
  setupFormValidation();
  setupPasswordStrength();
  setupCPFMask();
  setupAgeValidation();
  setupFormSubmissions();

  // Verificar se há parâmetros na URL para determinar qual formulário mostrar
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  if (action === 'register') {
    switchToRegister();
  } else {
    switchToLogin();
  }
}

// ===== ALTERNÂNCIA ENTRE FORMULÁRIOS =====
function setupFormSwitching() {
  // Função global para alternar para login
  window.switchToLogin = function () {
    authState.currentForm = 'login';
    elements.loginForm.classList.add('active');
    elements.registerForm.classList.remove('active');

    // Atualizar URL sem recarregar a página
    const url = new URL(window.location);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url);

    // Limpar formulários
    clearFormErrors();
    elements.registerFormElement.reset();
  };

  // Função global para alternar para registro
  window.switchToRegister = function () {
    authState.currentForm = 'register';
    elements.registerForm.classList.add('active');
    elements.loginForm.classList.remove('active');

    // Atualizar URL sem recarregar a página
    const url = new URL(window.location);
    url.searchParams.set('action', 'register');
    window.history.replaceState({}, '', url);

    // Limpar formulários
    clearFormErrors();
    elements.loginFormElement.reset();
  };
}

// ===== TOGGLE DE SENHAS =====
function setupPasswordToggles() {
  const passwordToggles = document.querySelectorAll('.password-toggle');

  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function setupFormValidation() {
  // Validação em tempo real
  const inputs = document.querySelectorAll('.form-input');

  inputs.forEach(input => {
    input.addEventListener('blur', function () {
      validateField(this);
    });

    input.addEventListener('input', function () {
      // Remover erro quando o usuário começar a digitar
      clearFieldError(this);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = '';

  // Validações específicas por campo
  switch (fieldName) {
    case 'email':
      if (!value) {
        errorMessage = 'E-mail é obrigatório';
        isValid = false;
      } else if (!isValidEmail(value)) {
        errorMessage = 'E-mail inválido';
        isValid = false;
      }
      break;

    case 'password':
      if (!value) {
        errorMessage = 'Senha é obrigatória';
        isValid = false;
      } else if (value.length < 8) {
        errorMessage = 'Senha deve ter pelo menos 8 caracteres';
        isValid = false;
      }
      break;

    case 'confirmPassword':
      const passwordField = document.getElementById('registerPassword');
      if (!value) {
        errorMessage = 'Confirmação de senha é obrigatória';
        isValid = false;
      } else if (value !== passwordField.value) {
        errorMessage = 'Senhas não coincidem';
        isValid = false;
      }
      break;

    case 'fullName':
      if (!value) {
        errorMessage = 'Nome completo é obrigatório';
        isValid = false;
      } else if (value.length < 3) {
        errorMessage = 'Nome deve ter pelo menos 3 caracteres';
        isValid = false;
      } else if (!value.includes(' ')) {
        errorMessage = 'Digite seu nome completo';
        isValid = false;
      }
      break;

    case 'cpf':
      if (!value) {
        errorMessage = 'CPF é obrigatório';
        isValid = false;
      } else if (!isValidCPF(value)) {
        errorMessage = 'CPF inválido';
        isValid = false;
      }
      break;

    case 'birthDate':
      if (!value) {
        errorMessage = 'Data de nascimento é obrigatória';
        isValid = false;
      } else {
        isValid = validateAge(field);
      }
      break;
  }

  // Mostrar ou esconder erro
  if (isValid) {
    showFieldSuccess(field);
  } else {
    showFieldError(field, errorMessage);
  }

  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  field.classList.remove('success');

  const errorElement =
    document.getElementById(field.name + 'Error') ||
    document.getElementById(field.id + 'Error');

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function showFieldSuccess(field) {
  field.classList.remove('error');
  field.classList.add('success');

  const errorElement =
    document.getElementById(field.name + 'Error') ||
    document.getElementById(field.id + 'Error');

  if (errorElement) {
    errorElement.classList.remove('show');
  }
}

function clearFieldError(field) {
  field.classList.remove('error');

  const errorElement =
    document.getElementById(field.name + 'Error') ||
    document.getElementById(field.id + 'Error');

  if (errorElement) {
    errorElement.classList.remove('show');
  }
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.input-error');
  const inputElements = document.querySelectorAll('.form-input');

  errorElements.forEach(error => error.classList.remove('show'));
  inputElements.forEach(input => {
    input.classList.remove('error', 'success');
  });
}

// ===== FORÇA DA SENHA =====
function setupPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');

  if (passwordInput && strengthBar && strengthText) {
    passwordInput.addEventListener('input', function () {
      const strength = calculatePasswordStrength(this.value);
      updatePasswordStrengthUI(strength, strengthBar, strengthText);
    });
  }
}

// ===== MÁSCARA DE CPF =====
function setupCPFMask() {
  const cpfInput = document.getElementById('cpf');

  if (cpfInput) {
    cpfInput.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, '');

      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        value = value.replace(/(\d{3})/, '$1');
      }

      this.value = value;
    });
  }
}

function calculatePasswordStrength(password) {
  let score = 0;

  // Critérios de força
  if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }
  if (/[a-z]/.test(password)) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return Math.min(score, 4);
}

function updatePasswordStrengthUI(strength, strengthBar, strengthText) {
  const levels = ['', 'weak', 'fair', 'good', 'strong'];
  const texts = ['', 'Fraca', 'Regular', 'Boa', 'Forte'];

  // Remover classes anteriores
  strengthBar.className = 'strength-fill';

  if (strength > 0) {
    strengthBar.classList.add(levels[strength]);
    strengthText.textContent = `Força: ${texts[strength]}`;
  } else {
    strengthText.textContent = 'Força da senha';
  }

  authState.passwordStrength = strength;
}

// ===== VALIDAÇÃO DE IDADE =====
function setupAgeValidation() {
  const birthDateInput = document.getElementById('birthDate');

  if (birthDateInput) {
    // Definir data máxima (18 anos atrás)
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const maxDateString = maxDate.toISOString().split('T')[0];
    birthDateInput.setAttribute('max', maxDateString);

    birthDateInput.addEventListener('change', function () {
      validateAge(this);
    });
  }
}

function validateAge(birthDateInput) {
  const birthDate = new Date(birthDateInput.value);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

  if (actualAge < 18) {
    showFieldError(
      birthDateInput,
      'Você deve ter pelo menos 18 anos para se cadastrar'
    );
    return false;
  } else {
    showFieldSuccess(birthDateInput);
    return true;
  }
}

// ===== SUBMISSÃO DE FORMULÁRIOS =====
function setupFormSubmissions() {
  // Login
  elements.loginFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    handleLogin(this);
  });

  // Registro
  elements.registerFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    handleRegister(this);
  });
}

async function handleLogin(form) {
  if (authState.isLoading) {
    return;
  }

  const formData = new FormData(form);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  };

  // Validar campos
  const emailField = form.querySelector('[name="email"]');
  const passwordField = form.querySelector('[name="password"]');

  let isValid = true;

  if (!validateField(emailField)) {
    isValid = false;
  }
  if (!validateField(passwordField)) {
    isValid = false;
  }

  if (!isValid) {
    showToast(
      'error',
      'Erro de validação',
      'Por favor, corrija os erros no formulário.'
    );
    return;
  }

  // Mostrar loading
  setFormLoading('login', true);

  try {
    // Simular chamada de API
    await simulateAPICall(2000);

    // Sucesso
    showToast(
      'success',
      'Login realizado!',
      'Redirecionando para o dashboard...'
    );

    // Redirecionar após um tempo
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } catch (error) {
    showToast('error', 'Erro no login', 'E-mail ou senha incorretos.');
  } finally {
    setFormLoading('login', false);
  }
}

async function handleRegister(form) {
  if (authState.isLoading) {
    return;
  }

  const formData = new FormData(form);
  const data = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    cpf: formData.get('cpf'),
    birthDate: formData.get('birthDate'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  };

  // Validar todos os campos
  const fields = form.querySelectorAll('.form-input');
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  // Validar termos
  const termsCheckbox = form.querySelector('[name="acceptTerms"]');
  if (!termsCheckbox.checked) {
    showFieldError(termsCheckbox, 'Você deve aceitar os termos de uso');
    isValid = false;
  }

  // Validar força da senha
  if (authState.passwordStrength < 2) {
    showToast('warning', 'Senha fraca', 'Por favor, use uma senha mais forte.');
    isValid = false;
  }

  if (!isValid) {
    showToast(
      'error',
      'Erro de validação',
      'Por favor, corrija os erros no formulário.'
    );
    return;
  }

  // Mostrar loading
  setFormLoading('register', true);

  try {
    // Simular chamada de API
    await simulateAPICall(3000);

    // Sucesso
    showToast('success', 'Conta criada!', 'Bem-vindo ao ContaComigo!');

    // Alternar para login após um tempo
    setTimeout(() => {
      switchToLogin();
      showToast(
        'success',
        'Agora faça login',
        'Use suas credenciais para entrar.'
      );
    }, 2000);
  } catch (error) {
    showToast(
      'error',
      'Erro no cadastro',
      'Tente novamente em alguns instantes.'
    );
  } finally {
    setFormLoading('register', false);
  }
}

// ===== ESTADOS DE LOADING =====
function setFormLoading(formType, isLoading) {
  authState.isLoading = isLoading;

  const button = document.getElementById(
    formType === 'login' ? 'loginBtn' : 'registerBtn'
  );
  const form =
    formType === 'login'
      ? elements.loginFormElement
      : elements.registerFormElement;

  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;

    // Desabilitar todos os inputs
    const inputs = form.querySelectorAll('input, button');
    inputs.forEach(input => (input.disabled = true));
  } else {
    button.classList.remove('loading');
    button.disabled = false;

    // Reabilitar todos os inputs
    const inputs = form.querySelectorAll('input, button');
    inputs.forEach(input => (input.disabled = false));
  }
}

// ===== SISTEMA DE TOAST =====
function showToast(type, title, message, duration = 5000) {
  const toast = createToastElement(type, title, message);
  elements.toastContainer.appendChild(toast);

  // Auto remover
  setTimeout(() => {
    removeToast(toast);
  }, duration);

  // Remover ao clicar no X
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));
}

function createToastElement(type, title, message) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i class="fas ${icons[type]}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;

  return toast;
}

function removeToast(toast) {
  toast.style.animation = 'slideOutRight 0.3s ease-out';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ===== UTILITÁRIOS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCPF(cpf) {
  // Remove formatação
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

function simulateAPICall(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular sucesso na maioria das vezes
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error('Erro simulado'));
      }
    }, delay);
  });
}

// ===== ANIMAÇÕES ADICIONAIS =====

// Adicionar animação de slide out para toasts
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

// ===== ACESSIBILIDADE =====

// Melhorar navegação por teclado
document.addEventListener('keydown', e => {
  // ESC para fechar toasts
  if (e.key === 'Escape') {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => removeToast(toast));
  }

  // Enter para alternar entre formulários quando focado nos links
  if (e.key === 'Enter' && e.target.classList.contains('link-btn')) {
    e.target.click();
  }
});

// ===== ANALYTICS E TRACKING (PLACEHOLDER) =====

// Função para tracking de eventos (será implementada com analytics reais)
function trackEvent(eventName, properties = {}) {
  console.log('Event tracked:', eventName, properties);

  // Aqui seria integrado com Google Analytics, Mixpanel, etc.
  // gtag('event', eventName, properties);
}

// Tracking de eventos importantes
function setupEventTracking() {
  // Track form switches
  const originalSwitchToLogin = window.switchToLogin;
  const originalSwitchToRegister = window.switchToRegister;

  window.switchToLogin = function () {
    trackEvent('auth_form_switch', { form: 'login' });
    originalSwitchToLogin();
  };

  window.switchToRegister = function () {
    trackEvent('auth_form_switch', { form: 'register' });
    originalSwitchToRegister();
  };
}

// Inicializar tracking
setupEventTracking();
