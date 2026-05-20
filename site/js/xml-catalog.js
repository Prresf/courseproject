const XML_PATH = "data/products.xml";

const CATEGORY_MAP = {
  "cat-1": "cakes",
  "cat-2": "cupcakes",
  "cat-3": "desserts",
};

const CATEGORY_NAMES = {
  "cat-1": "Торты",
  "cat-2": "Капкейки",
  "cat-3": "Десерты",
};

const PRODUCT_IMAGES = {
  "p-001":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80",
  "p-002":
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop&q=80",
  "p-003":
    "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&auto=format&fit=crop&q=80",
  "p-004":
    "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&auto=format&fit=crop&q=80",
  "p-005":
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&auto=format&fit=crop&q=80",
  "p-006":
    "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&auto=format&fit=crop&q=80",
  "p-007":
    "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&auto=format&fit=crop&q=80",
  "p-008":
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&auto=format&fit=crop&q=80",
  "p-009":
    "https://images.unsplash.com/photo-1602351447937-745cb720612f?w=400&auto=format&fit=crop&q=80",
};

const PRODUCT_IMAGES_LARGE = {
  "p-001":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80",
};

let productsData = [];

function parseXML(xml) {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, "application/xml");
  const errorNode = document.querySelector("parsererror");
  if (errorNode) {
    console.error("Ошибка парсинга XML:", errorNode.textContent);
    return [];
  }

  const products = [];
  const productElements = document.querySelectorAll("product");

  productElements.forEach((productElement) => {
    const productId = productElement.getAttribute("id");
    const categoryId = productElement.getAttribute("category");
    const priceValue =
      productElement.querySelector("price")?.textContent || "0";
    const currency =
      productElement.querySelector("price")?.getAttribute("currency") || "BYN";

    const product = {
      productId: productId,
      category: CATEGORY_MAP[categoryId] || "cakes",
      categoryName: CATEGORY_NAMES[categoryId] || "Торты",
      name: productElement.querySelector("name")?.textContent || "",
      price: parseFloat(priceValue),
      priceFormatted: priceValue + " " + currency,
      weight: productElement.querySelector("weight")?.textContent || "",
      weightUnit:
        productElement.querySelector("weight")?.getAttribute("unit") || "г",
      rating: productElement.querySelector("rating")?.textContent || "0",
      reviews: productElement.querySelector("reviews")?.textContent || "0",
      description:
        productElement.querySelector("description")?.textContent || "",
      ingredients: [],
      nutrition: {},
      tags: [],
      image:
        PRODUCT_IMAGES[productId] ||
        "images/" +
          (
            productElement.querySelector("image")?.textContent ||
            "placeholder.jpg"
          )
            .split("/")
            .pop(),
    };

    productElement.querySelectorAll("ingredients item").forEach((item) => {
      product.ingredients.push(item.textContent);
    });

    const nutritionElement = productElement.querySelector("nutrition");
    if (nutritionElement) {
      product.nutrition = {
        calories: nutritionElement.querySelector("calories")?.textContent || "",
        proteins: nutritionElement.querySelector("proteins")?.textContent || "",
        fats: nutritionElement.querySelector("fats")?.textContent || "",
        carbs: nutritionElement.querySelector("carbs")?.textContent || "",
      };
    }

    productElement.querySelectorAll("tags tag").forEach((tag) => {
      product.tags.push(tag.textContent);
    });

    products.push(product);
  });

  return products;
}

function loadXMLCatalog(callback) {
  fetch(XML_PATH)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Не удалось загрузить " + XML_PATH + ": " + response.status,
        );
      }
      return response.text();
    })
    .then((xmlString) => {
      productsData = parseXML(xmlString);
      callback(productsData);
    })
    .catch((error) => {
      console.error("Ошибка загрузки XML-каталога:", error);
    });
}

function renderCatalogCards(products) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  grid.innerHTML = products
    .map((product) => {
      const badgeClass = product.tags.includes("Хит")
        ? "badge--hit"
        : product.tags.includes("Сезонный вкус")
          ? "badge--season"
          : "";
      const badgeText = product.tags.includes("Хит")
        ? "Хит"
        : product.tags.includes("Сезонный вкус")
          ? "Сезонный вкус"
          : "";
      const badge = badgeClass
        ? '<span class="badge ' + badgeClass + '">' + badgeText + "</span>"
        : "";

      const buttonLabel = product.description ? "В корзину" : "Подробнее";
      const buttonAction = product.description
        ? 'data-add="' +
          product.productId +
          '" data-name="' +
          escapeHtml(product.name) +
          '" data-price="' +
          product.price +
          '"'
        : "onclick=\"window.location.href='product.html?id=" +
          product.productId +
          "'\"";

      const shortDesc =
        product.description.length > 80
          ? product.description.substring(0, 80) + "..."
          : product.description;

      return (
        '<article class="catalog__card" data-category="' +
        product.category +
        '" data-price="' +
        product.price +
        '">' +
        '<img src="' +
        product.image +
        '" alt="' +
        escapeHtml(product.name) +
        '" class="catalog__card-img" loading="lazy">' +
        '<div class="catalog__card-header">' +
        "<h3>" +
        escapeHtml(product.name) +
        "</h3>" +
        '<span class="price">' +
        product.priceFormatted +
        "</span>" +
        "</div>" +
        badge +
        "<p>" +
        escapeHtml(shortDesc) +
        "</p>" +
        '<button type="button" class="btn btn--primary btn--small" ' +
        buttonAction +
        ">" +
        buttonLabel +
        "</button>" +
        "</article>"
      );
    })
    .join("");
}

function renderProductPage(product) {
  if (!product) return;

  const titleElement = document.getElementById("product-title");
  if (titleElement) titleElement.textContent = product.name;

  document.title = product.name + " — Тортики от Юлии";

  const priceElement = document.querySelector(".product__info .price");
  if (priceElement) priceElement.textContent = product.priceFormatted;

  const descElement = document.querySelector(".product__info .desc");
  if (descElement) descElement.textContent = product.description;

  const addButton = document.getElementById("add-to-cart");
  if (addButton) {
    addButton.dataset.id = product.productId;
    addButton.dataset.name = product.name;
    addButton.dataset.price = product.price;
  }

  const mainImage = document.querySelector(".product__gallery-main img");
  if (mainImage) {
    mainImage.src =
      PRODUCT_IMAGES_LARGE[product.productId] ||
      product.image.replace("w=400", "w=1200");
    mainImage.alt = product.name;
  }

  const ratingNumber = document.querySelector(".rating span");
  if (ratingNumber) ratingNumber.textContent = product.rating;

  const reviewsNumber = document.querySelector(".rating small");
  if (reviewsNumber)
    reviewsNumber.textContent = "(" + product.reviews + " отзывов)";

  const tagsContainer = document.querySelector(".product__info .tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = product.tags
      .map((tag) => '<span class="tag-pill">' + escapeHtml(tag) + "</span>")
      .join("");
  }

  const ingredientDetails = document.querySelector(
    "details:first-of-type .detail-content",
  );
  if (ingredientDetails && product.ingredients.length > 0) {
    let content = "<p>" + escapeHtml(product.ingredients.join(", ")) + ".</p>";
    if (product.nutrition.calories) {
      content +=
        "<table><tbody>" +
        "<tr><td>Калории</td><td>" +
        product.nutrition.calories +
        " ккал</td></tr>" +
        "<tr><td>Белки</td><td>" +
        product.nutrition.proteins +
        " г</td></tr>" +
        "<tr><td>Жиры</td><td>" +
        product.nutrition.fats +
        " г</td></tr>" +
        "<tr><td>Углеводы</td><td>" +
        product.nutrition.carbs +
        " г</td></tr>" +
        "</tbody></table>";
    }
    ingredientDetails.innerHTML = content;
  }

  const badgeElement = document.querySelector(".product__info-top .badge");
  if (badgeElement) {
    if (product.tags.includes("Хит")) {
      badgeElement.className = "badge badge--hit";
      badgeElement.textContent = "Хит";
    } else if (product.tags.includes("Сезонный вкус")) {
      badgeElement.className = "badge badge--season";
      badgeElement.textContent = "Сезонный вкус";
    } else {
      badgeElement.remove();
    }
  }

  const relatedGrid = document.querySelector(".related-grid");
  if (relatedGrid) {
    const relatedProducts = productsData
      .filter(
        (relatedProduct) => relatedProduct.productId !== product.productId,
      )
      .slice(0, 3);
    relatedGrid.innerHTML = relatedProducts
      .map(
        (relatedProduct) =>
          '<article class="card">' +
          '<div class="catalog__card-header">' +
          "<h3>" +
          escapeHtml(relatedProduct.name) +
          "</h3>" +
          '<span class="price">' +
          relatedProduct.priceFormatted +
          "</span>" +
          "</div>" +
          '<p style="font-size:0.875rem; color:#655f4c;">' +
          escapeHtml(relatedProduct.description.substring(0, 60) + "...") +
          "</p>" +
          '<button type="button" class="btn btn--secondary btn--small" data-add="' +
          relatedProduct.productId +
          '" data-name="' +
          escapeHtml(relatedProduct.name) +
          '" data-price="' +
          relatedProduct.price +
          '">В корзину</button>' +
          "</article>",
      )
      .join("");
  }
}

function initXMLCatalog() {
  const catalogPage = document.getElementById("catalog-grid");
  const productPage = document.getElementById("product-title");

  if (catalogPage) {
    loadXMLCatalog(function (products) {
      renderCatalogCards(products);
      initCatalogFilters();
    });
  }

  if (productPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "p-001";
    loadXMLCatalog(function (products) {
      const product = products.find(function (item) {
        return item.productId === productId;
      });
      if (product) {
        renderProductPage(product);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initXMLCatalog();
});
