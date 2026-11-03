const API_BASE_URL = 'http://localhost:5000/api';

const API = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),

    headers: function (isUpload = false) {
        const h = {};
        if (!isUpload) h['Content-Type'] = 'application/json';
        if (this.token) h['Authorization'] = `Bearer ${this.token}`;
        return h;
    },

    request: async function (endpoint, method, body, isUpload = false) {
        try {
            const options = {
                method: method,
                headers: this.headers(isUpload),
            };

            if (body) {
                options.body = isUpload ? body : JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            alert(error.message); // Simple error feedback
            throw error;
        }
    },

    auth: {
        login: async (email, password) => {
            const data = await API.request('/auth/login', 'POST', { email, password });
            API.token = data.token;
            API.user = data.data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return data;
        },
        register: async (details) => {
            const data = await API.request('/auth/register', 'POST', details);
            API.token = data.token;
            API.user = data.data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return data;
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        },
        checkAuth: () => {
            if (!API.token) {
                window.location.href = 'login.html';
            }
        }
    },

    student: {
        upload: async (formData) => {
            return await API.request('/student/upload', 'POST', formData, true);
        },
        createOrder: async (orderData) => {
            return await API.request('/student/create-order', 'POST', orderData);
        },
        getOrders: async () => {
            return await API.request('/student/orders', 'GET');
        }
    },

    printer: {
        toggleStatus: async (isActive) => {
            return await API.request('/printer/toggle-status', 'PATCH', { isActive });
        },
        getDashboard: async () => {
            return await API.request('/printer/dashboard', 'GET');
        },
        updateOrderStatus: async (orderId, status) => {
            return await API.request(`/printer/orders/${orderId}/status`, 'PATCH', { status });
        }
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },

    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString();
    }
};

// Check if we are on a protected page and not logged in
const protectedPages = ['students.html', 'printers.html'];
const currentPage = window.location.pathname.split('/').pop();

if (protectedPages.includes(currentPage)) {
    API.auth.checkAuth();
}
