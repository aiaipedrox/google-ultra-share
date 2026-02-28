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

// ===== GROUPS (reads from admin localStorage) =====
function getAdminGroups() {
      try {
            var d = JSON.parse(localStorage.getItem('admin_groups'));
            return d || null;
      } catch (e) { return null; }
}

function getAdminMembers() {
      try {
            var d = JSON.parse(localStorage.getItem('admin_members'));
            return d || [];
      } catch (e) { return []; }
}

function renderGroups() {
      var grid = document.getElementById('groups-grid');
      if (!grid) return;

      // Try admin groups first, fallback to GROUPS from data.js
      var adminGroups = getAdminGroups();
      var members = getAdminMembers();

      var groups;
      if (adminGroups && adminGroups.length > 0) {
            // Convert admin format to display format
            groups = adminGroups.map(function (g) {
                  var activeMembers = members.filter(function (m) {
                        return m.group === g.id && m.status === 'ativo';
                  }).length;
                  var free = g.totalSlots - activeMembers;
                  var status = free <= 0 ? 'full' : (free <= 1 ? 'almost' : 'open');
                  return {
                        id: g.id,
                        name: g.name || g.id,
                        filledSlots: activeMembers,
                        totalSlots: g.totalSlots,
                        status: status,
                        paymentLink: g.link || 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra',
                        photo: g.photo || null,
                        price: g.price || 101.50
                  };
            });
      } else if (typeof GROUPS !== 'undefined') {
            groups = GROUPS;
      } else {
            grid.innerHTML = '<p style="text-align:center;color:#5F6368;padding:40px;">Nenhum grupo cadastrado. Acesse o painel admin para criar grupos.</p>';
            return;
      }

      // Sort: full groups last
      var sorted = groups.slice().sort(function (a, b) {
            if (a.status === 'full' && b.status !== 'full') return 1;
            if (a.status !== 'full' && b.status === 'full') return -1;
            return 0;
      });

      grid.innerHTML = sorted.map(createGroupCard).join('');
}

function createGroupCard(group) {
      var available = group.totalSlots - group.filledSlots;
      var isFull = group.status === 'full';
      var price = group.price || 101.50;

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

      // Photo or default icon
      var photoHtml = group.photo
            ? '<img src="' + group.photo + '" alt="' + (group.name || group.id) + '" class="plan-photo">'
            : '<div class="plan-icon">G</div>';

      var groupName = group.name || 'Google One AI Premium';

      return '<div class="group-card animate-on-scroll">' +
            '<div class="group-card-header">' +
            '<span class="group-id">' + group.id + '</span>' +
            '<span class="group-status ' + statusClass[group.status] + '">' + statusLabels[group.status] + '</span>' +
            '</div>' +
            '<div class="group-card-plan">' +
            photoHtml +
            '<div class="plan-info">' +
            '<h4>' + groupName + '</h4>' +
            '<span>2TB &middot; Gemini &middot; Flow &middot; VPN</span>' +
            '</div>' +
            '</div>' +
            '<div class="group-card-slots">' +
            '<div class="slots-bar">' + slots + '</div>' +
            '<span class="slots-text">' + slotsText + '</span>' +
            '</div>' +
            '<div class="group-card-footer">' +
            '<div class="group-price">R$ ' + price.toFixed(2).replace('.', ',') + ' <span>/mes</span></div>' +
            footerBtn +
            '</div>' +
            '</div>';
}

// ===== CHECKOUT FLOW =====
function openCheckout(groupId) {
      // Find group from admin data or fallback
      var adminGroups = getAdminGroups();
      var members = getAdminMembers();

      if (adminGroups) {
            var ag = adminGroups.find(function (g) { return g.id === groupId; });
            if (ag) {
                  currentGroup = {
                        id: ag.id,
                        name: ag.name,
                        paymentLink: ag.link || 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra',
                        price: ag.price || 101.50
                  };
            }
      }
      if (!currentGroup) {
            currentGroup = (typeof GROUPS !== 'undefined')
                  ? GROUPS.find(function (g) { return g.id === groupId; }) || { id: groupId, paymentLink: '' }
                  : { id: groupId, paymentLink: '' };
      }

      // Reset to step 1
      showCheckoutStep(1);
      document.getElementById('modal-group-name').textContent = currentGroup.name || groupId;
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
      currentGroup = null;
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
      document.getElementById('summary-group').textContent = currentGroup ? (currentGroup.name || currentGroup.id) : '';
      document.getElementById('summary-phone').textContent = '+55 ' + phone;
      document.getElementById('summary-email').textContent = email;

      // Set payment link
      var payLink = (currentGroup && currentGroup.paymentLink && currentGroup.paymentLink !== '#checkout')
            ? currentGroup.paymentLink
            : 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra';
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
