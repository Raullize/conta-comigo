// Landing Page JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeFAQ();
  initializeScrollReveal();
  initializeSmoothScrolling();
});

// Initialize Mobile Menu
function initializeMobileMenu() {
  // DOM Elements
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  const mobileSidebarOverlay = document.querySelector('.mobile-sidebar-overlay');
  const sidebarClose = document.querySelector('.sidebar-close');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Debug: Check if elements are found
  console.log('Mobile menu elements:', {
    toggle: !!mobileMenuToggle,
    sidebar: !!mobileSidebar,
    overlay: !!mobileSidebarOverlay,
    close: !!sidebarClose
  });

  if (!mobileMenuToggle || !mobileSidebar || !mobileSidebarOverlay) {
    console.error('Mobile menu elements not found!');
    return;
  }

  // Mobile Sidebar Toggle Functions
  function openSidebar() {
    mobileSidebar.classList.add('active');
    mobileSidebarOverlay.classList.add('active');
    mobileMenuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    console.log('Sidebar opened');
  }

  function closeSidebar() {
    mobileSidebar.classList.remove('active');
    mobileSidebarOverlay.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    console.log('Sidebar closed');
  }

  // Event Listeners
  // Open sidebar when clicking hamburger menu
  mobileMenuToggle.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Hamburger menu clicked');
    openSidebar();
  });
  
  // Close sidebar when clicking close button
  if (sidebarClose) {
    sidebarClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeSidebar();
    });
  }
  
  // Close sidebar when clicking overlay
  mobileSidebarOverlay.addEventListener('click', function(e) {
    if (e.target === mobileSidebarOverlay) {
      closeSidebar();
    }
  });
  
  // Close sidebar when clicking on navigation links
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      closeSidebar();
      // Smooth scroll to section
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  // Close sidebar on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileSidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // Initialize aria attributes
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

// Initialize FAQ
function initializeFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  // FAQ Accordion
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      // Close all other FAQ items
      faqQuestions.forEach(otherQuestion => {
        if (otherQuestion !== question) {
          otherQuestion.setAttribute('aria-expanded', 'false');
          const otherAnswer = otherQuestion.nextElementSibling;
          if (otherAnswer) {
            otherAnswer.classList.remove('active');
          }
        }
      });
      
      // Toggle current FAQ item
      question.setAttribute('aria-expanded', !isExpanded);
      if (answer) {
        answer.classList.toggle('active');
      }
    });
  });
}

// Initialize Smooth Scrolling
function initializeSmoothScrolling() {
  // Smooth Scrolling for Navigation Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Initialize Scroll Reveal and Effects
function initializeScrollReveal() {
  // Header Scroll Effect
  const header = document.querySelector('.header');
  if (header) {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
      }
      
      lastScrollY = currentScrollY;
    });
  }

  // Scroll Reveal Animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  // Initialize scroll reveal elements
  const elementsToReveal = document.querySelectorAll('.benefit-card, .feature-item, .team-member, .faq-item');
  elementsToReveal.forEach(element => {
    element.classList.add('scroll-reveal');
    observer.observe(element);
  });

  // Also observe any existing scroll-reveal elements
  const existingScrollRevealElements = document.querySelectorAll('.scroll-reveal');
  existingScrollRevealElements.forEach(element => {
    observer.observe(element);
  });

  // Dashboard Chart Animation
  const chartBars = document.querySelectorAll('.chart-bar');
  if (chartBars.length > 0) {
    const animateCharts = () => {
      chartBars.forEach((bar, index) => {
        const heights = ['60%', '80%', '45%', '90%', '70%', '55%', '85%'];
        const height = heights[index % heights.length];
        
        setTimeout(() => {
          bar.style.setProperty('--height', height);
          bar.style.height = height;
        }, index * 100);
      });
    };
    
    // Animate charts when they come into view
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCharts();
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    const dashboardPreview = document.querySelector('.dashboard-preview');
    if (dashboardPreview) {
      chartObserver.observe(dashboardPreview);
    }
  }
}

// Form Validation (if forms are added later)
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (form) => {
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    const value = input.value.trim();
    
    if (!value) {
      showFieldError(input, 'Este campo é obrigatório');
      isValid = false;
    } else if (input.type === 'email' && !validateEmail(value)) {
      showFieldError(input, 'Por favor, insira um email válido');
      isValid = false;
    } else {
      clearFieldError(input);
    }
  });
  
  return isValid;
};

const showFieldError = (field, message) => {
  clearFieldError(field);
  
  field.classList.add('error');
  const errorElement = document.createElement('span');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  
  field.parentNode.appendChild(errorElement);
};

const clearFieldError = (field) => {
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
};

// Loading State Management
const showLoading = (element) => {
  element.classList.add('loading');
  element.disabled = true;
};

const hideLoading = (element) => {
  element.classList.remove('loading');
  element.disabled = false;
};

// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Performance Optimization
const optimizedScrollHandler = throttle(() => {
  // Scroll-based animations or effects can be added here
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

// Accessibility Enhancements
const handleKeyboardNavigation = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
};

const handleMouseNavigation = () => {
  document.body.classList.remove('keyboard-navigation');
};

document.addEventListener('keydown', handleKeyboardNavigation);
document.addEventListener('mousedown', handleMouseNavigation);

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.classList.add('fade-in-up');
  }
});

// Error Handling
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
  // You can add error reporting here
});

// Export functions for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail,
    validateForm,
    showLoading,
    hideLoading,
    debounce,
    throttle
  };
}