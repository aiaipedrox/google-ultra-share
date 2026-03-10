// Current group for checkout
var currentGroup = null;

document.addEventListener('DOMContentLoaded', function () {
      initNavbar();
      renderGroups();
      updateHeroCard();
      renderFAQ();
      initScrollAnimations();
      initSmoothScroll();
});

function updateHeroCard() {
      fetch('/api/groups.php')
            .then(function (r) { return r.json(); })
            .then(function (groups) {
                  var totalFilled = 0, totalSlots = 0;
                  groups.forEach(function (g) { totalFilled += g.filledSlots; totalSlots += g.totalSlots; });
                  var free = totalSlots - totalFilled;
                  var slotsDiv = document.getElementById('hero-slots-visual');
                  var slotsText = document.getElementById('hero-slots-text');
                  if (slotsDiv && totalSlots > 0) {
                        var dots = '';
                        var show = Math.min(totalSlots, 6);
                        var filledShow = Math.round((totalFilled / totalSlots) * show);
                        for (var i = 0; i < show; i++) {
                              dots += '<div class="slot-dot ' + (i < filledShow ? 'filled' : 'empty') + '"></div>';
                        }
                        slotsDiv.innerHTML = dots;
                  }
                  if (slotsText) {
                        if (totalSlots === 0) {
                              slotsText.innerHTML = 'Cadastre grupos no admin';
                        } else {
                              slotsText.innerHTML = totalFilled + '/' + totalSlots + ' membros &mdash; <strong>' + free + ' vaga' + (free !== 1 ? 's' : '') + ' livre' + (free !== 1 ? 's' : '') + '</strong>';
                        }
                  }
            }).catch(function () { });
}

function initNavbar() {
      var toggle = document.getElementById('menu-toggle');
      var links = document.getElementById('nav-links');
      if (toggle && links) {
            toggle.addEventListener('click', function () { links.classList.toggle('active'); });
            links.querySelectorAll('a').forEach(function (link) {
                  link.addEventListener('click', function () { links.classList.remove('active'); });
            });
      }
      window.addEventListener('scroll', function () {
            var navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) { navbar.style.boxShadow = '0 1px 10px rgba(0,0,0,0.06)'; }
            else { navbar.style.boxShadow = 'none'; }
      });
}

// ===== GROUPS (from API) =====
function renderGroups() {
      var grid = document.getElementById('groups-grid');
      if (!grid) return;

      fetch('/api/groups.php')
            .then(function (r) { return r.json(); })
            .then(function (groups) {
                  if (!groups || groups.length === 0) {
                        grid.innerHTML = '<p style="text-align:center;color:#5F6368;padding:40px;">Nenhum grupo disponivel no momento.</p>';
                        return;
                  }
                  var sorted = groups.slice().sort(function (a, b) {
                        if (a.status === 'full' && b.status !== 'full') return 1;
                        if (a.status !== 'full' && b.status === 'full') return -1;
                        return 0;
                  });
                  grid.innerHTML = sorted.map(createGroupCard).join('');
                  initScrollAnimations();
            })
            .catch(function () {
                  // Fallback to data.js if API unavailable
                  if (typeof GROUPS !== 'undefined') {
                        grid.innerHTML = GROUPS.map(createGroupCard).join('');
                  }
            });
}

function createGroupCard(group) {
      var available = group.totalSlots - group.filledSlots;
      var isFull = group.status === 'full';
      var price = group.price || 129.90;

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

      var photoHtml = group.photo
            ? '<img src="' + group.photo + '" alt="' + (group.name || group.id) + '" class="plan-photo">'
            : '<div class="plan-icon">G</div>';

      return '<div class="group-card animate-on-scroll">' +
            '<div class="group-card-header">' +
            '<span class="group-id">' + group.id + '</span>' +
            '<span class="group-status ' + statusClass[group.status] + '">' + statusLabels[group.status] + '</span>' +
            '</div>' +
            '<div class="group-card-plan">' + photoHtml +
            '<div class="plan-info"><h4>' + (group.name || 'Google One AI Premium') + '</h4>' +
            '<span>2TB &middot; Gemini &middot; Flow &middot; VPN</span></div>' +
            '</div>' +
            '<div class="group-card-slots"><div class="slots-bar">' + slots + '</div>' +
            '<span class="slots-text">' + slotsText + '</span></div>' +
            '<div class="group-card-footer">' +
            '<div class="group-price">R$ ' + price.toFixed(2).replace('.', ',') + ' <span>/mes</span></div>' +
            footerBtn + '</div></div>';
}

// ===== CHECKOUT =====
function openCheckout(groupId) {
      fetch('/api/groups.php')
            .then(function (r) { return r.json(); })
            .then(function (groups) {
                  var g = groups.find(function (x) { return x.id === groupId; });
                  currentGroup = g ? { id: g.id, name: g.name, paymentLink: g.link, price: g.price } : { id: groupId, paymentLink: '' };
                  showCheckoutModal();
            })
            .catch(function () {
                  currentGroup = { id: groupId, paymentLink: '' };
                  showCheckoutModal();
            });
}

function showCheckoutModal() {
      showCheckoutStep(1);
      document.getElementById('modal-group-name').textContent = currentGroup.name || currentGroup.id;
      document.getElementById('checkout-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
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
            if (dot) dot.className = 'step-dot' + (i === step ? ' active' : (i < step ? ' done' : ''));
      }
}

function goToStep2() {
      var phone = document.getElementById('lead-phone').value.trim();
      var email = document.getElementById('lead-email').value.trim();
      if (!phone || !email) { document.getElementById('step1-error').style.display = 'block'; return; }
      document.getElementById('step1-error').style.display = 'none';

      document.getElementById('summary-group').textContent = currentGroup ? (currentGroup.name || currentGroup.id) : '';
      document.getElementById('summary-phone').textContent = '+55 ' + phone;
      document.getElementById('summary-email').textContent = email;
      var payLink = (currentGroup && currentGroup.paymentLink) ? currentGroup.paymentLink : 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra';
      document.getElementById('payment-link-btn').href = payLink;
      showCheckoutStep(2);
}

function backToStep1() { showCheckoutStep(1); }

function saveLeadBeforePayment() {
      var name = document.getElementById('lead-name').value.trim();
      var phone = document.getElementById('lead-phone').value.trim();
      var email = document.getElementById('lead-email').value.trim();
      var groupId = currentGroup ? currentGroup.id : '';
      var groupName = currentGroup ? (currentGroup.name || currentGroup.id) : '';

      // Save lead + order via API
      fetch('/api/leads.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone, email: email, group: groupId })
      }).catch(function () { });

      fetch('/api/orders.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone, email: email, group: groupId, groupName: groupName, days: 30 })
      }).catch(function () { });

      // Save email for conta.html
      localStorage.setItem('rateios_user_email', email);
      localStorage.setItem('rateios_user_name', name);

      document.getElementById('confirm-phone').textContent = '+55 ' + phone;
      setTimeout(function () { 
            showCheckoutStep(3); 
            var msg = encodeURIComponent("Acabei de fazer o pedido já está com status pago só liberar ele por e-mail ou pelo site mesmo");
            window.location.href = "https://wa.me/5500000000000?text=" + msg;
      }, 800);
}

// ===== FAQ =====
function renderFAQ() {
      var list = document.getElementById('faq-list');
      if (!list || typeof FAQS === 'undefined') return;
      list.innerHTML = FAQS.map(function (faq, i) {
            return '<div class="faq-item"><button class="faq-question" onclick="toggleFAQ(' + i + ')"><span>' + faq.question + '</span>' +
                  '<span class="faq-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></span></button>' +
                  '<div class="faq-answer"><p class="faq-answer-inner">' + faq.answer + '</p></div></div>';
      }).join('');
}

function toggleFAQ(index) {
      document.querySelectorAll('.faq-item').forEach(function (item, i) {
            if (i === index) item.classList.toggle('active');
            else item.classList.remove('active');
      });
}

function initScrollAnimations() {
      var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
            });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      document.querySelectorAll('.animate-on-scroll').forEach(function (el) { observer.observe(el); });
}

function initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                  var id = link.getAttribute('href');
                  if (!id || id === '#') return;
                  var target = document.querySelector(id);
                  if (target) { e.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
            });
      });
}
