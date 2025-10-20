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