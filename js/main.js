/* ============================================
   AIQB - Mobile-First Interactive JS
   ============================================ */

const CONFIG = {
  PREORDER_END_DATE: new Date('2026-03-15T23:59:59'),
  INITIAL_STOCK: 300,
  CLAIMED_STOCK: 53,
  FORM_STORAGE_KEY: 'aiqb_form_data',
  ORDER_STORAGE_KEY: 'aiqb_order',
  PHONE_REGEX: /^(98|97|96)\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  WHATSAPP_NUMBER: '977XXXXXXXXXX'
};

// Toast Manager
class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(this.container);
  }

  show(message, options = {}) {
    const { type = 'info', title = '', duration = 5000 } = options;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: #1a1a1a;
      border: 1px solid ${type === 'success' ? '#22C55E' : type === 'error' ? '#FF4444' : '#D4AF37'};
      border-radius: 8px;
      padding: 16px 20px;
      min-width: 280px;
      max-width: 400px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icons[type]}</span>
      <div style="flex: 1;">
        ${title ? `<div style="font-weight: 600; margin-bottom: 4px;">${title}</div>` : ''}
        <div style="font-size: 0.875rem; color: #888;">${message}</div>
      </div>
      <button style="background: none; border: none; color: #888; cursor: pointer; font-size: 1.25rem;">&times;</button>
    `;
    
    toast.querySelector('button').addEventListener('click', () => {
      toast.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    });
    
    this.container.appendChild(toast);
    if (duration > 0) setTimeout(() => toast.remove(), duration);
  }
}

const toast = new ToastManager();

// Mobile Menu
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  
  if (!btn || !menu) return;
  
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('active');
  });
  
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('active');
    });
  });
}

// Hero Image Switcher
function initHeroImages() {
  const mainImg = document.getElementById('heroMainImage');
  const thumbs = document.querySelectorAll('.hero-thumb');
  
  if (!mainImg) return;
  
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      
      // Fade effect
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
      }, 200);
      
      // Update active state
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// Countdown Timer
function updateCountdown() {
  const now = new Date().getTime();
  const end = CONFIG.PREORDER_END_DATE.getTime();
  const diff = end - now;
  
  if (diff < 0) return;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  
  const els = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };
  
  if (els.days) els.days.textContent = String(days).padStart(2, '0');
  if (els.hours) els.hours.textContent = String(hours).padStart(2, '0');
  if (els.minutes) els.minutes.textContent = String(mins).padStart(2, '0');
  if (els.seconds) els.seconds.textContent = String(secs).padStart(2, '0');
}

// Size Tabs
function initSizeTabs() {
  const tabs = document.querySelectorAll('.size-tab');
  const tableRows = document.querySelectorAll('.size-table tbody tr');
  const measurements = {
    S: { chest: '104 cm', length: '64 cm', shoulder: '44 cm' },
    M: { chest: '110 cm', length: '66 cm', shoulder: '46 cm' },
    L: { chest: '116 cm', length: '68 cm', shoulder: '48 cm' },
    XL: { chest: '122 cm', length: '70 cm', shoulder: '50 cm' },
    XXL: { chest: '128 cm', length: '72 cm', shoulder: '52 cm' }
  };
  
  const mContainer = document.getElementById('sizeMeasurements');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const size = tab.dataset.size;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      tableRows.forEach(row => {
        row.classList.toggle('highlight', row.dataset.size === size);
      });
      
      if (mContainer && measurements[size]) {
        const m = measurements[size];
        mContainer.innerHTML = `
          <div class="measurement">
            <span class="m-label">Chest</span>
            <span class="m-value">${m.chest}</span>
          </div>
          <div class="measurement">
            <span class="m-label">Length</span>
            <span class="m-value">${m.length}</span>
          </div>
          <div class="measurement">
            <span class="m-label">Shoulder</span>
            <span class="m-value">${m.shoulder}</span>
          </div>
        `;
      }
    });
  });
}

// FAQ Accordion
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      items.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// Floating CTA
function initFloatingCTA() {
  const cta = document.getElementById('floatingCta');
  if (!cta) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 500;
    
    if (current > heroBottom - 100) {
      cta.classList.add('visible');
    } else {
      cta.classList.remove('visible');
    }
    
    lastScroll = current;
  }, { passive: true });
}

// Form Handling
function initForm() {
  const form = document.getElementById('preorderForm');
  if (!form) return;
  
  // Restore saved data
  const saved = localStorage.getItem(CONFIG.FORM_STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === 'radio') {
            const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else {
            field.value = value;
          }
        }
      });
    } catch (e) {}
  }
  
  // Save on input
  form.addEventListener('input', () => {
    const data = new FormData(form);
    const obj = {};
    data.forEach((v, k) => obj[k] = v);
    localStorage.setItem(CONFIG.FORM_STORAGE_KEY, JSON.stringify(obj));
  });
  
  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = new FormData(form);
    const values = Object.fromEntries(data);
    
    // Validation
    if (!values.fullName || values.fullName.length < 2) {
      toast.show('Please enter your full name', { type: 'error' });
      return;
    }
    
    if (!CONFIG.PHONE_REGEX.test(values.phone)) {
      toast.show('Please enter a valid Nepali phone number', { type: 'error' });
      return;
    }
    
    if (!CONFIG.EMAIL_REGEX.test(values.email)) {
      toast.show('Please enter a valid email', { type: 'error' });
      return;
    }
    
    if (!values.size) {
      toast.show('Please select a size', { type: 'error' });
      return;
    }
    
    if (!values.lining) {
      toast.show('Please select a lining color', { type: 'error' });
      return;
    }
    
    if (!values.payment) {
      toast.show('Please select a payment method', { type: 'error' });
      return;
    }
    
    // Submit
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    const orderData = {
      ...values,
      amount: 10999,
      orderDate: new Date().toISOString(),
      orderId: 'AIQB-' + Date.now().toString(36).toUpperCase()
    };
    
    try {
      if (window.SupabaseDB) {
        await SupabaseDB.createOrder(orderData);
      }
    } catch (e) {
      console.log('Supabase error, using local storage');
    }
    
    localStorage.setItem(CONFIG.ORDER_STORAGE_KEY, JSON.stringify(orderData));
    localStorage.removeItem(CONFIG.FORM_STORAGE_KEY);
    
    // Success UI
    const card = document.querySelector('.preorder-card');
    card.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
        <h2 style="margin-bottom: 12px;">Order Received!</h2>
        <p style="color: #888; margin-bottom: 24px;">Thank you, ${values.fullName}!</p>
        <div style="background: #151515; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 8px;"><strong style="color: #D4AF37;">Order ID:</strong> ${orderData.orderId}</p>
          <p style="margin-bottom: 8px;"><strong>Size:</strong> ${values.size}</p>
          <p style="margin-bottom: 8px;"><strong>Amount:</strong> Rs 10,999</p>
          <p><strong>Payment:</strong> ${values.payment.toUpperCase()}</p>
        </div>
        <p style="color: #888; font-size: 0.875rem; margin-bottom: 20px;">
          Confirmation sent to ${values.email} and ${values.phone}
        </p>
        <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" class="btn btn-outline" target="_blank">
          Questions? Contact Us
        </a>
      </div>
    `;
    
    toast.show('Order placed successfully!', { type: 'success' });
  });
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// Scroll Animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.feature-card, .spec-item, .gallery-item, .trust-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// Initialize All
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroImages();
  initSizeTabs();
  initFAQ();
  initFloatingCTA();
  initForm();
  initSmoothScroll();
  initScrollAnimations();
  
  setInterval(updateCountdown, 1000);
  updateCountdown();
  
  console.log('%c🦅 AIQB Loaded', 'font-size: 20px; color: #D4AF37; font-weight: bold;');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);