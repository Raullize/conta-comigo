/**
 * Login/Register Page JavaScript
 * Handles authentication forms, validation, and user registration/login
 */
import { loginUser } from './auth-utils.js';
import { validateEmail, validateCPF } from './utils.js';

// Application state
const authState = {
  currentForm: 'login',
  currentStep: 1,
  isLoading: false,
  passwordStrength: 0,
  registrationData: {},
};

// API URLs
const LOGIN_URL = '/sessions';
const REGISTER_URL = '/users';

const elements = {
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  registerFormStep2: document.getElementById('registerFormStep2'),
  loginFormElement: document.getElementById('loginFormElement'),
  registerFormStep1: document.getElementById('registerFormStep1'),
  registerFormElement: document.getElementById('registerFormElement'),
  toastContainer: document.getElementById('toastContainer'),
  nextStepBtn: document.getElementById('nextStepBtn'),
  prevStepBtn: document.getElementById('prevStepBtn'),
};

document.addEventListener('DOMContentLoaded', initializeAuth);

function initializeAuth() {
  setupFormSwitching();
  setupPasswordToggles();
  setupFormValidation();
  setupPasswordStrength();
  setupCPFMask();
  setupAgeValidation();
  setupFormSubmissions();
  setupStepNavigation();

  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  if (action === 'register') {
    switchToRegister();
  } else {
    switchToLogin();
  }
}

function switchToLogin() {
  authState.currentForm = 'login';
  elements.loginForm.classList.add('active');
  elements.registerForm.classList.remove('active');

  const url = new URL(window.location);
  url.searchParams.delete('action');
  window.history.replaceState({}, '', url);

  clearFormErrors();
  elements.registerFormStep1.reset();
  elements.registerFormElement.reset();
  authState.registrationData = {};
  authState.currentStep = 1;
}

function switchToRegister() {
  authState.currentForm = 'register';
  authState.currentStep = 1;
  elements.registerForm.classList.add('active');
  elements.registerFormStep2.classList.remove('active');
  elements.loginForm.classList.remove('active');

  const url = new URL(window.location);
  url.searchParams.set('action', 'register');
  window.history.replaceState({}, '', url);

  clearFormErrors();
  elements.loginFormElement.reset();
  elements.registerFormStep1.reset();
  elements.registerFormElement.reset();
}

function setupFormSwitching() {
  // Event listeners for form toggle buttons
  const switchToLoginBtns = document.querySelectorAll('[data-switch="login"]');
  const switchToRegisterBtns = document.querySelectorAll('[data-switch="register"]');
  
  switchToLoginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToLogin();
    });
  });
  
  switchToRegisterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToRegister();
    });
  });
}

function setupStepNavigation() {
  if (elements.nextStepBtn) {
    elements.nextStepBtn.addEventListener('click', () => {
      if (validateStep1()) {
        goToStep2();
      }
    });
  }

  if (elements.prevStepBtn) {
    elements.prevStepBtn.addEventListener('click', () => {
      goToStep1();
    });
  }
}

function validateStep1() {
  const form = elements.registerFormStep1;
  const inputs = form.querySelectorAll('.form-input');
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

function goToStep2() {
  const form = elements.registerFormStep1;
  const formData = new FormData(form);

  authState.registrationData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    cpf: formData.get('cpf'),
    birthDate: formData.get('birthDate'),
  };

  authState.currentStep = 2;
  elements.registerForm.classList.remove('active');
  elements.registerFormStep2.classList.add('active');
  populateStep2Data();
}

function goToStep1() {
  authState.currentStep = 1;
  elements.registerFormStep2.classList.remove('active');
  elements.registerForm.classList.add('active');
  populateStep1Data();
}

function populateStep1Data() {
  if (authState.registrationData) {
    const form = elements.registerFormStep1;

    if (authState.registrationData.fullName) {
      form.querySelector('#fullName').value =
        authState.registrationData.fullName;
    }
    if (authState.registrationData.email) {
      form.querySelector('#registerEmail').value =
        authState.registrationData.email;
    }
    if (authState.registrationData.cpf) {
      form.querySelector('#cpf').value = authState.registrationData.cpf;
    }
    if (authState.registrationData.birthDate) {
      form.querySelector('#birthDate').value =
        authState.registrationData.birthDate;
    }
  }
}

function populateStep2Data() {
  // Clear password fields when returning to step 2
  const form = elements.registerFormElement;
  form.querySelector('#registerPassword').value = '';
  form.querySelector('#confirmPassword').value = '';
  form.querySelector('#acceptTerms').checked = false;

  // Reset password strength indicator
  updatePasswordStrength('');
}

function setupPasswordToggles() {
  const passwordToggles = document.querySelectorAll('.password-toggle');

  passwordToggles.forEach((toggle) => {
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

function setupFormValidation() {
  const inputs = document.querySelectorAll('.form-input');

  inputs.forEach((input) => {
    input.addEventListener('blur', function () {
      validateField(this);
    });

    input.addEventListener('input', function () {
      clearFieldError(this);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = '';

  switch (fieldName) {
    case 'email':
      if (!value) {
        errorMessage = 'E-mail é obrigatório';
        isValid = false;
      } else if (!validateEmail(value)) {
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

    case 'confirmPassword': {
      const passwordField = document.getElementById('registerPassword');
      if (!value) {
        errorMessage = 'Confirmação de senha é obrigatória';
        isValid = false;
      } else if (value !== passwordField.value) {
        errorMessage = 'Senhas não coincidem';
        isValid = false;
      }
      break;
    }

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
      } else if (!validateCPF(value)) {
        errorMessage = 'CPF inválido';
        isValid = false;
      }
      break;

    case 'birthDate': {
      if (!value) {
        errorMessage = 'Data de nascimento é obrigatória';
        isValid = false;
      } else {
        isValid = validateAge(field);
      }
      break;
    }
  }

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

function updatePasswordStrength(password) {
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');

  if (strengthBar && strengthText) {
    const strength = calculatePasswordStrength(password);
    updatePasswordStrengthUI(strength, strengthBar, strengthText);
  }
}

function updatePasswordStrengthUI(strength, strengthBar, strengthText) {
  const levels = ['', 'weak', 'fair', 'good', 'strong'];
  const texts = ['', 'Fraca', 'Regular', 'Boa', 'Forte'];

  strengthBar.className = 'strength-fill';

  if (strength > 0) {
    strengthBar.classList.add(levels[strength]);
    strengthText.textContent = `Força: ${texts[strength]}`;
  } else {
    strengthText.textContent = 'Força da senha';
  }

  authState.passwordStrength = strength;
}

function setupAgeValidation() {
  const birthDateInput = document.getElementById('birthDate');

  if (birthDateInput) {
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

function setupFormSubmissions() {
  elements.loginFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    handleLogin(this);
  });

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

  try {
    setFormLoading('login', true);
    // Add a small delay to ensure user sees loading state
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro no login');
    }

    // Check where the token is located in the response
    let token = null;
    if (result.token) {
      token = result.token;
    } else if (result.data && result.data.token) {
      token = result.data.token;
    } else if (result.accessToken) {
      token = result.accessToken;
    } else {
      console.error('Estrutura da resposta:', result);
      throw new Error('Token não encontrado na resposta');
    }

    const userData = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      cpf: result.user.cpf,
      birth_date: result.user.birth_date,
      loginTime: new Date().toISOString(),
    };

    loginUser(userData, token);

    setFormSuccess('login');
    showToast(
      'success',
      'Login realizado!',
      'Login efetuado com sucesso!',
      6000
    );
    
    // Show redirect toast separately
    setTimeout((() => {
      showToast(
        'info',
        'Redirecionando',
        'Redirecionando para o dashboard...',
        3000
      );
    }), 1000);

    setTimeout((() => {
      window.location.href = './dashboard.html';
    }), 3000);
  } catch (error) {
    // Login error
    showToast(
      'error',
      'Erro no login',
      error.message || 'E-mail ou senha incorretos.'
    );
  } finally {
    setFormLoading('login', false);
  }
}

async function handleRegister(form) {
  if (authState.isLoading) {
    return;
  }

  const formData = new FormData(form);

  const fields = form.querySelectorAll('.form-input');
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  const termsCheckbox = form.querySelector('[name="acceptTerms"]');
  if (!termsCheckbox.checked) {
    showToast(
      'warning',
      'Termos obrigatórios',
      'É necessário aceitar os Termos de Uso e Política de Privacidade para continuar.'
    );
    isValid = false;
  }

  if (authState.passwordStrength < 2) {
    showToast('warning', 'Senha fraca', 'Por favor, use uma senha mais forte.');
    isValid = false;
  }

  if (!isValid && termsCheckbox.checked && authState.passwordStrength >= 2) {
    showToast(
      'error',
      'Erro de validação',
      'Por favor, corrija os erros no formulário.'
    );
  }

  if (!isValid) {
    return;
  }

  const completeRegistrationData = {
    ...authState.registrationData,
    password: formData.get('password'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  };

  setFormLoading('register', true);

  try {
    // Add a small delay to ensure user sees loading state
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: completeRegistrationData.fullName,
        email: completeRegistrationData.email,
        cpf: completeRegistrationData.cpf,
        birthDate: completeRegistrationData.birthDate,
        password: completeRegistrationData.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro no cadastro');
    }

    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: completeRegistrationData.email,
        password: completeRegistrationData.password,
      }),
    });

    const loginResult = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginResult.error || 'Erro no login automático');
    }

    const userData = {
      id: loginResult.user.id,
      name: loginResult.user.name,
      email: loginResult.user.email,
      cpf: loginResult.user.cpf,
      birth_date: loginResult.user.birth_date,
      loginTime: new Date().toISOString(),
    };

    loginUser(userData, loginResult.token);

    setFormSuccess('register');
    showToast('success', 'Conta criada!', 'Sua conta foi criada com sucesso!', 6000);
    
    // Show redirect toast separately
    setTimeout((() => {
      showToast(
        'info',
        'Redirecionando',
        'Redirecionando para o dashboard...',
        3000
      );
    }), 1000);

    // Clear temporary data
    authState.registrationData = {};

    // Redirect to dashboard
    setTimeout((() => {
      window.location.href = './dashboard.html';
    }), 3000);
  } catch (error) {
    // Registration error
    showToast(
      'error',
      'Erro no cadastro',
      error.message || 'Tente novamente em alguns instantes.'
    );
  } finally {
    setFormLoading('register', false);
  }
}

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
    button.classList.remove('success');
    button.disabled = true;

    const inputs = form.querySelectorAll('input, button');
    inputs.forEach((input) => (input.disabled = true));
  } else {
    button.classList.remove('loading');
    button.disabled = false;

    const inputs = form.querySelectorAll('input, button');
    inputs.forEach((input) => (input.disabled = false));
  }
}

function setFormSuccess(formType) {
  const button = document.getElementById(
    formType === 'login' ? 'loginBtn' : 'registerBtn'
  );

  button.classList.remove('loading');
  button.classList.add('success');
  button.disabled = true;
}

function showToast(type, title, message, duration = 5000) {
  const toast = createToastElement(type, title, message);
  elements.toastContainer.appendChild(toast);

  setTimeout((() => {
    removeToast(toast);
  }), duration);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', (() => removeToast(toast)));
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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => removeToast(toast));
  }

  if (e.key === 'Enter' && e.target.classList.contains('link-btn')) {
    e.target.click();
  }
});
