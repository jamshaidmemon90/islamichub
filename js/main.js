// Global functionality

document.addEventListener('DOMContentLoaded', () => {
    // Theme initialization
    initTheme();

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            // Toggle icon (hamburger to close)
            if (navMenu.classList.contains('show')) {
                mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            } else {
                mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
            }
        });
    }

    // Scroll to Top Button setup
    setupScrollToTop();
    
    // Islamic Date setup
    initIslamicDate();
});

function formatHijri(date) {
    try {
        return new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch (e) {
        return 'Islamic Date';
    }
}

function initIslamicDate() {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;

    const container = document.createElement('div');
    container.className = 'hijri-container';

    const btn = document.createElement('button');
    btn.id = 'hijri-date-btn';
    btn.className = 'hijri-date-btn';
    btn.title = 'Click to adjust Islamic date';
    
    const dropdown = document.createElement('div');
    dropdown.id = 'hijri-dropdown';
    dropdown.className = 'hijri-dropdown';
    
    container.appendChild(btn);
    container.appendChild(dropdown);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        navContainer.insertBefore(container, themeToggle);
    } else {
        navContainer.appendChild(container);
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('show');
        dropdown.classList.toggle('show', !isOpen);
        btn.classList.toggle('active', !isOpen);
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        btn.classList.remove('active');
    });

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    updateAllHijriDates();
}

function populateDropdownOptions() {
    const dropdown = document.getElementById('hijri-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<div class="hijri-dropdown-title">Adjust Hijri Date</div>';
    
    const currentOffset = parseInt(localStorage.getItem('hijri_offset') || '-1');
    const offsets = [
        { value: -2, label: '-2 Days' },
        { value: -1, label: '-1 Day' },
        { value: 0, label: 'Standard (0)' },
        { value: 1, label: '+1 Day' },
        { value: 2, label: '+2 Days' }
    ];
    
    offsets.forEach(opt => {
        const optionBtn = document.createElement('button');
        optionBtn.className = `hijri-option-btn${opt.value === currentOffset ? ' active' : ''}`;
        optionBtn.dataset.offset = opt.value;
        
        const previewDate = new Date();
        previewDate.setDate(previewDate.getDate() + opt.value);
        const formattedPreview = formatHijri(previewDate);
        
        optionBtn.innerHTML = `
            <span>${opt.label}</span>
            <span class="offset-preview">${formattedPreview}</span>
        `;
        
        optionBtn.addEventListener('click', () => {
            localStorage.setItem('hijri_offset', opt.value.toString());
            updateAllHijriDates();
            
            const event = new CustomEvent('hijriOffsetChanged', { detail: { offset: opt.value } });
            window.dispatchEvent(event);
            
            const dropdownEl = document.getElementById('hijri-dropdown');
            const btnEl = document.getElementById('hijri-date-btn');
            if (dropdownEl) dropdownEl.classList.remove('show');
            if (btnEl) btnEl.classList.remove('active');
        });
        
        dropdown.appendChild(optionBtn);
    });
}

function updateAllHijriDates() {
    const btn = document.getElementById('hijri-date-btn');
    if (!btn) return;
    
    const today = new Date();
    const offset = parseInt(localStorage.getItem('hijri_offset') || '-1');
    today.setDate(today.getDate() + offset);
    
    const formattedDate = formatHijri(today);
    
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>${formattedDate}</span>
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
    `;
    
    populateDropdownOptions();
}

// Theme Management
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Check localStorage for saved theme, default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.body.getAttribute('data-theme');
        if (theme === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateThemeIcon('light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon('dark');
        }
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    
    if (theme === 'dark') {
        // Sun icon for dark mode (to switch to light)
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
        // Moon icon for light mode (to switch to dark)
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
}

function setupScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
    
    // Add simple styles directly or assume they are in CSS
    Object.assign(scrollBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-md)',
        zIndex: '1000',
        transition: 'var(--transition)'
    });

    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
