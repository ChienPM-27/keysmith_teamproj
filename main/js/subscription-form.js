document.getElementById("subscribeForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;
  const button = form.querySelector("button");
  const originalText = button.textContent;


  button.textContent = "SENDING...";
  button.disabled = true;
  button.style.background = "#888";

  try {
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      // Thành công
      button.textContent = "SENT!";
      button.style.background = "#28a745";
      button.style.color = "#fff";
    } else {
      // Lỗi
      button.textContent = "TRY AGAIN";
      button.style.background = "#dc3545";
      button.disabled = false;
    }
  } catch (error) {
    button.textContent = "ERROR!";
    button.style.background = "#dc3545";
    button.disabled = false;
  }

  // Sau 3 giây, trở về trạng thái ban đầu
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = "#333";
    button.disabled = false;
  }, 3000);
});