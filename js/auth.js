// Auth Controller & Route Guard
const AUTH_KEY = 'user_auth_token';
const USER_DATA_KEY = 'user_data_profile';

// Toggle between Login and Register views
function toggleAuthView(view) {
    const loginView = document.getElementById('auth-login-view');
    const registerView = document.getElementById('auth-register-view');
    const errorMsg = document.getElementById('conta-error');
    
    if (errorMsg) errorMsg.style.display = 'none';

    if (view === 'login') {
        if (loginView) loginView.style.display = 'block';
        if (registerView) registerView.style.display = 'none';
    } else {
        if (loginView) loginView.style.display = 'none';
        if (registerView) registerView.style.display = 'block';
    }
}

window.toggleAuthView = toggleAuthView;

// Handle Login
window.authLogin = function() {
    const email = document.getElementById('auth-login-email').value;
    const pass = document.getElementById('auth-login-pass').value;
    const errorMsg = document.getElementById('conta-error');

    if (!email || !pass) {
        showError("Preencha e-mail e senha para entrar.");
        return;
    }

    // MOCK LOGIN LOGIC: Allow any email with @ for now, but we check if it's admin or normal
    if (email.includes('@')) {
        // Save session
        const isPaid = !email.includes('gratis'); // Mock logic: if email has 'gratis', they are inactive
        
        const userData = {
            name: email.split('@')[0],
            email: email,
            status: isPaid ? 'ativo' : 'inativo',
            role: 'user'
        };

        localStorage.setItem(AUTH_KEY, 'token_abc123');
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        // Let conta.js handle UI switch if we are on conta.html
        if (window.showAccountPanel) {
            window.showAccountPanel(userData);
        } else {
            window.location.href = 'conta.html';
        }
    } else {
        showError("E-mail incorreto. Tente novamente.");
    }
};

// Handle Registration
window.authRegister = function() {
    const name = document.getElementById('auth-reg-name').value;
    const phone = document.getElementById('auth-reg-phone').value;
    const email = document.getElementById('auth-reg-email').value;
    const pass = document.getElementById('auth-reg-pass').value;

    if (!name || !email || !pass || !phone) {
        showError("Preencha todos os dados para criar a conta.");
        return;
    }

    // MOCK REGISTRATION: Save and log them in immediately
    const userData = {
        name: name,
        email: email,
        phone: phone,
        status: 'pendente', // Need admin approval or payment to be active
        role: 'user'
    };

    localStorage.setItem(AUTH_KEY, 'token_abc123');
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

    if (window.showAccountPanel) {
        window.showAccountPanel(userData);
    } else {
        window.location.href = 'conta.html';
    }
};

function showError(msg) {
    const errorMsg = document.getElementById('conta-error');
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    } else {
        alert(msg);
    }
}

// ROUTE GUARD (Client Side Protection)
function checkAuthGuard() {
    const currentPage = window.location.pathname.split('/').pop();
    const token = localStorage.getItem(AUTH_KEY);
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    
    let isLogged = token && userDataStr;
    let userData = null;

    if (isLogged) {
        try {
            userData = JSON.parse(userDataStr);
        } catch (e) {
            isLogged = false;
        }
    }

    // Protection for courses.html
    if (currentPage === 'cursos.html') {
        if (!isLogged) {
            alert("Acesso negado. Faça login primeiro.");
            window.location.href = 'conta.html';
            return;
        }

        if (userData && userData.status !== 'ativo') {
            alert("Sua assinatura está inativa. Renove para acessar as aulas.");
            window.location.href = 'conta.html';
            return;
        }
    }

    // Auto-login logic for conta.html
    if (currentPage === 'conta.html' || currentPage === '' || currentPage === 'conta') {
        if (isLogged && window.showAccountPanel) {
            // Delay slightly to let the DOM load if called in head
            setTimeout(() => {
                window.showAccountPanel(userData);
            }, 100);
        }
    }
}

// Run guard immediately
checkAuthGuard();
