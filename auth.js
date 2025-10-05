class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.signup();
            });
        }
    }

    switchTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'shop.html';
            }, 1000);
        } else {
            this.showMessage('Invalid username or password', 'error');
        }
    }

    signup() {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showMessage('Username already exists', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            joined: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showMessage('Account created successfully! Please login.', 'success');
        this.switchTab('login');
        
        // Clear signup form
        document.getElementById('signup-form').reset();
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('auth-message');
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 3000);
    }

    checkAuthState() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // If user is logged in and on login page, redirect to shop
        if (this.currentUser && (currentPage === 'index.html' || currentPage === '')) {
            window.location.href = 'shop.html';
        }
        
        // If user is not logged in and on protected page, redirect to login
        const protectedPages = ['shop.html', 'address.html', 'payment.html', 'profile.html'];
        if (!this.currentUser && protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});