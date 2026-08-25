document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initForm();
  initGaleriaFilters();
  loadSiteData();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const errorMsg = document.querySelector('.form-error');
    const successMsg = document.querySelector('.form-success');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    if (errorMsg) errorMsg.classList.remove('show');
    const data = {
      nombre: form.nombre.value,
      email: form.email.value,
      telefono: form.telefono.value,
      asunto: form.asunto.value,
      mensaje: form.mensaje.value
    };
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        form.style.display = 'none';
        if (successMsg) successMsg.classList.add('show');
      } else {
        if (errorMsg) {
          errorMsg.textContent = result.error || 'Error al enviar.';
          errorMsg.classList.add('show');
        }
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Error de conexión. Intentá de nuevo.';
        errorMsg.classList.add('show');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar Mensaje';
    }
  });
}

function initGaleriaFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.galeria-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.opacity = '0';
          setTimeout(() => item.style.opacity = '1', 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

async function loadSiteData() {
  try {
    const res = await fetch('/api/site');
    const data = await res.json();
    updatePageContent(data);
  } catch (err) {}
}

function updatePageContent(data) {
  const d = data.dentista;
  document.querySelectorAll('[data-nombre]').forEach(el => el.textContent = d.nombre);
  document.querySelectorAll('[data-telefono]').forEach(el => el.textContent = d.telefono);
  document.querySelectorAll('[data-email]').forEach(el => el.textContent = d.email);
  document.querySelectorAll('[data-direccion]').forEach(el => el.textContent = d.direccion);
  document.querySelectorAll('[data-ciudad]').forEach(el => el.textContent = d.ciudad);
  if (d.whatsapp) {
    document.querySelectorAll('.whatsapp-fab').forEach(el => {
      el.href = `https://wa.me/${d.whatsapp}`;
    });
    document.querySelectorAll('[data-whatsapp]').forEach(el => {
      el.href = `https://wa.me/${d.whatsapp}?text=${encodeURIComponent(el.dataset.whatsapp || 'Hola, quiero una consulta')}`;
    });
  }
}
