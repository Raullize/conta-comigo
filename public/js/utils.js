/**
 * Utilities - Reusable Utility Functions Across the Application
 */

/**
 * Limits the frequency of function execution
 * @param {Function} func - Function to be executed
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Function with debounce applied
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Limits the frequency of function execution, ensuring it runs at most once per period
 * @param {Function} func - Function to be executed
 * @param {number} limit - Minimum time between executions in milliseconds
 * @returns {Function} Function with throttle applied
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
 * Formats a monetary value to Brazilian format
 * @param {number} value - Value to be formatted
 * @returns {string} Formatted value (e.g., R$ 1.234,56)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a date to Brazilian format
 * @param {string|Date} date - Date to be formatted
 * @returns {string} Formatted date (e.g., 01/01/2023)
 */
function formatDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formats a date and time to Brazilian format
 * @param {string|Date} date - Date to be formatted
 * @returns {string} Formatted date and time (e.g., 01/01/2023 14:30)
 */
function formatDateTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
}

/**
 * Validates an email address
 * @param {string} email - Email to be validated
 * @returns {boolean} True if email is valid, false otherwise
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates a CPF number
 * @param {string} cpf - CPF to be validated (numbers only)
 * @returns {boolean} True if CPF is valid, false otherwise
 */
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10), 10)) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11), 10)) {
    return false;
  }

  return true;
}

/**
 * Formats a CPF number
 * @param {string} cpf - CPF to be formatted (numbers only)
 * @returns {string} Formatted CPF (e.g., 123.456.789-00)
 */
function formatCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Formats a phone number
 * @param {string} phone - Phone to be formatted (numbers only)
 * @returns {string} Formatted phone (e.g., (11) 98765-4321)
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
 * Generates a unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Truncates text to a maximum length
 * @param {string} text - Text to be truncated
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

export { throttle, debounce, formatCurrency, formatDate, formatDateTime, validateEmail, validateCPF, formatCPF, formatPhone, generateUniqueId, truncateText };
