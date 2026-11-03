// Check if already logged in
if (API.token) {
    window.location.href = API.user.role === 'printer' ? 'printers.html' : 'students.html';
}

function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
    }
}

// Login Logic
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Logging in...';
    btn.disabled = true;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await API.auth.login(email, password);
        window.location.href = API.user.role === 'printer' ? 'printers.html' : 'students.html';
    } catch (err) {
        // Error handled in API Wrapper (Alert)
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Register Logic
document.getElementById('form-signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Creating Account...';
    btn.disabled = true;

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const university = document.getElementById('signup-university').value;
    const password = document.getElementById('signup-password').value;
    const isPrinter = document.getElementById('signup-role-printer').checked;

    try {
        await API.auth.register({
            name,
            email,
            password,
            university,
            role: isPrinter ? 'printer' : 'student'
        });
        alert('Account created! Redirecting...');
        window.location.href = API.user.role === 'printer' ? 'printers.html' : 'students.html';
    } catch (err) {
        // Error handled in API Wrapper
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
