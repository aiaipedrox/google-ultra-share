// ===== ADMIN PANEL (API version) =====
var ADMIN_PASSWORD = 'rateios2026';
var COLORS = ['blue', 'green', 'yellow', 'red'];
var cachedGroups = [];

// ===== LOGIN =====
function adminLogin() {
    var pass = document.getElementById('admin-pass').value;
    API.login(pass).then(function (data) {
        if (data.token) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-app').style.display = 'block';
            refreshAll();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('admin-pass').value = '';
        }
    }).catch(function () {
        document.getElementById('login-error').style.display = 'block';
    });
}

function adminLogout() {
    sessionStorage.removeItem('admin_token');
    API.token = null;
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-pass').value = '';
    document.getElementById('login-error').style.display = 'none';
}

// Auto-login
document.addEventListener('DOMContentLoaded', function () {
    if (API.loadToken()) {
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
    Promise.all([
        API.getGroups(),
        API.getMembers('all', 'all'),
        API.getLeads(),
        API.getOrders('all')
    ]).then(function (results) {
        cachedGroups = results[0];
        updateStats(results[0], results[1], results[2], results[3]);
        renderGroupsList(results[0], results[1]);
        renderMembersList(results[1]);
        renderLeadsList(results[2]);
        renderOrdersList(results[3]);
        populateGroupSelects(results[0]);
    }).catch(function (err) {
        console.error('API error:', err);
    });
}

// ===== STATS =====
function updateStats(groups, members, leads, orders) {
    var active = members.filter(function (m) { return m.status === 'ativo'; });
    var totalSlots = 0;
    groups.forEach(function (g) { totalSlots += g.totalSlots; });
    var free = totalSlots - active.length;
    var pendingOrders = orders.filter(function (o) { return o.status === 'pendente'; });

    document.getElementById('stat-groups').textContent = groups.length;
    document.getElementById('stat-members').textContent = active.length + ' / ' + members.length;
    document.getElementById('stat-slots').textContent = Math.max(0, free);
    document.getElementById('stat-leads').textContent = leads.length;
    document.getElementById('stat-orders').textContent = pendingOrders.length;
}

// ===== TABS =====
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('view-' + tab).classList.add('active');
}

// ===== GROUPS =====
function renderGroupsList(groups, members) {
    var list = document.getElementById('groups-list');
    if (groups.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhum grupo. Clique em "Novo" para criar.</p>';
        return;
    }
    list.innerHTML = groups.map(function (g, i) {
        var color = COLORS[i % COLORS.length];
        var statusLabel = { open: 'Aberto', almost: 'Quase', full: 'Lotado' };
        var avatarHtml = g.photo
            ? '<img src="' + g.photo + '" class="card-avatar-img" alt="' + g.name + '">'
            : '<div class="card-avatar ' + color + '">' + g.id.replace('GRP-', '') + '</div>';

        return '<div class="item-card" onclick="editGroup(\'' + g.id + '\')">' +
            avatarHtml +
            '<div class="card-info">' +
            '<div class="card-title">' + g.name + '</div>' +
            '<div class="card-sub">' + g.filledSlots + '/' + g.totalSlots + ' &middot; R$ ' + g.price.toFixed(2) + '</div>' +
            '</div>' +
            '<span class="card-badge badge-' + g.status + '">' + statusLabel[g.status] + '</span>' +
            '</div>';
    }).join('');
}

// ===== MEMBERS =====
function renderMembersList(members) {
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
        var dl = m.daysLeft !== undefined ? m.daysLeft : 30;
        
        // Status Colors & Labels
        var statusColors = { 
            ativo: 'green', 
            pendente: 'gray', 
            inativo: 'red' 
        };
        var statusLabels = {
            ativo: 'Pagante',
            pendente: 'Grátis',
            inativo: 'Bloqueado'
        };
        
        var badgeColor = statusColors[m.status] || 'gray';
        var badgeLabel = statusLabels[m.status] || m.status;
        var avatarColor = m.status === 'ativo' ? COLORS[i % COLORS.length] : 'gray';

        var timerClass = dl > 15 ? 'timer-ok' : (dl > 5 ? 'timer-warn' : 'timer-danger');
        var timerText = dl > 0 ? dl + 'd' : 'Exp';
        
        // Hide timer if not active
        var timerHtml = m.status === 'ativo' ? '<span class="card-timer ' + timerClass + '">' + timerText + '</span>' : '';

        return '<div class="item-card" onclick="editMember(\'' + m.id + '\')">' +
            '<div class="card-avatar ' + avatarColor + '">' + initials + '</div>' +
            '<div class="card-info"><div class="card-title" style="' + (m.status !== 'ativo' ? 'color:#9AA0A6;' : '') + '">' + m.name + '</div>' +
            '<div class="card-sub">' + m.phone + ' &middot; ' + m.group + '</div></div>' +
            '<div class="card-right">' + timerHtml +
            '<span class="card-badge badge-' + badgeColor + '" style="font-weight:600;">' + badgeLabel + '</span></div></div>';
    }).join('');
}

function renderMembers() {
    API.getMembers(
        document.getElementById('filter-group').value,
        document.getElementById('filter-status').value
    ).then(function (members) { renderMembersList(members); });
}

// ===== ORDERS =====
function renderOrdersList(orders) {
    var filterOrd = document.getElementById('filter-order-status');
    var filterVal = filterOrd ? filterOrd.value : 'all';

    var filtered = orders.filter(function (o) {
        if (filterVal !== 'all' && o.status !== filterVal) return false;
        return true;
    });

    var list = document.getElementById('orders-list');
    if (!list) return;
    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhum pedido.</p>';
        return;
    }

    list.innerHTML = filtered.map(function (o) {
        var initials = (o.name || '??').split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var statusColors = { pendente: 'yellow', pago: 'blue', ativo: 'green', cancelado: 'red' };
        var color = statusColors[o.status] || 'blue';
        var paidIcon = o.paid ? '&check;' : '&times;';
        var paidClass = o.paid ? 'timer-ok' : 'timer-danger';
        var daysText = o.daysLeft > 0 ? o.daysLeft + 'd' : '0d';
        var daysClass = o.daysLeft > 15 ? 'timer-ok' : (o.daysLeft > 5 ? 'timer-warn' : 'timer-danger');
        var date = o.date ? new Date(o.date).toLocaleDateString('pt-BR') : '';

        return '<div class="item-card" onclick="editOrder(' + o.id + ')">' +
            '<div class="card-avatar ' + color + '">' + initials + '</div>' +
            '<div class="card-info">' +
            '<div class="card-title">' + o.name + ' <small style="color:#9AA0A6;">' + o.orderId + '</small></div>' +
            '<div class="card-sub">' + o.phone + ' &middot; ' + (o.assignedGroup || o.group || 'Sem grupo') + ' &middot; ' + date + '</div>' +
            '</div>' +
            '<div class="card-right">' +
            '<span class="card-timer ' + paidClass + '">' + paidIcon + ' Pago</span>' +
            '<span class="card-timer ' + daysClass + '">' + daysText + '</span>' +
            '<span class="card-badge badge-' + o.status + '">' + o.status + '</span>' +
            '</div>' +
            '</div>';
    }).join('');
}

function renderOrders() {
    API.getOrders(document.getElementById('filter-order-status').value).then(function (orders) {
        renderOrdersList(orders);
    });
}

// ===== LEADS =====
function renderLeadsList(leads) {
    var list = document.getElementById('leads-list');
    var noLeads = document.getElementById('no-leads');
    if (leads.length === 0) {
        list.innerHTML = '';
        noLeads.style.display = 'block';
        return;
    }
    noLeads.style.display = 'none';

    list.innerHTML = leads.map(function (l) {
        var initials = (l.name || '??').split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var date = l.date ? new Date(l.date).toLocaleDateString('pt-BR') : '';
        return '<div class="item-card" onclick="convertLead(' + l.id + ')">' +
            '<div class="card-avatar green">' + initials + '</div>' +
            '<div class="card-info"><div class="card-title">' + (l.name || 'Sem nome') + '</div>' +
            '<div class="card-sub">' + (l.phone || '') + ' &middot; ' + (l.email || '') + ' &middot; ' + date + '</div></div>' +
            '<span class="card-badge badge-pendente">' + (l.group || 'Novo') + '</span></div>';
    }).join('');
}

function clearLeads() {
    if (confirm('Limpar todos os leads?')) {
        API.deleteLead().then(function () { refreshAll(); });
    }
}

function convertLead(id) {
    API.getLeads().then(function (leads) {
        var lead = leads.find(function (l) { return l.id === id; });
        if (!lead) return;
        document.getElementById('new-member-name').value = lead.name || '';
        document.getElementById('new-member-phone').value = lead.phone || '';
        document.getElementById('new-member-email').value = lead.email || '';
        showModal('add-member');
        API.deleteLead(id);
    });
}

// ===== GROUP SELECTS =====
function populateGroupSelects(groups) {
    var selects = ['filter-group', 'new-member-group', 'edit-member-group', 'edit-order-group'];
    selects.forEach(function (sid) {
        var sel = document.getElementById(sid);
        if (!sel) return;
        var current = sel.value;
        if (sid === 'filter-group') {
            sel.innerHTML = '<option value="all">Todos os grupos</option>';
        } else {
            sel.innerHTML = '';
        }
        groups.forEach(function (g) {
            var opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            sel.appendChild(opt);
        });
        if (current) sel.value = current;
    });
}

// ===== ADD GROUP =====
function addGroup() {
    var name = document.getElementById('new-group-name').value.trim() || 'Familia Premium';
    var slots = parseInt(document.getElementById('new-group-slots').value) || 6;
    var price = parseFloat(document.getElementById('new-group-price').value) || 129.90;
    var link = document.getElementById('new-group-link').value.trim();
    var emailMae = document.getElementById('new-group-email-mae').value.trim();
    var photo = pendingPhotoData['new-group-photo-preview'] || null;

    API.createGroup({ name: name, totalSlots: slots, price: price, link: link, photo: photo, emailMae: emailMae }).then(function () {
        closeModals();
        document.getElementById('new-group-name').value = '';
        document.getElementById('new-group-email-mae').value = '';
        delete pendingPhotoData['new-group-photo-preview'];
        refreshAll();
    });
}

// ===== EDIT GROUP =====
function editGroup(id) {
    var g = cachedGroups.find(function (x) { return x.id === id; });
    if (!g) return;
    document.getElementById('edit-group-id').value = g.id;
    document.getElementById('edit-group-name').value = g.name;
    document.getElementById('edit-group-slots').value = g.totalSlots;
    document.getElementById('edit-group-price').value = g.price;
    document.getElementById('edit-group-link').value = g.link || '';
    document.getElementById('edit-group-email-mae').value = g.emailMae || '';

    var preview = document.getElementById('edit-group-photo-preview');
    if (g.photo) {
        preview.innerHTML = '<img src="' + g.photo + '" alt="Foto">';
        pendingPhotoData['edit-group-photo-preview'] = g.photo;
    } else {
        preview.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#9AA0A6"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
        delete pendingPhotoData['edit-group-photo-preview'];
    }

    // Carregar membros do grupo
    API.getMembers(g.id, 'all').then(function (members) {
        var listDiv = document.getElementById('edit-group-members-list');
        if (!members || members.length === 0) {
            listDiv.innerHTML = '<p style="color:#9AA0A6; text-align:center; padding:12px; margin:0; font-size:0.85rem;">Nenhum membro neste grupo.</p>';
        } else {
            listDiv.innerHTML = members.map(function (m) {
                var statusDot = m.status === 'ativo' ? '#34A853' : (m.status === 'pendente' ? '#FBBC05' : '#EA4335');
                return '<div onclick="copyMemberEmail(\'' + (m.email || '') + '\')" style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseout="this.style.background=\'transparent\'">' +
                    '<div style="width:8px; height:8px; border-radius:50%; background:' + statusDot + '; flex-shrink:0;"></div>' +
                    '<div style="flex:1; min-width:0;">' +
                    '<div style="font-size:0.85rem; font-weight:600; color:#E8EAED; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + m.name + '</div>' +
                    '<div style="font-size:0.75rem; color:#9AA0A6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + (m.email || 'sem email') + '</div>' +
                    '</div>' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="#9AA0A6" style="flex-shrink:0;"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' +
                    '</div>';
            }).join('');
        }
    });

    showModal('edit-group');
}

function saveGroup() {
    var id = document.getElementById('edit-group-id').value;
    var data = {
        id: id,
        name: document.getElementById('edit-group-name').value.trim(),
        totalSlots: parseInt(document.getElementById('edit-group-slots').value) || 6,
        price: parseFloat(document.getElementById('edit-group-price').value) || 129.90,
        link: document.getElementById('edit-group-link').value.trim(),
        emailMae: document.getElementById('edit-group-email-mae').value.trim()
    };
    if (pendingPhotoData['edit-group-photo-preview']) data.photo = pendingPhotoData['edit-group-photo-preview'];
    API.updateGroup(data).then(function () {
        closeModals();
        delete pendingPhotoData['edit-group-photo-preview'];
        refreshAll();
    });
}

// Copiar email do membro ao clicar
function copyMemberEmail(email) {
    if (!email) { alert('Membro sem email cadastrado'); return; }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(function () {
            alert('Email copiado: ' + email);
        });
    } else {
        prompt('Copie o email:', email);
    }
}

function deleteGroup() {
    var id = document.getElementById('edit-group-id').value;
    if (!confirm('Excluir grupo ' + id + '?')) return;
    API.deleteGroup(id).then(function () { closeModals(); refreshAll(); });
}

// ===== ADD MEMBER =====
function addMember() {
    var name = document.getElementById('new-member-name').value.trim();
    var phone = document.getElementById('new-member-phone').value.trim();
    var email = document.getElementById('new-member-email').value.trim();
    var group = document.getElementById('new-member-group').value;
    var status = document.getElementById('new-member-status').value;
    if (!name || !phone) { alert('Preencha nome e WhatsApp'); return; }

    API.createMember({ name: name, phone: phone, email: email, group: group, status: status }).then(function () {
        closeModals();
        document.getElementById('new-member-name').value = '';
        document.getElementById('new-member-phone').value = '';
        document.getElementById('new-member-email').value = '';
        refreshAll();
    });
}

// ===== EDIT MEMBER =====
function editMember(id) {
    API.getMembers('all', 'all').then(function (members) {
        var m = members.find(function (x) { return x.id === id; });
        if (!m) return;
        document.getElementById('edit-member-id').value = m.id;
        document.getElementById('edit-member-name').value = m.name;
        document.getElementById('edit-member-phone').value = m.phone;
        document.getElementById('edit-member-email').value = m.email;
        document.getElementById('edit-member-status').value = m.status;
        populateGroupSelects(cachedGroups);
        setTimeout(function () { document.getElementById('edit-member-group').value = m.group; }, 50);
        var phoneClean = (m.phone || '').replace(/\D/g, '');
        if (phoneClean.length <= 11) phoneClean = '55' + phoneClean;
        document.getElementById('edit-member-whatsapp').href = 'https://wa.me/' + phoneClean;
        showModal('edit-member');
    });
}

function saveMember() {
    var id = document.getElementById('edit-member-id').value;
    API.updateMember({
        id: id,
        name: document.getElementById('edit-member-name').value.trim(),
        phone: document.getElementById('edit-member-phone').value.trim(),
        email: document.getElementById('edit-member-email').value.trim(),
        group: document.getElementById('edit-member-group').value,
        status: document.getElementById('edit-member-status').value
    }).then(function () { closeModals(); refreshAll(); });
}

function deleteMember() {
    var id = document.getElementById('edit-member-id').value;
    if (!confirm('Remover este membro?')) return;
    API.deleteMember(id).then(function () { closeModals(); refreshAll(); });
}

// ===== EDIT ORDER =====
function editOrder(id) {
    API.getOrders('all').then(function (orders) {
        var o = orders.find(function (x) { return x.id === id; });
        if (!o) return;
        document.getElementById('edit-order-id').value = o.id;
        document.getElementById('edit-order-name').textContent = o.name;
        document.getElementById('edit-order-phone-display').textContent = o.phone;
        document.getElementById('edit-order-email-display').textContent = o.email;
        document.getElementById('edit-order-order-id').textContent = o.orderId;
        document.getElementById('edit-order-date').textContent = o.date ? new Date(o.date).toLocaleDateString('pt-BR') : '';
        document.getElementById('edit-order-status').value = o.status;
        document.getElementById('edit-order-paid').checked = o.paid;
        document.getElementById('edit-order-days').value = o.days;
        document.getElementById('edit-order-notes').value = o.notes || '';

        populateGroupSelects(cachedGroups);
        setTimeout(function () {
            var sel = document.getElementById('edit-order-group');
            sel.value = o.assignedGroup || o.group || '';
        }, 50);

        var phoneClean = (o.phone || '').replace(/\D/g, '');
        if (phoneClean.length <= 11) phoneClean = '55' + phoneClean;
        document.getElementById('edit-order-whatsapp').href = 'https://wa.me/' + phoneClean;

        showModal('edit-order');
    });
}

function saveOrder() {
    var id = parseInt(document.getElementById('edit-order-id').value);
    API.updateOrder({
        id: id,
        status: document.getElementById('edit-order-status').value,
        paid: document.getElementById('edit-order-paid').checked,
        assignedGroup: document.getElementById('edit-order-group').value,
        days: parseInt(document.getElementById('edit-order-days').value) || 30,
        notes: document.getElementById('edit-order-notes').value
    }).then(function () { closeModals(); refreshAll(); });
}

function deleteOrder() {
    var id = parseInt(document.getElementById('edit-order-id').value);
    if (!confirm('Excluir pedido?')) return;
    API.deleteOrder(id).then(function () { closeModals(); refreshAll(); });
}

function dispatchOrder() {
    var id = parseInt(document.getElementById('edit-order-id').value);
    var group = document.getElementById('edit-order-group').value;
    if (!group) { alert('Selecione um grupo primeiro'); return; }

    // Get order data to create member
    API.getOrders('all').then(function (orders) {
        var o = orders.find(function (x) { return x.id === id; });
        if (!o) return;

        // Create member from order
        API.createMember({
            name: o.name,
            phone: o.phone,
            email: o.email,
            group: group,
            status: 'ativo'
        }).then(function () {
            // Update order to ativo
            API.updateOrder({
                id: id,
                status: 'ativo',
                paid: true,
                assignedGroup: group
            }).then(function () {
                closeModals();
                refreshAll();
                alert('Membro criado e pedido despachado para ' + group + '!');
            });
        });
    });
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
    if (file.size > 2 * 1024 * 1024) { alert('Maximo 2MB'); input.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById(previewId).innerHTML = '<img src="' + e.target.result + '" alt="Foto">';
        pendingPhotoData[previewId] = e.target.result;
    };
    reader.readAsDataURL(file);
}
