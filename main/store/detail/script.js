document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
});

const quantityInput = document.getElementById('quantity');
document.getElementById('increase').onclick = () => {
  quantityInput.value = parseInt(quantityInput.value) + 1;
};
document.getElementById('decrease').onclick = () => {
  if (parseInt(quantityInput.value) > 1)
    quantityInput.value = parseInt(quantityInput.value) - 1;
};
const mainImg = document.querySelector('.main-img');
  const miniImgs = document.querySelectorAll('.thumb');

  miniImgs.forEach(mini => {
    mini.addEventListener('click', () => {
      const tempSrc = mainImg.src;
      mainImg.src = mini.src;
      mini.src = tempSrc;
    });
  });

    document.addEventListener('DOMContentLoaded', function() {
      const mobileMenuToggle = document.getElementById('mobileMenuToggle');
      const navbar = document.getElementById('navbar');
      
      if (mobileMenuToggle && navbar) {
        mobileMenuToggle.addEventListener('click', function(e) {
          e.stopPropagation();
          navbar.classList.toggle('active');
          
          // Đổi icon khi menu mở/đóng
          const icon = this.querySelector('i');
          if (navbar.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
          } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        });

        // Đóng menu khi click bên ngoài
        document.addEventListener('click', function(e) {
          if (!navbar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navbar.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        });

        // Đóng menu khi click vào link
        const navLinks = navbar.querySelectorAll('a');
        navLinks.forEach(link => {
          link.addEventListener('click', function() {
            navbar.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          });
        });
      }

      // Quantity controls
      const quantityInput = document.getElementById('quantity');
      const increaseBtn = document.getElementById('increase');
      const decreaseBtn = document.getElementById('decrease');

      if (quantityInput && increaseBtn && decreaseBtn) {
        increaseBtn.onclick = () => {
          quantityInput.value = parseInt(quantityInput.value) + 1;
        };
        
        decreaseBtn.onclick = () => {
          if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
          }
        };
      }

      // Image switcher
      const mainImg = document.querySelector('.main-img');
      const miniImgs = document.querySelectorAll('.thumb');

      if (mainImg && miniImgs.length > 0) {
        miniImgs.forEach(mini => {
          mini.addEventListener('click', () => {
            mainImg.src = mini.src;
          });
        });
      }
    });