// Landing Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initializeMobileMenu();
  initializeFAQ();
  initializeScrollReveal();
  initializeSmoothScrolling();
  initializeHeroAnimation();
  initializeCopyright();
  initializeAccessibility();
});

function initializeMobileMenu() {
  const elements = {
    toggle: document.querySelector('.mobile-menu-toggle'),
    sidebar: document.querySelector('.mobile-sidebar'),
    overlay: document.querySelector('.mobile-sidebar-overlay'),
    close: document.querySelector('.sidebar-close'),
    links: document.querySelectorAll('.sidebar-link')
  };

  if (!elements.toggle || !elements.sidebar || !elements.overlay) return;

  const toggleSidebar = (isOpen) => {
    const action = isOpen ? 'add' : 'remove';
    elements.sidebar.classList[action]('active');
    elements.overlay.classList[action]('active');
    elements.toggle.classList[action]('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    elements.toggle.setAttribute('aria-expanded', isOpen);
  };

  const closeSidebar = () => toggleSidebar(false);
  const openSidebar = () => toggleSidebar(true);

  elements.toggle.addEventListener('click', (e) => {
    e.preventDefault();
    openSidebar();
  });

  elements.close?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSidebar();
  });

  elements.overlay.addEventListener('click', (e) => {
    if (e.target === elements.overlay) closeSidebar();
  });

  elements.links.forEach(link => {
    link.addEventListener('click', (e) => {
      closeSidebar();
      const targetId = link.getAttribute('href');
      if (targetId?.startsWith('#')) {
        e.preventDefault();
        scrollToElement(targetId);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  elements.toggle.setAttribute('aria-expanded', 'false');
}

function initializeFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      faqQuestions.forEach(otherQuestion => {
        if (otherQuestion !== question) {
          otherQuestion.setAttribute('aria-expanded', 'false');
          otherQuestion.nextElementSibling?.classList.remove('active');
        }
      });
      
      question.setAttribute('aria-expanded', !isExpanded);
      answer?.classList.toggle('active');
    });
  });
}

function scrollToElement(targetId) {
  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    const targetPosition = targetElement.offsetTop - headerHeight;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }
}

function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToElement(link.getAttribute('href'));
    });
  });
}

function initializeScrollReveal() {
  initializeHeaderScrollEffect();
  initializeScrollRevealAnimation();
  initializeChartAnimation();
}

function initializeHeaderScrollEffect() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  const scrollHandler = throttle(() => {
    const scrollY = window.scrollY;
    const isScrolled = scrollY > 100;
    
    header.style.background = isScrolled 
      ? 'rgba(255, 255, 255, 0.98)' 
      : 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = isScrolled 
      ? '0 2px 20px rgba(0, 0, 0, 0.1)' 
      : 'none';
  }, 16);
  
  window.addEventListener('scroll', scrollHandler);
}

function initializeScrollRevealAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const elementsToReveal = document.querySelectorAll('.benefit-card, .feature-item, .team-member, .faq-item, .scroll-reveal');
  elementsToReveal.forEach(element => {
    element.classList.add('scroll-reveal');
    observer.observe(element);
  });
}

function initializeChartAnimation() {
  const chartBars = document.querySelectorAll('.chart-bar');
  const dashboardPreview = document.querySelector('.dashboard-preview');
  
  if (!chartBars.length || !dashboardPreview) return;

  const animateCharts = () => {
    const heights = ['60%', '80%', '45%', '90%', '70%', '55%', '85%'];
    chartBars.forEach((bar, index) => {
      setTimeout(() => {
        const height = heights[index % heights.length];
        bar.style.setProperty('--height', height);
        bar.style.height = height;
      }, index * 100);
    });
  };

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCharts();
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  chartObserver.observe(dashboardPreview);
}

function initializeHeroAnimation() {
  const heroSection = document.querySelector('.hero');
  heroSection?.classList.add('fade-in-up');
}



const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

function initializeAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

function initializeCopyright() {
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
}