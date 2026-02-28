// ===== API CLIENT =====
var API = {
    base: '/api',
    token: null,

    // Auth
    login: function (password) {
        return fetch(API.base + '/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        }).then(function (r) { return r.json(); }).then(function (data) {
            if (data.token) { API.token = data.token; sessionStorage.setItem('admin_token', data.token); }
            return data;
        });
    },

    loadToken: function () {
        API.token = sessionStorage.getItem('admin_token');
        return !!API.token;
    },

    headers: function () {
        var h = { 'Content-Type': 'application/json' };
        if (API.token) h['Authorization'] = 'Bearer ' + API.token;
        return h;
    },

    // Groups
    getGroups: function () {
        return fetch(API.base + '/groups.php').then(function (r) { return r.json(); });
    },
    createGroup: function (data) {
        return fetch(API.base + '/groups.php', { method: 'POST', headers: API.headers(), body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    updateGroup: function (data) {
        return fetch(API.base + '/groups.php', { method: 'PUT', headers: API.headers(), body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    deleteGroup: function (id) {
        return fetch(API.base + '/groups.php?id=' + id, { method: 'DELETE', headers: API.headers() }).then(function (r) { return r.json(); });
    },

    // Members
    getMembers: function (group, status) {
        var url = API.base + '/members.php?group=' + (group || 'all') + '&status=' + (status || 'all');
        return fetch(url, { headers: API.headers() }).then(function (r) { return r.json(); });
    },
    createMember: function (data) {
        return fetch(API.base + '/members.php', { method: 'POST', headers: API.headers(), body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    updateMember: function (data) {
        return fetch(API.base + '/members.php', { method: 'PUT', headers: API.headers(), body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    deleteMember: function (id) {
        return fetch(API.base + '/members.php?id=' + id, { method: 'DELETE', headers: API.headers() }).then(function (r) { return r.json(); });
    },

    // Leads
    getLeads: function () {
        return fetch(API.base + '/leads.php', { headers: API.headers() }).then(function (r) { return r.json(); });
    },
    saveLead: function (data) {
        return fetch(API.base + '/leads.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    deleteLead: function (id) {
        var url = id ? API.base + '/leads.php?id=' + id : API.base + '/leads.php';
        return fetch(url, { method: 'DELETE', headers: API.headers() }).then(function (r) { return r.json(); });
    },

    // Orders
    getOrders: function (status) {
        var url = API.base + '/orders.php?status=' + (status || 'all');
        return fetch(url, { headers: API.headers() }).then(function (r) { return r.json(); });
    },
    getOrdersByEmail: function (email) {
        return fetch(API.base + '/orders.php?email=' + encodeURIComponent(email)).then(function (r) { return r.json(); });
    },
    createOrder: function (data) {
        return fetch(API.base + '/orders.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    updateOrder: function (data) {
        return fetch(API.base + '/orders.php', { method: 'PUT', headers: API.headers(), body: JSON.stringify(data) }).then(function (r) { return r.json(); });
    },
    deleteOrder: function (id) {
        return fetch(API.base + '/orders.php?id=' + id, { method: 'DELETE', headers: API.headers() }).then(function (r) { return r.json(); });
    }
};
