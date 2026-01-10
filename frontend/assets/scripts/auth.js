document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.textContent = 'Loading...';
                btn.disabled = true;
                
                const user = await API.login(email, password);
                Auth.setUser(user);
                window.location.href = '../index.html';
            } catch (error) {
                alert(error.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const interests = document.getElementById('interests').value;
            const btn = e.target.querySelector('button');

            try {
                btn.textContent = 'Creating Account...';
                btn.disabled = true;

                const user = await API.register(name, email, password, interests);
                // Auto-login or redirect to login
                alert('Account created! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                alert(error.message);
            } finally {
                btn.textContent = 'Sign Up';
                btn.disabled = false;
            }
        });
    }
});
