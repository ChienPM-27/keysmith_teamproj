// ==================== ANALYTICS TABS ==================== 
function initializeAnalyticsTabs() {
    const btns = document.querySelectorAll('.analytics-tab-btn');
    const contents = document.querySelectorAll('.analytics-tab-content');

    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab; // Nhanh hơn getAttribute
            
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab)?.classList.add('active');
        });
    });
}

// Quan sát và tự động khởi tạo
const obs = new MutationObserver(() => {
    if (document.querySelector('.analytics-tab-btn')) {
        initializeAnalyticsTabs();
        obs.disconnect();
    }
});

document.body ? obs.observe(document.body, { childList: true, subtree: true })
              : document.addEventListener('DOMContentLoaded', () => 
                  obs.observe(document.body, { childList: true, subtree: true }));