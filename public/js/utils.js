/**
 * Utilitários - Funções utilitárias reutilizáveis em toda a aplicação
 */

/**
 * Limita a frequência de execução de uma função
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce aplicado
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Limita a frequência de execução de uma função, garantindo que ela seja executada no máximo uma vez a cada período
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Tempo mínimo entre execuções em milissegundos
 * @returns {Function} Função com throttle aplicado
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Formata um valor monetário para o formato brasileiro
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: R$ 1.234,56)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (ex: 01/01/2023)
 */
function formatDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata uma data e hora para o formato brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data e hora formatadas (ex: 01/01/2023 14:30)
 */
function formatDateTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
}

/**
 * Valida um endereço de e-mail
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} True se o e-mail for válido, false caso contrário
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida um número de CPF
 * @param {string} cpf - CPF a ser validado (apenas números)
 * @returns {boolean} True se o CPF for válido, false caso contrário
 */
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Formata um número de CPF
 * @param {string} cpf - CPF a ser formatado (apenas números)
 * @returns {string} CPF formatado (ex: 123.456.789-00)
 */
function formatCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Formata um número de telefone
 * @param {string} phone - Telefone a ser formatado (apenas números)
 * @returns {string} Telefone formatado (ex: (11) 98765-4321)
 */
function formatPhone(phone) {
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Trunca um texto para um tamanho máximo
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// Exporta as funções para uso em outros arquivos
export {
  debounce,
  throttle,
  formatCurrency,
  formatDate,
  formatDateTime,
  validateEmail,
  validateCPF,
  formatCPF,
  formatPhone,
  generateUniqueId,
  truncateText,
};
