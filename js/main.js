// Language Data
const translations = {
    en: {
        direction: 'ltr'
    },
    ar: {
        direction: 'rtl'
    },
    fr: {
        direction: 'ltr'
    }
};

// DOM Elements
let currentLanguage = 'en';
const langButtons = document.querySelectorAll('.lang-btn');
const elementsWithTranslations = document.querySelectorAll('[data-en]');

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSwitching();
    initializeMobileMenu();
    initializeCustomTeaForm();
    initializeSmoothScrolling();

    // Determine initial language: URL param > localStorage > default 'en'
    const urlLang = getLangFromUrl();
    const storedLang = localStorage.getItem('naghma_lang');
    const initialLang = (urlLang && translations[urlLang]) ? urlLang : (storedLang && translations[storedLang]) ? storedLang : 'en';

    switchLanguage(initialLang);
});

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang');
}

function setLangInUrl(lang) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
}

// Language Switching
function initializeLanguageSwitching() {
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    // Persist and reflect in URL
    localStorage.setItem('naghma_lang', lang);
    setLangInUrl(lang);
    
    // Update active language button
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update text content
    elementsWithTranslations.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                element.setAttribute('content', translation);
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update document direction and language
    const direction = translations[lang].direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', lang);
    
    // Update body class for styling
    document.body.className = document.body.className.replace(/lang-\w+/, '');
    document.body.classList.add(`lang-${lang}`);
}

// Mobile Menu
function initializeMobileMenu() {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Custom Tea Form
function initializeCustomTeaForm() {
    const form = document.getElementById('customTeaForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const customerName = formData.get('customerName');
        const customerEmail = formData.get('customerEmail');
        const customerPhone = formData.get('customerPhone') || 'Not provided';
        const dreamTea = formData.get('dreamTea');
        const quantity = formData.get('quantity');
        const honeypot = formData.get('website');

        // Attempt server submission first
        const payload = { customerName, customerEmail, customerPhone, dreamTea, quantity, lang: currentLanguage, honeypot };

        fetch('/api/send-custom-tea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async (resp) => {
            if (!resp.ok) throw new Error(await resp.text());
            // Success via backend
            showNotification('server');
            form.reset();
        })
        .catch(() => {
            // Fallback to mailto if backend unavailable
            const { subject, message } = buildMailtoContent({ customerName, customerEmail, customerPhone, dreamTea, quantity });
            const mailtoLink = `mailto:info@naghmateas.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.location.href = mailtoLink;
            showNotification('mailto');
            form.reset();
        });
    });
}

function buildMailtoContent({ customerName, customerEmail, customerPhone, dreamTea, quantity }) {
    let subject = '';
    let message = '';
    switch(currentLanguage) {
        case 'ar':
            subject = `طلب شاي مخصص من ${customerName}`;
            message = `\nمرحبا،\n\nأرغب في طلب شاي مخصص بالمواصفات التالية:\n\nالاسم: ${customerName}\nالبريد الإلكتروني: ${customerEmail}\nرقم الهاتف: ${customerPhone}\nالكمية المطلوبة: ${quantity}\n\nوصف الشاي المرغوب:\n${dreamTea}\n\nشكراً لكم،\n${customerName}\n`;
            break;
        case 'fr':
            subject = `Demande de thé personnalisé de ${customerName}`;
            message = `\nBonjour,\n\nJe souhaite commander un thé personnalisé avec les spécifications suivantes:\n\nNom: ${customerName}\nEmail: ${customerEmail}\nTéléphone: ${customerPhone}\nQuantité désirée: ${quantity}\n\nDescription du thé souhaité:\n${dreamTea}\n\nMerci,\n${customerName}\n`;
            break;
        default:
            subject = `Custom Tea Request from ${customerName}`;
            message = `\nHello,\n\nI would like to request a custom tea blend with the following specifications:\n\nName: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nDesired Quantity: ${quantity}\n\nDream Tea Description:\n${dreamTea}\n\nThank you,\n${customerName}\n`;
    }
    return { subject, message };
}

function showNotification(mode) {
    let message = '';
    if (mode === 'server') {
        switch(currentLanguage) {
            case 'ar': message = 'تم إرسال طلبك عبر الموقع! سنعاود الاتصال بك قريباً.'; break;
            case 'fr': message = 'Votre demande a été envoyée via le site ! Nous vous recontacterons bientôt.'; break;
            default: message = 'Your request was sent via the website! We will contact you soon.';
        }
    } else {
        switch(currentLanguage) {
            case 'ar': message = 'تم فتح برنامج البريد لإرسال طلبك.'; break;
            case 'fr': message = "Votre application email s'est ouverte pour envoyer la demande."; break;
            default: message = 'Your email app opened to send the request.';
        }
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.classList.add('show'); }, 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => { document.body.removeChild(notification); }, 300);
    }, 3000);
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.product-card, .section-title, .hero-content');
    animateElements.forEach(el => observer.observe(el));
});