// Current group for checkout
var currentGroup = null;

document.addEventListener('DOMContentLoaded', function () {
      initNavbar();
      renderGroups();
      renderFAQ();
      initScrollAnimations();
      initSmoothScroll();
});

function initNavbar() {
      var toggle = document.getElementById('menu-toggle');
      var links = document.getElementById('nav-links');
      if (toggle && links) {
            toggle.addEventListener('click', function () {
                  links.classList.toggle('active');
            });
            links.querySelectorAll('a').forEach(function (link) {
                  link.addEventListener('click', function () {
                        links.classList.remove('active');
                  });
            });
      }
      window.addEventListener('scroll', function () {
            var navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                  navbar.style.boxShadow = '0 1px 10px rgba(0,0,0,0.06)';
            } else {
                  navbar.style.boxShadow = 'none';
            }
      });
}

// ===== GROUPS =====
function renderGroups() {
      var grid = document.getElementById('groups-grid');
      if (!grid) return;

      var sorted = GROUPS.slice().sort(function (a, b) {
            if (a.status === 'full' && b.status !== 'full') return 1;
            if (a.status !== 'full' && b.status === 'full') return -1;
            return 0;
      });

      grid.innerHTML = sorted.map(createGroupCard).join('');
}

function createGroupCard(group) {
      var available = group.totalSlots - group.filledSlots;
      var isFull = group.status === 'full';

      var statusLabels = { open: 'Vagas abertas', almost: 'Quase lotado', full: 'Lotado' };
      var statusClass = { open: 'status-open', almost: 'status-almost', full: 'status-full' };

      var slots = '';
      for (var i = 0; i < group.totalSlots; i++) {
            slots += '<div class="slot' + (i < group.filledSlots ? ' filled' : '') + '"></div>';
      }

      var slotsText = isFull
            ? 'Grupo completo'
            : '<strong>' + group.filledSlots + '/' + group.totalSlots + '</strong> &mdash; ' + available + ' vaga' + (available !== 1 ? 's' : '') + ' livre' + (available !== 1 ? 's' : '');

      var footerBtn = isFull
            ? '<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5;cursor:not-allowed;">Lotado</button>'
            : '<button class="btn btn-sm btn-google" onclick="openCheckout(\'' + group.id + '\')">Entrar</button>';

      return '<div class="group-card animate-on-scroll">' +
            '<div class="group-card-header">' +
            '<span class="group-id">' + group.id + '</span>' +
            '<span class="group-status ' + statusClass[group.status] + '">' + statusLabels[group.status] + '</span>' +
            '</div>' +
            '<div class="group-card-plan">' +
            '<div class="plan-icon">G</div>' +
            '<div class="plan-info">' +
            '<h4>Google One AI Premium</h4>' +
            '<span>2TB &middot; Gemini &middot; Flow &middot; VPN</span>' +
            '</div>' +
            '</div>' +
            '<div class="group-card-slots">' +
            '<div class="slots-bar">' + slots + '</div>' +
            '<span class="slots-text">' + slotsText + '</span>' +
            '</div>' +
            '<div class="group-card-footer">' +
            '<div class="group-price">R$ 101,50 <span>/mes</span></div>' +
            footerBtn +
            '</div>' +
            '</div>';
}

// ===== CHECKOUT FLOW =====
function openCheckout(groupId) {
      currentGroup = GROUPS.find(function (g) { return g.id === groupId; }) || { id: groupId, paymentLink: '' };

      // Reset to step 1
      showCheckoutStep(1);
      document.getElementById('modal-group-name').textContent = groupId;
      document.getElementById('checkout-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Clear fields
      document.getElementById('lead-name').value = '';
      document.getElementById('lead-phone').value = '';
      document.getElementById('lead-email').value = '';
      document.getElementById('step1-error').style.display = 'none';
}

function closeCheckout() {
      document.getElementById('checkout-modal').style.display = 'none';
      document.body.style.overflow = '';
}

function showCheckoutStep(step) {
      for (var i = 1; i <= 3; i++) {
            var el = document.getElementById('step-' + i);
            if (el) el.style.display = i === step ? 'block' : 'none';
            var dot = document.getElementById('dot-' + i);
            if (dot) {
                  dot.className = 'step-dot' + (i === step ? ' active' : (i < step ? ' done' : ''));
            }
      }
}

function goToStep2() {
      var phone = document.getElementById('lead-phone').value.trim();
      var email = document.getElementById('lead-email').value.trim();
      var errEl = document.getElementById('step1-error');

      if (!phone || !email) {
            errEl.style.display = 'block';
            return;
      }
      errEl.style.display = 'none';

      // Fill summary
      document.getElementById('summary-group').textContent = currentGroup ? currentGroup.id : '';
      document.getElementById('summary-phone').textContent = '+55 ' + phone;
      document.getElementById('summary-email').textContent = email;

      // Set payment link
      var payLink = (currentGroup && currentGroup.paymentLink && currentGroup.paymentLink !== '#checkout')
            ? currentGroup.paymentLink
            : 'https://app.diasmarketplace.com.br'; // fallback
      document.getElementById('payment-link-btn').href = payLink;

      showCheckoutStep(2);
}

function backToStep1() {
      showCheckoutStep(1);
}

function saveLeadAndRedirect() {
      var name = document.getElementById('lead-name').value.trim();
      var phone = document.getElementById('lead-phone').value.trim();
      var email = document.getElementById('lead-email').value.trim();
      var groupId = currentGroup ? currentGroup.id : '';

      // Save lead to localStorage
      var leads = JSON.parse(localStorage.getItem('rateios_leads') || '[]');
      leads.push({
            name: name,
            phone: phone,
            email: email,
            group: groupId,
            date: new Date().toISOString()
      });
      localStorage.setItem('rateios_leads', JSON.stringify(leads));

      // Update confirm screen
      document.getElementById('confirm-phone').textContent = '+55 ' + phone;

      // Show step 3 after a small delay
      setTimeout(function () {
            showCheckoutStep(3);
      }, 500);
}

// ===== FAQ =====
function renderFAQ() {
      var list = document.getElementById('faq-list');
      if (!list) return;
      list.innerHTML = FAQS.map(function (faq, i) {
            return '<div class="faq-item">' +
                  '<button class="faq-question" onclick="toggleFAQ(' + i + ')">' +
                  '<span>' + faq.question + '</span>' +
                  '<span class="faq-icon">' +
                  '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
                  '</span>' +
                  '</button>' +
                  '<div class="faq-answer">' +
                  '<p class="faq-answer-inner">' + faq.answer + '</p>' +
                  '</div>' +
                  '</div>';
      }).join('');
}

function toggleFAQ(index) {
      var items = document.querySelectorAll('.faq-item');
      items.forEach(function (item, i) {
            if (i === index) { item.classList.toggle('active'); }
            else { item.classList.remove('active'); }
      });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
      var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                  if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                  }
            });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
            observer.observe(el);
      });
}

function initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                  var id = link.getAttribute('href');
                  if (!id || id === '#') return;
                  var target = document.querySelector(id);
                  if (target) {
                        e.preventDefault();
                        var top = target.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                  }
            });
      });
}
