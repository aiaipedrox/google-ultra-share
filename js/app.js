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
      var statusDot = { open: 'o', almost: '!', full: 'x' };

      var slots = '';
      for (var i = 0; i < group.totalSlots; i++) {
            slots += '<div class="slot' + (i < group.filledSlots ? ' filled' : '') + '"></div>';
      }

      var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE(group.id));

      var slotsText = isFull
            ? 'Grupo completo'
            : '<strong>' + group.filledSlots + '/' + group.totalSlots + '</strong> membros &mdash; ' + available + ' vaga' + (available > 1 ? 's' : '') + ' livre' + (available > 1 ? 's' : '');

      var footerBtn = isFull
            ? '<button class="btn btn-sm btn-secondary" disabled>Lotado</button>'
            : '<a href="' + whatsappUrl + '" class="btn btn-sm btn-google" onclick="handleJoinGroup(event, \'' + group.id + '\')">Entrar</a>';

      return '<div class="group-card animate-on-scroll">' +
            '<div class="group-card-header">' +
            '<span class="group-id">' + group.id + '</span>' +
            '<span class="group-status ' + statusClass[group.status] + '">' + statusLabels[group.status] + '</span>' +
            '</div>' +
            '<div class="group-card-plan">' +
            '<div class="plan-icon">G</div>' +
            '<div class="plan-info">' +
            '<h4>Google One AI Premium</h4>' +
            '<span>2 TB &middot; Gemini &middot; Flow &middot; VPN</span>' +
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

function handleJoinGroup(event, groupId) {
      event.preventDefault();
      var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE(groupId));
      showModal(
            'Entrar no grupo ' + groupId,
            '<div style="text-align:center;">' +
            '<p style="margin-bottom:16px;">Voce vai pagar <strong>R$ 101,50/mes</strong> para fazer parte deste grupo familiar do Google Ultra.</p>' +
            '<p style="margin-bottom:24px;font-size:0.9rem;color:#5F6368;">Apos o pagamento, envie seu <strong>e-mail Google</strong> via WhatsApp para receber o convite do grupo familiar.</p>' +
            '<a href="' + whatsappUrl + '" target="_blank" class="btn btn-google btn-block" style="margin-bottom:12px;">Pagar e enviar e-mail via WhatsApp</a>' +
            '<p style="font-size:0.75rem;color:#9AA0A6;">Pagamento seguro via Dias Marketplace</p>' +
            '</div>'
      );
}

function showModal(title, content) {
      var existing = document.querySelector('.modal-overlay');
      if (existing) existing.remove();

      var modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';

      var box = document.createElement('div');
      box.style.cssText = 'background:white;border-radius:20px;padding:32px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);';

      var header = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #F1F3F4;">' +
            '<h3 style="font-size:1.1rem;">' + title + '</h3>' +
            '<button onclick="closeModal()" style="width:32px;height:32px;border-radius:50%;border:none;background:#F1F3F4;cursor:pointer;font-size:16px;">x</button>' +
            '</div>';

      box.innerHTML = header + '<div>' + content + '</div>';
      modal.appendChild(box);
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';

      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
      });
}

function closeModal() {
      var modal = document.querySelector('.modal-overlay');
      if (modal) { modal.remove(); document.body.style.overflow = ''; }
}

function renderFAQ() {
      var list = document.getElementById('faq-list');
      if (!list) return;
      list.innerHTML = FAQS.map(function (faq, i) {
            return '<div class="faq-item">' +
                  '<button class="faq-question" onclick="toggleFAQ(' + i + ')">' +
                  '<span>' + faq.question + '</span>' +
                  '<span class="icon">+</span>' +
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
                  if (id === '#' || id === '#checkout') return;
                  e.preventDefault();
                  var target = document.querySelector(id);
                  if (target) {
                        var top = target.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                  }
            });
      });
}
