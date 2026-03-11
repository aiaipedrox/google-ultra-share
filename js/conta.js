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

// Bind to window so auth.js can call it after successful login
window.showAccountPanel = function(userData) {
    currentMember = userData;

    // Hide auth screen, show panel
    document.getElementById('conta-login').style.display = 'none';
    document.getElementById('conta-painel').style.display = 'block';

    // Set UI elements
    document.getElementById('conta-username').textContent = userData.name || userData.email;
    
    // Status badges logic
    const statusBadges = document.querySelectorAll('.badge-green');
    if (userData.status !== 'ativo') {
        statusBadges.forEach(badge => {
            badge.className = 'badge badge-gray';
            badge.textContent = userData.status === 'pendente' ? 'Pendente' : 'Inativo';
        });
        
        // Disable courses button if inactive
        const btnCursos = document.querySelector('a[href="cursos.html"]');
        if (btnCursos) {
            btnCursos.style.pointerEvents = 'none';
            btnCursos.style.opacity = '0.5';
            btnCursos.textContent = 'Renove sua assinatura para acessar';
        }
    }
};

window.logoutConta = function() {
    currentMember = null;
    localStorage.removeItem('user_auth_token');
    localStorage.removeItem('user_data_profile');
    
    document.getElementById('conta-login').style.display = 'flex';
    document.getElementById('conta-painel').style.display = 'none';
    
    // reset form fields
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => input.value = '');
    
    const errorMsg = document.getElementById('conta-error');
    if (errorMsg) errorMsg.style.display = 'none';
};

function openWhatsApp() {
    var msg = 'Ola! Preciso de suporte com minha conta no Rateios.pro.';
    if (currentMember) {
        msg = 'Ola! Preciso de suporte. Minha conta e: ' + (currentMember.email || '') + ' - Grupo: ' + (currentMember.group || '');
    }
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
}
