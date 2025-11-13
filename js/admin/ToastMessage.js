/* toast.js
 A small toast notification manager.
 Usage:
   showToast('Hello', 'success', { duration: 3000 });
   toastManager.show('Info', 'info');
*/

// Immediately create the manager
(function () {
  class ToastManager {
    constructor() {
      this.container = null;
      this.defaultDuration = 3500;
      this.gap = 8; // px gap between toasts
      this.maxToasts = 5;
      this._initContainer();
    }

    _initContainer() {
      if (this.container) return;
      const existing = document.getElementById('ks-toast-container');
      if (existing) {
        this.container = existing;
        return;
      }
      const div = document.createElement('div');
      div.id = 'ks-toast-container';
      // basic container styles (so it works if user hasn't added CSS yet)
      div.style.position = 'fixed';
      div.style.right = '20px';
      div.style.bottom = '20px';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.gap = `${this.gap}px`;
      div.style.zIndex = '2147483647';
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'false');
      document.body.appendChild(div);
      this.container = div;
    }

    show(message = '', type = 'info', opts = {}) {
      if (!this.container) this._initContainer();
      const duration = typeof opts.duration === 'number' ? opts.duration : this.defaultDuration;
      const id = 'ks-toast-' + Date.now() + Math.floor(Math.random() * 1000);

      const toast = document.createElement('div');
      toast.className = `ks-toast ks-toast-${type}`;
      toast.id = id;
      toast.style.minWidth = '220px';
      toast.style.maxWidth = '360px';
      toast.style.padding = '12px 14px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.32)';
      toast.style.fontFamily = 'Inter, Roboto, Poppins, sans-serif';
      toast.style.fontSize = '14px';
      toast.style.pointerEvents = 'auto';
      toast.style.overflow = 'hidden';
      toast.style.display = 'flex';
      toast.style.flexDirection = 'column';
      toast.style.opacity = '0';
      toast.style.transition = 'transform 220ms ease, opacity 220ms ease';
      toast.style.transform = 'translateY(6px)';

      // content
      const text = document.createElement('div');
      text.className = 'ks-toast-message';
      text.style.marginBottom = '8px';
      text.textContent = message;
      toast.appendChild(text);

      // progress bar wrapper
      const progWrap = document.createElement('div');
      progWrap.className = 'ks-toast-progress';
      progWrap.style.height = '4px';
      progWrap.style.background = 'rgba(255,255,255,0.12)';
      progWrap.style.borderRadius = '4px';
      progWrap.style.overflow = 'hidden';
      progWrap.style.marginTop = '6px';
      progWrap.style.flex = '0 0 auto';

      const progBar = document.createElement('div');
      progBar.className = 'ks-toast-progress-bar';
      progBar.style.height = '100%';
      progBar.style.width = '100%';
      progBar.style.transformOrigin = 'left';
      progBar.style.transition = `transform ${duration}ms linear`;
      progWrap.appendChild(progBar);
      toast.appendChild(progWrap);

      // close button
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ks-toast-close';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.position = 'absolute';
      closeBtn.style.right = '8px';
      closeBtn.style.top = '6px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'inherit';
      closeBtn.style.fontSize = '16px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.opacity = '0.85';
      closeBtn.style.padding = '4px';
      closeBtn.addEventListener('click', () => this._removeToast(toast));
      toast.appendChild(closeBtn);

      // set color theme by type
      const colorMap = {
        success: { bg: 'linear-gradient(90deg,#0f8b4a,#17bf6f)', text: '#fff', bar: 'rgba(255,255,255,0.9)' },
        info: { bg: 'linear-gradient(90deg,#1e6fff,#4da6ff)', text: '#fff', bar: 'rgba(255,255,255,0.9)' },
        error: { bg: 'linear-gradient(90deg,#ff4d4d,#ff6b6b)', text: '#fff', bar: 'rgba(255,255,255,0.9)' },
        warn: { bg: 'linear-gradient(90deg,#ffb86b,#ff8c1a)', text: '#111', bar: 'rgba(0,0,0,0.12)' },
      };
      const theme = colorMap[type] || colorMap.info;
      toast.style.background = theme.bg;
      toast.style.color = theme.text;
      progBar.style.background = theme.bar;

      // keep stacking limit
      if (this.container.children.length >= this.maxToasts) {
        // remove the oldest
        const first = this.container.children[0];
        if (first) this._removeToast(first);
      }

      // insert at end (stack up)
      this.container.appendChild(toast);

      // entrance animation
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        // start progress
        requestAnimationFrame(() => {
          progBar.style.transform = `translateX(-100%)`;
        });
      });

      // auto remove
      const timer = setTimeout(() => {
        this._removeToast(toast);
      }, duration + 60);

      // pause on hover
      let paused = false;
      let remaining = duration;
      let start = Date.now();
      toast.addEventListener('mouseenter', () => {
        if (paused) return;
        paused = true;
        // compute remaining time
        const elapsed = Date.now() - start;
        remaining = Math.max(0, duration - elapsed);
        // freeze progress bar
        progBar.style.transition = 'none';
        const computed = (elapsed / duration) * 100;
        progBar.style.transform = `translateX(-${computed}%)`;
        clearTimeout(timer);
      });
      toast.addEventListener('mouseleave', () => {
        if (!paused) return;
        paused = false;
        start = Date.now();
        // resume progress
        // set immediate style to trigger transition
        setTimeout(() => {
          progBar.style.transition = `transform ${remaining}ms linear`;
          progBar.style.transform = `translateX(-100%)`;
        }, 20);
        // set new removal timer
        setTimeout(() => {
          this._removeToast(toast);
        }, remaining + 50);
      });

      return id;
    }

    _removeToast(el) {
      if (!el || !el.parentNode) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 220);
    }
  }

  // create manager single instance
  const manager = new ToastManager();

  // expose
  window.toastManager = manager;

  // provide global showToast helper (can be used by older code)
  window.showToast = function (message = '', type = 'info', opts = {}) {
    try {
      return window.toastManager.show(message, type, opts);
    } catch (e) {
      // fallback simple alert if something broken
      try { console.error(e); } catch (err) {}
      alert(message);
      return null;
    }
  };
})();
