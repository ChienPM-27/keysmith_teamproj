// ------------------- CONTACT MODAL FUNCTIONALITY -------------------
const contactLink = document.getElementById('contactLink');
const contactModalOverlay = document.getElementById('contactModalOverlay');
const closeContactModal = document.getElementById('closeContactModal');
const header = document.getElementById('header');
const body = document.body;

// Open Contact Modal
if (contactLink) {
    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show modal
        contactModalOverlay.classList.add('active');
        
        // Change header style to contact mode
        header.classList.add('contact-mode');
        
        // Prevent body scroll
        body.style.overflow = 'hidden';
        
        // Close mobile menu if open
        const nav = document.getElementById('navbar');
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    });
}

// Close Contact Modal Function
function closeContactModalFunc() {
    // Hide modal
    contactModalOverlay.classList.remove('active');
    
    // Remove contact mode from header
    header.classList.remove('contact-mode');
    
    // Restore body scroll
    body.style.overflow = '';
}

// Close button click
if (closeContactModal) {
    closeContactModal.addEventListener('click', closeContactModalFunc);
}

// Close modal when clicking outside
if (contactModalOverlay) {
    contactModalOverlay.addEventListener('click', (e) => {
        if (e.target === contactModalOverlay) {
            closeContactModalFunc();
        }
    });
}

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModalOverlay.classList.contains('active')) {
        closeContactModalFunc();
    }
});