const btn_top = document.getElementById("btn-top");

btn_top.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
});