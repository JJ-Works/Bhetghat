// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Navbar.js loaded');
    checkAuthStatus();
    setupAuthListeners();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const loginBtn = document.getElementById('loginBtn');
    const profileSection = document.getElementById('profileSection');

    console.log('Checking auth status - Token:', !!token, 'UserId:', !!userId);

    if (token && userId) {
        // User is logged in
        console.log('User is logged in');
        loginBtn.style.display = 'none';
        profileSection.style.display = 'flex';
        loadUserProfile();
    } else {
        // User is NOT logged in
        console.log('User is NOT logged in');
        loginBtn.style.display = 'block';
        profileSection.style.display = 'none';
    }
}

function loadUserProfile() {
    // Optional: Fetch user details from backend and update profile
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    // You can use this data to update the profile avatar or name
    console.log('User logged in:', userName);
}

function setupAuthListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'pages/login.html';
        });
    }

    // Logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

function logout() {
    console.log('Logging out...');
    // Clear all stored user data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInterest');

    // Check auth status again to update UI
    checkAuthStatus();

    // Redirect to home page
    window.location.href = 'index.html';
}

function setUserLoggedIn(token, userId, userName, userEmail, userInterest = null) {
    console.log('Setting user logged in:', userName);
    // Store user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', userEmail);
    if (userInterest) {
        localStorage.setItem('userInterest', userInterest);
    }

    // Update UI
    checkAuthStatus();
}
