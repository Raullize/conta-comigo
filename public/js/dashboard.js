function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userData');
  window.location.href = '../pages/auth.html';
}

function checkAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = '../pages/auth.html';
    return;
  }

  loadUserData();
}

function loadUserData() {
  const userData = getUserData();
  const userNameElement = document.getElementById('userName');

  if (userData && userNameElement) {
    userNameElement.textContent = userData.name || userData.email || 'Usuário';
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  setupEventListeners();
});
