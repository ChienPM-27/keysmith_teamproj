(function() {
    'use strict';
    
    const error404Overlay = document.getElementById('error404Overlay');
    const backHomeBtn = document.getElementById('backHomeBtn404');
    const mainContent = document.getElementById('mainContent');
    
    // Function to show 404 page
    function show404Page() {
        if (error404Overlay) {
            error404Overlay.classList.add('active');
            if (mainContent) {
                mainContent.style.display = 'none';
            }
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Function to hide 404 page
    function hide404Page() {
        if (error404Overlay) {
            error404Overlay.classList.remove('active');
            if (mainContent) {
                mainContent.style.display = 'block';
            }
            document.body.style.overflow = 'auto';
        }
    }
    
    // Back to home button
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', function() {
            hide404Page();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Handle image errors
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
        }
    }, true);
    
    // Check for broken links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && link.href.includes('404')) {
            e.preventDefault();
            show404Page();
        }
    });
    
    // Expose function globally for external use
    window.show404Page = show404Page;
    window.hide404Page = hide404Page;
    
})();