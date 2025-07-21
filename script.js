// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle i');
    themeToggle.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize theme on page load
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function showLogin() {
    showPage('login');
}

function showSignup() {
    showPage('signup');
}

function showAddReport() {
    showPage('add');
}

function showMyReports() {
    showPage('reports');
}

function showHome() {
    showPage('home');
}

// Search and Filter Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    if (searchInput && filterSelect) {
        searchInput.addEventListener('input', filterItems);
        filterSelect.addEventListener('change', filterItems);
    }
}

function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterSelect').value;
    const itemCards = document.querySelectorAll('.item-card');
    
    itemCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const badge = card.querySelector('.item-badge');
        const itemType = badge.classList.contains('lost') ? 'lost' : 'found';
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesFilter = filterType === 'all' || itemType === filterType;
        
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Form Handling
function initForms() {
    // Login form
    const loginForm = document.querySelector('#login .auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.querySelector('#signup .auth-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Report form
    const reportForm = document.querySelector('.report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Simulate login
    showToast('Login successful!', 'success');
    showHome();
    updateAuthState(true);
}

function handleSignup(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Simulate signup
    showToast('Account created successfully!', 'success');
    showHome();
    updateAuthState(true);
}

function handleReportSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Get form values
    const type = e.target.querySelector('select').value;
    const title = e.target.querySelector('input[type="text"]').value;
    const description = e.target.querySelector('textarea').value;
    const contact = e.target.querySelectorAll('input[type="text"]')[1].value;
    
    if (!title || !description || !contact) {
        showToast('Please fill in all fields!', 'error');
        return;
    }
    
    // Create new item card
    addItemToGrid({
        type: type,
        title: title,
        description: description,
        contact: contact,
        user: 'You',
        date: 'Just now'
    });
    
    showToast('Item reported successfully!', 'success');
    e.target.reset();
    showMyReports();
}

// Item Management
function addItemToGrid(item) {
    const itemsGrid = document.querySelector('#reports .items-grid');
    if (!itemsGrid) return;
    
    const contactIcon = getContactIcon(item.contact);
    const badgeClass = item.type === 'lost' ? 'lost' : 'found';
    const badgeText = item.type === 'lost' ? '🔍 Lost' : '📦 Found';
    
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card user-item';
    itemCard.innerHTML = `
        <div class="item-header">
            <span class="item-badge ${badgeClass}">${badgeText}</span>
            <button class="delete-btn" onclick="deleteItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="item-contact">
            <i class="${contactIcon}"></i>
            <span>${item.contact}</span>
        </div>
        <div class="item-meta">
            <span><i class="fas fa-user"></i> ${item.user}</span>
            <span><i class="fas fa-clock"></i> ${item.date}</span>
        </div>
    `;
    
    itemsGrid.insertBefore(itemCard, itemsGrid.firstChild);
}

function getContactIcon(contact) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const instagramRegex = /^@[\w\.]+$/;
    
    if (phoneRegex.test(contact)) {
        return 'fas fa-phone';
    } else if (emailRegex.test(contact)) {
        return 'fas fa-envelope';
    } else if (instagramRegex.test(contact)) {
        return 'fab fa-instagram';
    } else {
        return 'fas fa-user';
    }
}

function deleteItem(button) {
    if (confirm('Are you sure you want to delete this report?')) {
        const itemCard = button.closest('.item-card');
        itemCard.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            itemCard.remove();
            showToast('Report deleted successfully!', 'success');
        }, 300);
    }
}

// Authentication State
function updateAuthState(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (isLoggedIn) {
        authButtons.innerHTML = `
            <span style="color: var(--text-secondary); font-size: 0.875rem;">Welcome back!</span>
            <button class="btn-secondary" onclick="logout()">Logout</button>
        `;
        
        // Show protected nav links
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#add' || link.getAttribute('href') === '#reports') {
                link.style.display = 'inline';
            }
        });
    } else {
        authButtons.innerHTML = `
            <button class="btn-secondary" onclick="showLogin()">Login</button>
            <button class="btn-primary" onclick="showSignup()">Sign Up</button>
        `;
        
        // Hide protected nav links
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#add' || link.getAttribute('href') === '#reports') {
                link.style.display = 'none';
            }
        });
    }
}

function logout() {
    showToast('Logged out successfully!', 'success');
    updateAuthState(false);
    showHome();
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast styles
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Confetti Effect
function triggerConfetti() {
    // Simple confetti effect using CSS animations
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        confettiContainer.appendChild(confetti);
    }
    
    document.body.appendChild(confettiContainer);
    
    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 5000);
}

// Navigation Event Listeners
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavigation();
    initSearch();
    initForms();
    updateAuthState(false); // Start logged out
    
    // Show home page by default
    showHome();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.querySelector('.theme-toggle i');
        if (themeToggle) {
            themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
});