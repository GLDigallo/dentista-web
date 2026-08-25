document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initForm();
  initGaleriaFilters();
  initTestimoniosCarousel();
  loadSiteData();
  window.addEventListener('resize', resizeTestimoniosCarousel);
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

let testimoniosIndex = 0;

function resizeTestimoniosCarousel() {
  const track = document.getElementById('testimonios-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonio-card');
  const totalSlides = getTestimoniosTotalSlides(cards);
  testimoniosIndex = 0;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => {
      testimoniosIndex = i;
      updateTestimoniosTrack(track, cards, dotsContainer);
    });
    dotsContainer.appendChild(dot);
  }
  track.style.transform = 'translateX(0)';
}

function initTestimoniosCarousel() {
  const track = document.getElementById('testimonios-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !dotsContainer) return;
  const cards = track.querySelectorAll('.testimonio-card');
  const totalSlides = getTestimoniosTotalSlides(cards);
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => {
      testimoniosIndex = i;
      updateTestimoniosTrack(track, cards, dotsContainer);
    });
    dotsContainer.appendChild(dot);
  }
}

function getTestimoniosTotalSlides(cards) {
  if (!cards.length) return 1;
  const containerWidth = cards[0].parentElement.parentElement.offsetWidth;
  const cardWidth = cards[0].offsetWidth + 24;
  const visible = Math.floor(containerWidth / cardWidth) || 1;
  return Math.ceil(cards.length / visible) || 1;
}

function moveTestimonios(dir) {
  const track = document.getElementById('testimonios-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonio-card');
  const total = getTestimoniosTotalSlides(cards);
  testimoniosIndex = (testimoniosIndex + dir + total) % total;
  updateTestimoniosTrack(track, cards, dotsContainer);
}

function updateTestimoniosTrack(track, cards, dotsContainer) {
  if (!cards.length) return;
  const containerWidth = track.parentElement.offsetWidth;
  const cardWidth = cards[0].offsetWidth + 24;
  const visible = Math.floor(containerWidth / cardWidth) || 1;
  const maxIndex = Math.ceil(cards.length / visible) - 1;
  if (testimoniosIndex > maxIndex) testimoniosIndex = 0;
  if (testimoniosIndex < 0) testimoniosIndex = maxIndex;
  const offset = testimoniosIndex * visible * cardWidth;
  track.style.transform = `translateX(-${offset}px)`;
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === testimoniosIndex);
    });
  }
}

// Services horizontal scroll
function scrollServicios(dir) {
  const scroll = document.querySelector('.servicios-scroll');
  if (!scroll) return;
  const cardWidth = 340 + 24;
  scroll.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
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
