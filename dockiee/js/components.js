const Components = {
    navbar: `
    <nav class="navbar">
        <div class="container nav-content">
            <a href="index.html" class="logo">
                <img src="assets/images/logo.png" alt="Dockiee Logo">
            </a>
            <div class="hamburger">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li><a href="how-it-works.html" class="nav-link">How It Works</a></li>
                <li><a href="students.html" class="nav-link">Students</a></li>
                <li><a href="printers.html" class="nav-link">Printer Owners</a></li>
                <li><a href="pricing.html" class="nav-link">Pricing</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
                <li><a href="login.html" class="btn btn-primary">Login / Sign Up</a></li>
            </ul>
        </div>
    </nav>
    `,
    footer: `
    <footer class="footer container">
        <div class="flex justify-between" style="flex-wrap: wrap; gap: 2rem;">
            <div style="max-width: 300px;">
                <h4 style="margin-bottom: 1rem; color: var(--dockie-primary);">Dockiee</h4>
                <p>Fast. Easy. <br> The student-first printing solution.</p>
            </div>
            <div>
                <h4 style="margin-bottom: 1rem;">Quick Links</h4>
                <ul style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="how-it-works.html">How It Works</a></li>
                    <li><a href="pricing.html">Pricing</a></li>
                </ul>
            </div>
            <div>
                 <h4 style="margin-bottom: 1rem;">Legal</h4>
                <ul style="display: flex; flex-direction: column; gap: 0.5rem;">
                     <li><a href="#">Privacy Policy</a></li>
                     <li><a href="#">Terms of Service</a></li>
                </ul>
            </div>
             <div>
                <h4 style="margin-bottom: 1rem;">Contact</h4>
                <p>support@dockiee.com</p>
                <p>+1 (555) 123-4567</p>
            </div>
        </div>
        <div class="text-center" style="margin-top: 3rem; color: var(--dockie-muted); font-size: 0.85rem;">
            &copy; 2026 Dockiee. All rights reserved.
        </div>
    </footer>
    `,
    loadNavbar: function (activeLinkIndex = -1) {
        document.getElementById('navbar-placeholder').innerHTML = this.navbar;
        if (activeLinkIndex !== -1) {
            const links = document.querySelectorAll('.nav-links .nav-link');
            if (links[activeLinkIndex]) {
                links[activeLinkIndex].style.color = 'var(--dockie-primary)';
            }
        }
        // Re-attach hamburger logic if needed, or rely on main.js delegated event
        // Assuming main.js handles hamburger clicks globally or we trigger it here
        if (window.initMobileMenu) window.initMobileMenu();
    },
    loadFooter: function () {
        document.getElementById('footer-placeholder').innerHTML = this.footer;
    }
};
