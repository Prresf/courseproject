/*1. Корзина (Cart Module)*/
const CART_KEY = "julia_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, name, price, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name, price: parseFloat(price), quantity });
  }
  saveCart(cart);
  renderCartUI();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.productId !== productId);
  saveCart(cart);
  renderCartUI();
}

function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) item.quantity = 1;
  saveCart(cart);
  renderCartUI();
}

function setQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return;
  item.quantity = Math.max(1, parseInt(quantity) || 1);
  saveCart(cart);
  renderCartUI();
}

function calculateTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function formatMoney(value) {
  return value.toFixed(2) + " BYN";
}

/*  
   2. Рендеринг корзины в интерфейсе
     */
function renderCartUI() {
  const cart = getCart();
  const total = calculateTotal();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Счётчик в шапке
  document.querySelectorAll("#cart-count").forEach((element) => {
    element.textContent = count;
    element.style.display = count > 0 ? "flex" : "none";
  });

  // Итог в боковой панели
  document.querySelectorAll("#drawer-total").forEach((element) => {
    element.textContent = formatMoney(total);
  });

  // Список в боковой панели
  const drawerLists = document.querySelectorAll("#drawer-items");
  drawerLists.forEach((list) => {
    if (cart.length === 0) {
      list.innerHTML =
        '<p style="text-align:center;color:#655f4c;padding:2rem;">Корзина пуста</p>';
    } else {
      list.innerHTML = cart
        .map(
          (item) => `
        <div class="cart-drawer__item">
          <div class="cart-drawer__item-img" style="background:#f1e7d2;"></div>
          <div class="cart-drawer__item-info">
            <h4>${escapeHtml(item.name)}</h4>
            <p>${item.quantity} шт. × ${formatMoney(item.price)}</p>
          </div>
          <div class="cart-drawer__item-price">${formatMoney(item.price * item.quantity)}</div>
          <button type="button" class="cart__item-remove" aria-label="Удалить" onclick="removeFromCart('${item.productId}')">
            <svg width="18" height="18" aria-hidden="true"><use href="svg/icons.svg#icon-trash"></use></svg>
          </button>
        </div>
      `,
        )
        .join("");
    }
  });

  // Страница корзины
  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");
  const cartSummary = document.getElementById("cart-summary");
  if (cartItems && cartEmpty && cartSummary) {
    if (cart.length === 0) {
      cartItems.style.display = "none";
      cartSummary.style.display = "none";
      cartEmpty.style.display = "block";
    } else {
      cartItems.style.display = "flex";
      cartSummary.style.display = "block";
      cartEmpty.style.display = "none";
      cartItems.innerHTML = cart
        .map(
          (item) => `
        <div class="cart__item">
          <div class="cart__item-image" style="background:#f1e7d2;"></div>
          <div class="cart__item-info">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${formatMoney(item.price)} / шт.</p>
          </div>
          <div class="cart__item-qty">
            <button type="button" aria-label="Уменьшить" onclick="updateQuantity('${item.productId}', -1)">
              <svg width="16" height="16" aria-hidden="true"><use href="svg/icons.svg#icon-minus"></use></svg>
            </button>
            <span>${item.quantity}</span>
            <button type="button" aria-label="Увеличить" onclick="updateQuantity('${item.productId}', 1)">
              <svg width="16" height="16" aria-hidden="true"><use href="svg/icons.svg#icon-plus"></use></svg>
            </button>
          </div>
          <div class="cart__item-price">${formatMoney(item.price * item.quantity)}</div>
          <button type="button" class="cart__item-remove" aria-label="Удалить" onclick="removeFromCart('${item.productId}')">
            <svg width="20" height="20" aria-hidden="true"><use href="svg/icons.svg#icon-trash"></use></svg>
          </button>
        </div>
      `,
        )
        .join("");
      const subtotalElement = document.getElementById("summary-subtotal");
      const totalElement = document.getElementById("summary-total");
      if (subtotalElement) subtotalElement.textContent = formatMoney(total);
      if (totalElement) totalElement.textContent = formatMoney(total);
    }
  }

  // Страница оформления заказа
  const checkoutItems = document.getElementById("checkout-items");
  if (checkoutItems) {
    if (cart.length === 0) {
      checkoutItems.innerHTML =
        '<p style="color:#655f4c;">Ваша корзина пуста. <a href="catalog.html" style="color:#974362;text-decoration:underline;">Перейти в каталог</a></p>';
    } else {
      checkoutItems.innerHTML = cart
        .map(
          (item) => `
        <div class="cart__item" style="background:transparent; padding:0.75rem 0; border-bottom:1px solid rgba(186,177,155,0.15);">
          <div class="cart__item-info" style="flex:1;">
            <h3 style="font-size:1rem;">${escapeHtml(item.name)}</h3>
            <p style="font-size:0.8125rem;">${item.quantity} шт.</p>
          </div>
          <div class="cart__item-price">${formatMoney(item.price * item.quantity)}</div>
        </div>
      `,
        )
        .join("");
    }
  }
  const checkoutSubtotal = document.getElementById("checkout-subtotal");
  const checkoutTotal = document.getElementById("checkout-total");
  if (checkoutSubtotal) checkoutSubtotal.textContent = formatMoney(total);
  if (checkoutTotal) checkoutTotal.textContent = formatMoney(total);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/*  
   3. Управление боковой панелью корзины
     */
function initCartDrawer() {
  const toggle = document.getElementById("cart-toggle");
  const drawer = document.getElementById("cart-drawer");
  const closeButton = document.getElementById("cart-close");
  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (toggle) toggle.addEventListener("click", openDrawer);
  if (closeButton) closeButton.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("is-open"))
      closeDrawer();
  });
}

/*  
   4. Мобильное меню
     */
function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("mobile-nav");
  const closeButton = document.getElementById("menu-close");
  if (!nav) return;

  function openMenu() {
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeButton) closeButton.addEventListener("click", closeMenu);
  nav.addEventListener("click", (event) => {
    if (event.target === nav) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open"))
      closeMenu();
  });
}

/*  
   5. Фильтры каталога
     */
function initCatalogFilters() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const checkboxes = document.querySelectorAll(
    '.catalog__filters input[type="checkbox"]',
  );
  const range = document.getElementById("price-range");
  const rangeLabel = document.getElementById("price-max");

  function filter() {
    const categories = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.dataset.filter);
    const maxPrice = range ? parseInt(range.value) : 9999;
    if (rangeLabel) rangeLabel.textContent = maxPrice + " BYN";

    grid.querySelectorAll(".catalog__card").forEach((card) => {
      const category = card.dataset.category;
      const price = parseFloat(card.dataset.price);
      const show = categories.includes(category) && price <= maxPrice;
      card.style.display = show ? "" : "none";
    });
  }

  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", filter));
  if (range) range.addEventListener("input", filter);
}

/*  
   6. Кнопки "В корзину" на страницах
     */
function initAddButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    const productId = button.dataset.add;
    const name =
      button.dataset.name ||
      button.closest("article")?.querySelector("h3")?.textContent ||
      "Товар";
    const price =
      button.dataset.price ||
      button
        .closest("article")
        ?.querySelector(".price")
        ?.textContent?.replace(/[^0-9.]/g, "") ||
      "0";
    addToCart(productId, name, price);
    // Показать боковую панель
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
  });
}

/*  
   7. Количество на странице товара
     */
function changeQuantity(delta) {
  const element = document.getElementById("qty");
  if (!element) return;
  let value = parseInt(element.textContent) || 1;
  value = Math.max(1, value + delta);
  element.textContent = value;
}

function initProductPage() {
  const addButton = document.getElementById("add-to-cart");
  if (!addButton) return;
  addButton.addEventListener("click", () => {
    const quantity = parseInt(
      document.getElementById("qty")?.textContent || "1",
    );
    addToCart(
      addButton.dataset.id,
      addButton.dataset.name,
      addButton.dataset.price,
      quantity,
    );
    const drawer = document.getElementById("cart-drawer");
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
  });
}

/*  
   8. Валидация формы оформления заказа
     */
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach((input) => {
      if (!input.value.trim()) {
        valid = false;
        input.style.boxShadow = "0 0 0 2px #ac3149";
      } else {
        input.style.boxShadow = "";
      }
    });

    if (getCart().length === 0) {
      alert("Добавьте товары в корзину перед оформлением заказа.");
      valid = false;
    }

    if (valid) {
      alert(
        "Спасибо за заказ! Мы свяжемся с вами в ближайшее время для подтверждения.",
      );
      localStorage.removeItem(CART_KEY);
      renderCartUI();
      window.location.href = "index.html";
    }
  });

  // Переключение оплаты
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".payment-option")
        .forEach((optionElement) =>
          optionElement.classList.remove("is-selected"),
        );
      option.classList.add("is-selected");
      const input = option.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });
}

/*  
   9. Кнопка "Наверх"
     */
function initScrollTop() {
  const button = document.getElementById("scroll-top");
  if (!button) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      button.classList.add("is-visible");
    } else {
      button.classList.remove("is-visible");
    }
  });
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/*  
   10. Инициализация при загрузке
     */
document.addEventListener("DOMContentLoaded", () => {
  renderCartUI();
  initCartDrawer();
  initMobileMenu();
  initCatalogFilters();
  initAddButtons();
  initProductPage();
  initCheckoutForm();
  initScrollTop();
});
