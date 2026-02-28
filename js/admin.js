// ===== ADMIN PANEL =====
var ADMIN_PASSWORD = 'rateios2026';

// ===== DATA LAYER =====
function getData(key, fallback) {
    try { var d = JSON.parse(localStorage.getItem(key)); return d || fallback; }
    catch (e) { return fallback; }
}
function saveData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getGroups() {
    return getData('admin_groups', [
        { id: 'GRP-001', name: 'Familia Premium 01', totalSlots: 6, price: 101.50, link: 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra' },
        { id: 'GRP-002', name: 'Familia Premium 02', totalSlots: 6, price: 101.50, link: 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra' },
        { id: 'GRP-003', name: 'Familia Premium 03', totalSlots: 6, price: 101.50, link: 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra' }
    ]);
}
function saveGroups(g) { saveData('admin_groups', g); }

function getMembers() {
    return getData('admin_members', [
        { id: 'm1', name: 'Pedro Miranda', phone: '(11) 99999-0001', email: 'pedro@gmail.com', group: 'GRP-001', status: 'ativo', date: '2026-02-20' },
        { id: 'm2', name: 'Ana Costa', phone: '(11) 99999-0002', email: 'ana@gmail.com', group: 'GRP-001', status: 'ativo', date: '2026-02-21' },
        { id: 'm3', name: 'Carlos Souza', phone: '(11) 99999-0003', email: 'carlos@gmail.com', group: 'GRP-002', status: 'pendente', date: '2026-02-25' }
    ]);
}
function saveMembers(m) { saveData('admin_members', m); }

function getLeads() { return getData('rateios_leads', []); }

// ===== LOGIN =====
function adminLogin() {
    var pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'block';
        sessionStorage.setItem('admin_logged', '1');
        refreshAll();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('admin-pass').value = '';
    }
}
function adminLogout() {
    sessionStorage.removeItem('admin_logged');
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-pass').value = '';
    document.getElementById('login-error').style.display = 'none';
}

// Auto-login check
document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('admin_logged') === '1') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'block';
        refreshAll();
    }
    document.getElementById('admin-pass').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') adminLogin();
    });
});

// ===== REFRESH =====
function refreshAll() {
    updateStats();
    renderGroups();
    renderMembers();
    renderLeads();
    populateGroupSelects();
}

// ===== STATS =====
function updateStats() {
    var groups = getGroups();
    var members = getMembers();
    var leads = getLeads();
    var activeMembers = members.filter(function (m) { return m.status === 'ativo'; });
    var totalSlots = 0;
    groups.forEach(function (g) { totalSlots += g.totalSlots; });
    var freeSlots = totalSlots - activeMembers.length;

    document.getElementById('stat-groups').textContent = groups.length;
    document.getElementById('stat-members').textContent = activeMembers.length;
    document.getElementById('stat-slots').textContent = Math.max(0, freeSlots);
    document.getElementById('stat-leads').textContent = leads.length;
}

// ===== TABS =====
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('view-' + tab).classList.add('active');
}

// ===== GROUPS =====
var COLORS = ['blue', 'green', 'yellow', 'red'];
function renderGroups() {
    var groups = getGroups();
    var members = getMembers();
    var list = document.getElementById('groups-list');

    if (groups.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhum grupo. Clique em "Novo" para criar.</p>';
        return;
    }

    list.innerHTML = groups.map(function (g, i) {
        var count = members.filter(function (m) { return m.group === g.id && m.status === 'ativo'; }).length;
        var free = g.totalSlots - count;
        var status = free <= 0 ? 'full' : (free <= 1 ? 'almost' : 'open');
        var statusLabel = { open: 'Aberto', almost: 'Quase lotado', full: 'Lotado' };
        var color = COLORS[i % COLORS.length];

        var avatarHtml = g.photo
            ? '<img src="' + g.photo + '" class="card-avatar-img" alt="' + (g.name || g.id) + '">'
            : '<div class="card-avatar ' + color + '">' + g.id.replace('GRP-', '') + '</div>';

        return '<div class="item-card" onclick="editGroup(\'' + g.id + '\')">' +
            avatarHtml +
            '<div class="card-info">' +
            '<div class="card-title">' + (g.name || g.id) + '</div>' +
            '<div class="card-sub">' + count + '/' + g.totalSlots + ' membros &middot; R$ ' + g.price.toFixed(2) + '/mes</div>' +
            '</div>' +
            '<span class="card-badge badge-' + status + '">' + statusLabel[status] + '</span>' +
            '</div>';
    }).join('');
}

// ===== MEMBERS =====
function renderMembers() {
    var members = getMembers();
    var filterGroup = document.getElementById('filter-group').value;
    var filterStatus = document.getElementById('filter-status').value;

    var filtered = members.filter(function (m) {
        if (filterGroup !== 'all' && m.group !== filterGroup) return false;
        if (filterStatus !== 'all' && m.status !== filterStatus) return false;
        return true;
    });

    var list = document.getElementById('members-list');
    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhum membro encontrado.</p>';
        return;
    }

    list.innerHTML = filtered.map(function (m, i) {
        var initials = (m.name || '??').split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var color = COLORS[i % COLORS.length];

        // Calculate 30-day guarantee timer
        var daysLeft = 30;
        if (m.date) {
            var startDate = new Date(m.date);
            var endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            var now = new Date();
            daysLeft = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000));
            if (daysLeft < 0) daysLeft = 0;
        }
        var timerClass = daysLeft > 15 ? 'timer-ok' : (daysLeft > 5 ? 'timer-warn' : 'timer-danger');
        var timerText = daysLeft > 0 ? daysLeft + 'd' : 'Expirado';

        return '<div class="item-card" onclick="editMember(\'' + m.id + '\')">' +
            '<div class="card-avatar ' + color + '">' + initials + '</div>' +
            '<div class="card-info">' +
            '<div class="card-title">' + m.name + '</div>' +
            '<div class="card-sub">' + m.phone + ' &middot; ' + m.group + '</div>' +
            '</div>' +
            '<div class="card-right">' +
            '<span class="card-timer ' + timerClass + '">' + timerText + '</span>' +
            '<span class="card-badge badge-' + m.status + '">' + m.status + '</span>' +
            '</div>' +
            '</div>';
    }).join('');
}

// ===== LEADS =====
function renderLeads() {
    var leads = getLeads();
    var list = document.getElementById('leads-list');
    var noLeads = document.getElementById('no-leads');

    if (leads.length === 0) {
        list.innerHTML = '';
        noLeads.style.display = 'block';
        return;
    }
    noLeads.style.display = 'none';

    list.innerHTML = leads.map(function (l, i) {
        var initials = (l.name || '??').split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var date = l.date ? new Date(l.date).toLocaleDateString('pt-BR') : '';
        var phone = l.phone || '';

        return '<div class="item-card" onclick="convertLead(' + i + ')">' +
            '<div class="card-avatar green">' + initials + '</div>' +
            '<div class="card-info">' +
            '<div class="card-title">' + (l.name || 'Sem nome') + '</div>' +
            '<div class="card-sub">' + phone + ' &middot; ' + (l.email || '') + ' &middot; ' + date + '</div>' +
            '</div>' +
            '<span class="card-badge badge-pendente">' + (l.group || 'Novo') + '</span>' +
            '</div>';
    }).join('');
}

function clearLeads() {
    if (confirm('Limpar todos os leads?')) {
        localStorage.removeItem('rateios_leads');
        refreshAll();
    }
}

function convertLead(index) {
    var leads = getLeads();
    var lead = leads[index];
    if (!lead) return;

    // Pre-fill add member modal
    document.getElementById('new-member-name').value = lead.name || '';
    document.getElementById('new-member-phone').value = lead.phone || '';
    document.getElementById('new-member-email').value = lead.email || '';
    if (lead.group) {
        var sel = document.getElementById('new-member-group');
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === lead.group) { sel.selectedIndex = i; break; }
        }
    }
    showModal('add-member');

    // Remove lead after conversion
    leads.splice(index, 1);
    saveData('rateios_leads', leads);
}

// ===== GROUP SELECT POPULATION =====
function populateGroupSelects() {
    var groups = getGroups();
    var selects = ['filter-group', 'new-member-group', 'edit-member-group'];
    selects.forEach(function (id) {
        var sel = document.getElementById(id);
        if (!sel) return;
        var current = sel.value;
        if (id === 'filter-group') {
            sel.innerHTML = '<option value="all">Todos os grupos</option>';
        } else {
            sel.innerHTML = '';
        }
        groups.forEach(function (g) {
            var opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = (g.name || g.id);
            sel.appendChild(opt);
        });
        if (current) sel.value = current;
    });
}

// ===== ADD GROUP =====
function addGroup() {
    var groups = getGroups();
    var num = groups.length + 1;
    var id = 'GRP-' + String(num).padStart(3, '0');
    // Make unique
    while (groups.some(function (g) { return g.id === id; })) {
        num++;
        id = 'GRP-' + String(num).padStart(3, '0');
    }
    var name = document.getElementById('new-group-name').value.trim() || ('Familia Premium ' + String(num).padStart(2, '0'));
    var slots = parseInt(document.getElementById('new-group-slots').value) || 6;
    var price = parseFloat(document.getElementById('new-group-price').value) || 101.50;
    var link = document.getElementById('new-group-link').value.trim();
    var photo = pendingPhotoData['new-group-photo-preview'] || null;

    groups.push({ id: id, name: name, totalSlots: slots, price: price, link: link, photo: photo });
    saveGroups(groups);
    closeModals();
    document.getElementById('new-group-name').value = '';
    document.getElementById('new-group-photo-preview').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#9AA0A6"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
    delete pendingPhotoData['new-group-photo-preview'];
    refreshAll();
}

// ===== EDIT GROUP =====
function editGroup(id) {
    var groups = getGroups();
    var g = groups.find(function (x) { return x.id === id; });
    if (!g) return;

    document.getElementById('edit-group-id').value = g.id;
    document.getElementById('edit-group-name').value = g.name || g.id;
    document.getElementById('edit-group-slots').value = g.totalSlots;
    document.getElementById('edit-group-price').value = g.price;
    document.getElementById('edit-group-link').value = g.link || '';

    // Show existing photo
    var preview = document.getElementById('edit-group-photo-preview');
    if (g.photo) {
        preview.innerHTML = '<img src="' + g.photo + '" alt="Foto">';
        pendingPhotoData['edit-group-photo-preview'] = g.photo;
    } else {
        preview.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#9AA0A6"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
        delete pendingPhotoData['edit-group-photo-preview'];
    }
    showModal('edit-group');
}

function saveGroup() {
    var id = document.getElementById('edit-group-id').value;
    var groups = getGroups();
    var g = groups.find(function (x) { return x.id === id; });
    if (!g) return;

    g.name = document.getElementById('edit-group-name').value.trim();
    g.totalSlots = parseInt(document.getElementById('edit-group-slots').value) || 6;
    g.price = parseFloat(document.getElementById('edit-group-price').value) || 101.50;
    g.link = document.getElementById('edit-group-link').value.trim();
    if (pendingPhotoData['edit-group-photo-preview']) {
        g.photo = pendingPhotoData['edit-group-photo-preview'];
    }
    saveGroups(groups);
    closeModals();
    delete pendingPhotoData['edit-group-photo-preview'];
    refreshAll();
}

function deleteGroup() {
    var id = document.getElementById('edit-group-id').value;
    if (!confirm('Excluir grupo ' + id + '? Os membros nao serao removidos.')) return;
    var groups = getGroups().filter(function (g) { return g.id !== id; });
    saveGroups(groups);
    closeModals();
    refreshAll();
}

// ===== ADD MEMBER =====
function addMember() {
    var name = document.getElementById('new-member-name').value.trim();
    var phone = document.getElementById('new-member-phone').value.trim();
    var email = document.getElementById('new-member-email').value.trim();
    var group = document.getElementById('new-member-group').value;
    var status = document.getElementById('new-member-status').value;

    if (!name || !phone) { alert('Preencha nome e WhatsApp'); return; }

    var members = getMembers();
    var id = 'm' + Date.now();
    members.push({ id: id, name: name, phone: phone, email: email, group: group, status: status, date: new Date().toISOString().split('T')[0] });
    saveMembers(members);
    closeModals();
    document.getElementById('new-member-name').value = '';
    document.getElementById('new-member-phone').value = '';
    document.getElementById('new-member-email').value = '';
    refreshAll();
}

// ===== EDIT MEMBER =====
function editMember(id) {
    var members = getMembers();
    var m = members.find(function (x) { return x.id === id; });
    if (!m) return;

    document.getElementById('edit-member-id').value = m.id;
    document.getElementById('edit-member-name').value = m.name;
    document.getElementById('edit-member-phone').value = m.phone;
    document.getElementById('edit-member-email').value = m.email;
    document.getElementById('edit-member-status').value = m.status;

    // Set group select
    populateGroupSelects();
    setTimeout(function () {
        document.getElementById('edit-member-group').value = m.group;
    }, 50);

    // WhatsApp link
    var phoneClean = (m.phone || '').replace(/\D/g, '');
    if (phoneClean.length <= 11) phoneClean = '55' + phoneClean;
    document.getElementById('edit-member-whatsapp').href = 'https://wa.me/' + phoneClean;

    showModal('edit-member');
}

function saveMember() {
    var id = document.getElementById('edit-member-id').value;
    var members = getMembers();
    var m = members.find(function (x) { return x.id === id; });
    if (!m) return;

    m.name = document.getElementById('edit-member-name').value.trim();
    m.phone = document.getElementById('edit-member-phone').value.trim();
    m.email = document.getElementById('edit-member-email').value.trim();
    m.group = document.getElementById('edit-member-group').value;
    m.status = document.getElementById('edit-member-status').value;
    saveMembers(members);
    closeModals();
    refreshAll();
}

function deleteMember() {
    var id = document.getElementById('edit-member-id').value;
    if (!confirm('Remover este membro?')) return;
    var members = getMembers().filter(function (m) { return m.id !== id; });
    saveMembers(members);
    closeModals();
    refreshAll();
}

// ===== MODALS =====
function showModal(name) {
    closeModals();
    document.getElementById('modal-' + name).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(function (m) { m.style.display = 'none'; });
    document.body.style.overflow = '';
}

// ===== PHOTO UPLOAD =====
var pendingPhotoData = {};

function previewPhoto(input, previewId) {
    var file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Imagem muito grande. Maximo 2MB.'); input.value = ''; return; }

    var reader = new FileReader();
    reader.onload = function (e) {
        var preview = document.getElementById(previewId);
        preview.innerHTML = '<img src="' + e.target.result + '" alt="Foto">';
        pendingPhotoData[previewId] = e.target.result;
    };
    reader.readAsDataURL(file);
}
