const products = [
  {
    id: 1,
    name: "Akıllı Priz",
    description: "Uzaktan kontrol, zamanlayıcı desteği.",
    category: "Akıllı Ev",
    badge: "Yeni",
  },
  {
    id: 2,
    name: "Bluetooth Hoparlör",
    description: "Güçlü bas, kompakt tasarım.",
    category: "Ses",
    badge: "Popüler",
  },
  {
    id: 3,
    name: "Powerbank 20.000 mAh",
    description: "Hızlı şarj, çift USB çıkışı.",
    category: "Güç",
    badge: "Stokta",
  },
  {
    id: 4,
    name: "Wi-Fi Kamera",
    description: "Gece görüş, mobil bildirim.",
    category: "Güvenlik",
    badge: "Kurulum",
  },
  {
    id: 5,
    name: "Kablosuz Kulaklık",
    description: "Gürültü azaltma, 30 saat pil.",
    category: "Ses",
    badge: "Yeni",
  },
  {
    id: 6,
    name: "Akıllı Sensör Seti",
    description: "Kapı/pencere ve hareket algılama.",
    category: "Akıllı Ev",
    badge: "Set",
  },
];

const categoryList = ["Tümü", ...new Set(products.map((item) => item.category))];

const createCard = (item) => {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <h3>${item.name}</h3>
    <p>${item.description}</p>
    <div class="product-meta">
      <span>${item.category}</span>
      <span>${item.badge}</span>
    </div>
    <a class="link" href="contact.html">Fiyat sor</a>
  `;
  return card;
};

const renderFeatured = () => {
  const featuredGrid = document.getElementById("featured-grid");
  if (!featuredGrid) return;
  products.slice(0, 3).forEach((item) => {
    const mini = document.createElement("div");
    mini.className = "mini-card";
    mini.innerHTML = `
      <p class="mini-title">${item.name}</p>
      <span class="mini-badge">${item.category}</span>
    `;
    featuredGrid.appendChild(mini);
  });
};

const renderProducts = () => {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  products.forEach((item) => grid.appendChild(createCard(item)));
};

const renderCategories = () => {
  const filterRow = document.getElementById("category-filters");
  const grid = document.getElementById("category-grid");
  if (!filterRow || !grid) return;

  const renderGrid = (selected) => {
    grid.innerHTML = "";
    products
      .filter((item) => selected === "Tümü" || item.category === selected)
      .forEach((item) => grid.appendChild(createCard(item)));
  };

  categoryList.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter";
    button.textContent = category;
    if (category === "Tümü") button.classList.add("active");

    button.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderGrid(category);
    });

    filterRow.appendChild(button);
  });

  renderGrid("Tümü");
};

renderFeatured();
renderProducts();
renderCategories();
