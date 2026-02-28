// ===== ADMIN PANEL =====
var ADMIN_PASSWORD = 'rateios2026'; // ALTERE ESTA SENHA

// Admin state
var adminGroups = JSON.parse(localStorage.getItem('admin_groups') || 'null') || GROUPS.map(function (g) {
    return Object.assign({}, g, { name: g.id, photo: '', paymentLink: g.paymentLink || '', members: [] });
});

var adminMembers = JSON.parse(localStorage.getItem('admin_members') || '[]') || [
    { name: 'Pedro Silva', email: 'pedro@gmail.com', group: 'GRP-001', status: 'ativo', date: '2026-02-20' },
    { name: 'Ana Costa', email: 'ana@gmail.com', group: 'GRP-002', status: 'ativo', date: '2026-02-15' },
    { name: 'Lucas R.', email: 'lucas@gmail.com', group: 'GRP-003', status: 'ativo', date: '2026-02-25' },
    { name: 'Maria S.', email: 'maria@gmail.com', group: 'GRP-004', status: 'ativo', date: '2026-02-10' },
    { name: 'Joao P.', email: 'joao@gmail.com', group: 'GRP-005', status: 'pendente', date: '2026-02-27' }
];

var adminPayments = [
    { id: '#PAY-001', member: 'Pedro Silva', group: 'GRP-001', value: 'R$ 101,50', method: 'Pix', status: 'pago', date: '2026-02-20' },
    { id: '#PAY-002', member: 'Ana Costa', group: 'GRP-002', value: 'R$ 101,50', method: 'Cartao', status: 'pago', date: '2026-02-15' },
    { id: '#PAY-003', member: 'Lucas R.', group: 'GRP-003', value: 'R$ 101,50', method: 'Pix', status: 'pago', date: '2026-02-25' },
    { id: '#PAY-004', member: 'Joao P.', group: 'GRP-005', value: 'R$ 101,50', method: 'Pix', status: 'pendente', date: '2026-02-27' }
];

function saveGroups() {
    localStorage.setItem('admin_groups', JSON.stringify(adminGroups));
}
function saveMembers() {
    localStorage.setItem('admin_members', JSON.stringify(adminMembers));
}

// ===== AUTH =====
function loginAdmin() {
    var pwd = document.getElementById('admin-password').value;
    if (pwd === ADMIN_PASSWORD) {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        renderDashboard();
        renderGroupsTable();
        renderMembersTable();
        renderPaymentsTable();
        renderWhatsAppLinks();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logoutAdmin() {
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// ===== NAVIGATION =====
function showSection(name) {
    var sections = document.querySelectorAll('.admin-section');
    sections.forEach(function (s) { s.style.display = 'none'; });

    var el = document.getElementById('section-' + name);
    if (el) el.style.display = 'block';

    var navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(function (item) { item.classList.remove('active'); });
    event.currentTarget && event.currentTarget.classList.add('active');

    var titles = {
        dashboard: ['Dashboard', 'Visao geral dos grupos e receita'],
        grupos: ['Grupos', 'Gerencie os grupos disponiveis'],
        membros: ['Membros', 'Todos os membros cadastrados'],
        pagamentos: ['Pagamentos', 'Historico de transacoes'],
        whatsapp: ['WhatsApp', 'Links de notificacao automatica']
    };
    if (titles[name]) {
        document.getElementById('page-title').textContent = titles[name][0];
        document.getElementById('page-sub').textContent = titles[name][1];
    }
}

// ===== DASHBOARD =====
function renderDashboard() {
    var totalMembers = adminGroups.reduce(function (sum, g) { return sum + g.filledSlots; }, 0);
    var totalSlots = adminGroups.reduce(function (sum, g) { return sum + (g.totalSlots - g.filledSlots); }, 0);
    var totalRevenue = totalMembers * 101.50;

    var statGrupos = document.getElementById('stat-grupos');
    var statMembros = document.getElementById('stat-membros');
    var statReceita = document.getElementById('stat-receita');
    var statVagas = document.getElementById('stat-vagas');

    if (statGrupos) statGrupos.textContent = adminGroups.length;
    if (statMembros) statMembros.textContent = totalMembers;
    if (statReceita) statReceita.textContent = 'R$ ' + totalRevenue.toFixed(2).replace('.', ',');
    if (statVagas) statVagas.textContent = totalSlots;

    var list = document.getElementById('dashboard-groups-list');
    if (!list) return;
    list.innerHTML = '<table class="admin-table">' +
        '<thead><tr><th>Grupo</th><th>Vagas</th><th>Ocupacao</th><th>Status</th><th>Link Pgto</th></tr></thead>' +
        '<tbody>' +
        adminGroups.map(function (g) {
            var pct = Math.round((g.filledSlots / g.totalSlots) * 100);
            return '<tr>' +
                '<td><div style="display:flex;align-items:center;gap:12px;">' +
                (g.photo ? '<img src="' + g.photo + '" style="width:36px;height:36px;border-radius:10px;object-fit:cover;">' : '<div class="group-avatar">' + (g.name || g.id).charAt(g.id.length - 1) + '</div>') +
                '<div><strong>' + (g.name || g.id) + '</strong></div>' +
                '</div></td>' +
                '<td>' + g.filledSlots + '/' + g.totalSlots + '</td>' +
                '<td><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                '<span style="font-size:0.75rem;color:#5F6368;">' + pct + '%</span></td>' +
                '<td><span class="badge ' + (g.status === 'full' ? 'badge-red' : g.status === 'almost' ? 'badge-yellow' : 'badge-green') + '">' +
                (g.status === 'full' ? 'Lotado' : g.status === 'almost' ? 'Quase cheio' : 'Aberto') + '</span></td>' +
                '<td>' + (g.paymentLink && g.paymentLink !== '#checkout' ? '<a href="' + g.paymentLink + '" target="_blank" class="action-btn primary">Ver link</a>' : '<span style="color:#9AA0A6;font-size:0.8rem;">Nao definido</span>') + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody></table>';
}

// ===== GROUPS TABLE =====
function renderGroupsTable() {
    var el = document.getElementById('admin-groups-table');
    if (!el) return;
    el.innerHTML = '<table class="admin-table">' +
        '<thead><tr><th>Grupo</th><th>Vagas</th><th>Status</th><th>Link de Pagamento</th><th>Foto</th><th>Acoes</th></tr></thead>' +
        '<tbody>' +
        adminGroups.map(function (g, i) {
            return '<tr>' +
                '<td><strong>' + (g.name || g.id) + '</strong></td>' +
                '<td>' + g.filledSlots + '/' + g.totalSlots + '</td>' +
                '<td><span class="badge ' + (g.status === 'full' ? 'badge-red' : g.status === 'almost' ? 'badge-yellow' : 'badge-green') + '">' + g.status + '</span></td>' +
                '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">' +
                '<input value="' + (g.paymentLink || '') + '" class="form-input" style="font-size:0.8rem;padding:6px 10px;" onchange="updateGroupLink(' + i + ', this.value)" placeholder="Cole o link do Dias...">' +
                '</td>' +
                '<td>' +
                '<input value="' + (g.photo || '') + '" class="form-input" style="font-size:0.8rem;padding:6px 10px;" onchange="updateGroupPhoto(' + i + ', this.value)" placeholder="URL da foto...">' +
                '</td>' +
                '<td style="white-space:nowrap;">' +
                '<button class="action-btn primary" style="margin-right:6px;" onclick="addSlot(' + i + ')">+Vaga</button>' +
                '<button class="action-btn danger" onclick="removeGroup(' + i + ')">Remover</button>' +
                '</td>' +
                '</tr>';
        }).join('') +
        '</tbody></table>';
}

function updateGroupLink(index, value) {
    adminGroups[index].paymentLink = value;
    saveGroups();
}
function updateGroupPhoto(index, value) {
    adminGroups[index].photo = value;
    saveGroups();
}
function addSlot(index) {
    if (adminGroups[index].filledSlots < adminGroups[index].totalSlots) {
        adminGroups[index].filledSlots++;
        updateStatus(index);
        saveGroups();
        renderGroupsTable();
        renderDashboard();
    }
}
function updateStatus(index) {
    var g = adminGroups[index];
    var pct = g.filledSlots / g.totalSlots;
    if (pct >= 1) g.status = 'full';
    else if (pct >= 0.66) g.status = 'almost';
    else g.status = 'open';
}
function removeGroup(index) {
    if (confirm('Remover este grupo?')) {
        adminGroups.splice(index, 1);
        saveGroups();
        renderGroupsTable();
        renderDashboard();
    }
}
function openNewGroupModal() {
    document.getElementById('modal-novo-grupo').style.display = 'flex';
    showSection('grupos');
}
function closeNewGroupModal() {
    document.getElementById('modal-novo-grupo').style.display = 'none';
}
function createGroup() {
    var name = document.getElementById('new-group-name').value.trim();
    var link = document.getElementById('new-group-link').value.trim();
    var slots = parseInt(document.getElementById('new-group-slots').value);
    var photo = document.getElementById('new-group-photo').value.trim();
    if (!name) { alert('Digite um nome para o grupo.'); return; }
    adminGroups.push({ id: name, name: name, filledSlots: 0, totalSlots: slots, status: 'open', paymentLink: link, photo: photo });
    saveGroups();
    renderGroupsTable();
    renderDashboard();
    renderWhatsAppLinks();
    closeNewGroupModal();
}

// ===== MEMBERS TABLE =====
function renderMembersTable() {
    var el = document.getElementById('admin-members-table');
    if (!el) return;
    el.innerHTML = '<table class="admin-table">' +
        '<thead><tr><th>Nome</th><th>E-mail Google</th><th>Grupo</th><th>Status</th><th>Entrada</th></tr></thead>' +
        '<tbody>' +
        adminMembers.map(function (m) {
            return '<tr>' +
                '<td><strong>' + m.name + '</strong></td>' +
                '<td>' + m.email + '</td>' +
                '<td><span class="badge badge-blue">' + m.group + '</span></td>' +
                '<td><span class="badge ' + (m.status === 'ativo' ? 'badge-green' : 'badge-yellow') + '">' + m.status + '</span></td>' +
                '<td>' + m.date + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody></table>';
}

// ===== PAYMENTS TABLE =====
function renderPaymentsTable() {
    var el = document.getElementById('admin-payments-table');
    if (!el) return;
    el.innerHTML = '<table class="admin-table">' +
        '<thead><tr><th>ID</th><th>Membro</th><th>Grupo</th><th>Valor</th><th>Metodo</th><th>Status</th><th>Data</th></tr></thead>' +
        '<tbody>' +
        adminPayments.map(function (p) {
            return '<tr>' +
                '<td><code style="font-size:0.8rem;background:#F1F3F4;padding:2px 8px;border-radius:4px;">' + p.id + '</code></td>' +
                '<td>' + p.member + '</td>' +
                '<td><span class="badge badge-blue">' + p.group + '</span></td>' +
                '<td><strong>' + p.value + '</strong></td>' +
                '<td>' + p.method + '</td>' +
                '<td><span class="badge ' + (p.status === 'pago' ? 'badge-green' : 'badge-yellow') + '">' + p.status + '</span></td>' +
                '<td>' + p.date + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody></table>';
}

// ===== WHATSAPP LINKS =====
function renderWhatsAppLinks() {
    var el = document.getElementById('admin-whatsapp-links');
    if (!el) return;

    var html = '<div style="padding:16px 24px;background:#F8F9FA;border-bottom:1px solid #E8EAED;">' +
        '<p style="font-size:0.85rem;color:#5F6368;">Configure seu numero do WhatsApp em <code>js/data.js</code> na variavel <code>WHATSAPP_NUMBER</code>. Os links abaixo sao gerados automaticamente para cada grupo.</p>' +
        '</div>';

    adminGroups.forEach(function (g) {
        var msg = encodeURIComponent('Ola! Acabei de pagar minha vaga no grupo ' + (g.name || g.id) + ' do Google Ultra. Meu e-mail Google e: ');
        var link = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg;
        html += '<div class="whatsapp-link-item">' +
            '<span class="badge badge-green">' + (g.name || g.id) + '</span>' +
            '<a href="' + link + '" target="_blank" class="wa-link">' + link.substring(0, 60) + '...</a>' +
            '<button class="action-btn" onclick="copyToClipboard(\'' + link + '\')">Copiar</button>' +
            '</div>';
    });

    el.innerHTML = html;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        alert('Link copiado!');
    });
}

// Start
document.addEventListener('DOMContentLoaded', function () {
    // Auto-render for page load
});
