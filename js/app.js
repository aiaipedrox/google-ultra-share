document.addEventListener('DOMContentLoaded', () => {
      renderGroups();
      renderFAQ();
});

function renderGroups() {
      const grid = document.getElementById('groups-grid');
      if (!grid) return;
      grid.innerHTML = GROUPS.map(group => `
              <div class="group-card">
                          <h3>${group.id}</h3>
                                      <p>${group.filledSlots}/${group.totalSlots} membros</p>
                                                  <span class="group-status status-${group.status}">${group.status}</span>
                                                              <a href="https://wa.me/${WHATSAPP_NUMBER}?text=" + encodeURIComponent(group.id) class="btn">Entrar</a>
                                                                      </div>
                                                                          `).join('');
}

function renderFAQ() {
      const list = document.getElementById('faq-list');
      if (!list) return;
      list.innerHTML = FAQS.map(faq => `
              <div class="faq-item">
                          <button class="faq-question">${faq.question}</button>
                                      <div class="faq-answer">${faq.answer}</div>
                                              </div>
                                                  `).join('');
}
