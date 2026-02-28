// ===== AREA DO CLIENTE =====

// Simulated members database
var MEMBERS_DB = [
    { email: 'pedro@gmail.com', name: 'Pedro', group: 'GRP-001', since: '20/02/2026', nextBill: '20/03/2026' },
    { email: 'ana@gmail.com', name: 'Ana', group: 'GRP-002', since: '15/02/2026', nextBill: '15/03/2026' },
    { email: 'lucas@gmail.com', name: 'Lucas', group: 'GRP-003', since: '25/02/2026', nextBill: '25/03/2026' },
    { email: 'maria@gmail.com', name: 'Maria', group: 'GRP-004', since: '10/02/2026', nextBill: '10/03/2026' },
    { email: 'joao@gmail.com', name: 'Joao', group: 'GRP-005', since: '27/02/2026', nextBill: '27/03/2026' }
];

var currentMember = null;
var currentTab = 'email';

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-email-form').style.display = tab === 'email' ? 'block' : 'none';
    document.getElementById('tab-pedido-form').style.display = tab === 'pedido' ? 'block' : 'none';
    document.getElementById('tab-email').classList.toggle('active', tab === 'email');
    document.getElementById('tab-pedido').classList.toggle('active', tab === 'pedido');
}

function loginConta() {
    var member = null;

    if (currentTab === 'email') {
        var email = document.getElementById('conta-email').value.trim().toLowerCase();
        member = MEMBERS_DB.find(function (m) { return m.email === email; });
    } else {
        var pedidoId = document.getElementById('conta-pedido').value.trim().toUpperCase();
        // Accept format GRP-001 or GRP-001-003 etc
        member = MEMBERS_DB.find(function (m) {
            return pedidoId.indexOf(m.group) === 0;
        });
    }

    if (member) {
        currentMember = member;
        showContaPainel(member);
    } else {
        document.getElementById('conta-error').style.display = 'block';
    }
}

function showContaPainel(member) {
    document.getElementById('conta-login').style.display = 'none';
    document.getElementById('conta-painel').style.display = 'block';
    document.getElementById('conta-username').textContent = member.email || member.name;
    document.getElementById('conta-grupo').textContent = member.group;
    document.getElementById('conta-vencimento').textContent = member.nextBill;
}

function logoutConta() {
    currentMember = null;
    document.getElementById('conta-login').style.display = 'flex';
    document.getElementById('conta-painel').style.display = 'none';
    document.getElementById('conta-email').value = '';
    document.getElementById('conta-error').style.display = 'none';
}

function openWhatsApp() {
    var msg = 'Ola! Preciso de suporte com minha conta no Rateios.pro.';
    if (currentMember) {
        msg = 'Ola! Preciso de suporte. Minha conta e: ' + (currentMember.email || '') + ' - Grupo: ' + (currentMember.group || '');
    }
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
}
