const btn_top = document.getElementById("btn-top");

btn_top.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
});

const pro_container = document.getElementById("pro-container");

fetch("../../json/products.json")
    .then(response => response.json())
    .then(data => {
        data.forEach(product => {
            if (product == null)
                return;
            const pro = document.createElement("div");
            pro.className = "pro";
            pro_container.appendChild(pro);

            const img = document.createElement("img");
            img.src = product.image;
            pro.appendChild(img);

            const div = document.createElement("div");
            div.className = "des";
            pro.appendChild(div);
            const span = document.createElement("span");
            span.textContent = product.name;
            const h4 = document.createElement("h4");
            h4.textContent = product.category;
            const h5 = document.createElement("h5");
            h5.textContent = "$" + product.price;
            div.appendChild(span);
            div.appendChild(h4);
            div.appendChild(h5);

            const a = document.createElement("a");
            a.href = "#";
            a.className = "buy";
            pro.appendChild(a);
            const i = document.createElement("i");
            i.className = "fa-solid fa-cart-shopping";
            a.appendChild(i);
        });
    })
    .catch(error => console.error("Lỗi khi đọc JSON:", error));