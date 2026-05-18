const TECHSTORE_CART_KEY = "techstore-cart";
const TECHSTORE_THEME_KEY = "techstore-theme";
let techStoreCart = loadTechStoreCart();
let techStoreToastTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeTechStorefront();
});

window.TechStoreStore = {
    getCart: () => [...techStoreCart],
    getCartCount: getTechStoreCartCount,
    getCartTotal: getTechStoreCartTotal,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    openCartSidebar,
    closeCartSidebar,
    applyThemePreference
};

function initializeTechStorefront() {
    mountCartSidebar();
    setupCartDelegation();
    setupCartTriggers();
    setupThemeToggle();
    renderCartState();
}

function loadTechStoreCart() {
    try {
        const nextCart = localStorage.getItem(TECHSTORE_CART_KEY);
        const legacyCart = localStorage.getItem("cart");
        const source = nextCart || legacyCart || "[]";
        const parsed = JSON.parse(source);
        const normalized = Array.isArray(parsed)
            ? parsed
                .map(normalizeCartItem)
                .filter(Boolean)
            : [];

        if (!nextCart && legacyCart) {
            localStorage.setItem(TECHSTORE_CART_KEY, JSON.stringify(normalized));
        }

        return normalized;
    } catch (error) {
        return [];
    }
}

function normalizeCartItem(item) {
    if (!item || typeof item !== "object") return null;
    if (item.id == null) return null;

    return {
        id: Number(item.id),
        nome: String(item.nome || "Produto TechStore"),
        preco: Number(item.preco || 0),
        imagem: String(item.imagem || ""),
        href: String(item.href || `produto.html?id=${item.id}`),
        quantidade: Math.max(1, Number(item.quantidade || 1))
    };
}

function persistTechStoreCart() {
    localStorage.setItem(TECHSTORE_CART_KEY, JSON.stringify(techStoreCart));
    renderCartState();
    window.dispatchEvent(new CustomEvent("techstore:cart-updated", {
        detail: {
            cart: [...techStoreCart],
            count: getTechStoreCartCount(),
            total: getTechStoreCartTotal()
        }
    }));
}

function getTechStoreCartCount() {
    return techStoreCart.reduce((sum, item) => sum + item.quantidade, 0);
}

function getTechStoreCartTotal() {
    return techStoreCart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
}

function resolveProductById(productId) {
    const data = Array.isArray(window.PRODUTOS_DATA) ? window.PRODUTOS_DATA : [];
    return data.find((product) => Number(product.id) === Number(productId)) || null;
}

function createCartProduct(product) {
    if (typeof product === "number" || typeof product === "string") {
        product = resolveProductById(product);
    }

    if (!product) return null;

    return normalizeCartItem({
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        imagem: product.imagem,
        href: product.href || `produto.html?id=${product.id}`,
        quantidade: 1
    });
}

function addProductToCart(productInput, options = {}) {
    const product = createCartProduct(productInput);
    if (!product) return;

    const existingItem = techStoreCart.find((item) => item.id === product.id);

    if (existingItem) {
        existingItem.quantidade += 1;
    } else {
        techStoreCart.push(product);
    }

    persistTechStoreCart();
    showStoreToast(`${product.nome} adicionado a sua bag.`);

    if (options.openCart !== false) {
        openCartSidebar();
    }
}

function updateProductQuantity(productId, delta) {
    const item = techStoreCart.find((entry) => entry.id === Number(productId));
    if (!item) return;

    item.quantidade += Number(delta);

    if (item.quantidade <= 0) {
        removeProductFromCart(productId, { silent: true });
        return;
    }

    persistTechStoreCart();
}

function removeProductFromCart(productId, options = {}) {
    techStoreCart = techStoreCart.filter((item) => item.id !== Number(productId));
    persistTechStoreCart();

    if (!options.silent) {
        showStoreToast("Item removido da sua bag.");
    }
}

function mountCartSidebar() {
    if (document.getElementById("storeCartSidebar")) return;

    const overlay = document.createElement("div");
    overlay.className = "store-cart-overlay";
    overlay.id = "storeCartOverlay";

    const sidebar = document.createElement("aside");
    sidebar.className = "store-cart-sidebar";
    sidebar.id = "storeCartSidebar";
    sidebar.setAttribute("aria-hidden", "true");
    sidebar.innerHTML = `
        <div class="store-cart-header">
            <h3><i class="fa-solid fa-bag-shopping"></i> Sua bag</h3>
            <button class="store-cart-close" type="button" id="storeCartClose" aria-label="Fechar bag">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="store-cart-items" id="storeCartItems"></div>
        <div class="store-cart-empty" id="storeCartEmpty">
            <i class="fa-solid fa-bag-shopping"></i>
            <p>Sua bag esta vazia no momento.</p>
            <span>Adicione um produto para acompanhar quantidades e total.</span>
        </div>
        <div class="store-cart-footer" id="storeCartFooter">
            <div class="store-cart-total">
                <span>Total</span>
                <strong id="storeCartTotal">R$ 0,00</strong>
            </div>
            <button class="store-checkout-btn" type="button" id="storeCheckoutButton">
                Finalizar compra
            </button>
        </div>
    `;

    document.body.append(overlay, sidebar);

    overlay.addEventListener("click", closeCartSidebar);
    sidebar.querySelector("#storeCartClose").addEventListener("click", closeCartSidebar);
    sidebar.querySelector("#storeCheckoutButton").addEventListener("click", () => {
        if (!techStoreCart.length) {
            showStoreToast("Sua bag ainda esta vazia.");
            return;
        }

        showStoreToast("Checkout pronto para a proxima etapa.");
    });

    sidebar.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-cart-action]");
        if (!actionButton) return;

        const productId = Number(actionButton.dataset.productId);
        const action = actionButton.dataset.cartAction;

        if (action === "increase") {
            updateProductQuantity(productId, 1);
        }

        if (action === "decrease") {
            updateProductQuantity(productId, -1);
        }

        if (action === "remove") {
            removeProductFromCart(productId);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeCartSidebar();
        }
    });
}

function renderCartState() {
    const bagCountElements = document.querySelectorAll("#bagCount, [data-bag-count]");
    const bagButtons = document.querySelectorAll("#bagButton, [data-bag-button]");
    const itemsContainer = document.getElementById("storeCartItems");
    const emptyState = document.getElementById("storeCartEmpty");
    const footer = document.getElementById("storeCartFooter");
    const totalElement = document.getElementById("storeCartTotal");
    const totalItems = getTechStoreCartCount();

    bagCountElements.forEach((element) => {
        element.textContent = String(totalItems);
    });

    bagButtons.forEach((button) => {
        const label = totalItems === 1 ? "1 item na sua bag" : `${totalItems} itens na sua bag`;
        button.setAttribute("aria-label", label);
    });

    if (!itemsContainer || !emptyState || !footer || !totalElement) return;

    if (!techStoreCart.length) {
        itemsContainer.innerHTML = "";
        emptyState.style.display = "grid";
        footer.style.display = "none";
        totalElement.textContent = "R$ 0,00";
        return;
    }

    itemsContainer.innerHTML = techStoreCart.map((item) => `
        <article class="store-cart-item">
            <a class="store-cart-thumb" href="${item.href}">
                <img src="${item.imagem}" alt="${item.nome}">
            </a>
            <div class="store-cart-copy">
                <a class="store-cart-name" href="${item.href}">${item.nome}</a>
                <span class="store-cart-price">R$ ${formatStoreCurrency(item.preco)}</span>
                <div class="store-cart-controls">
                    <button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Diminuir quantidade">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span>${item.quantidade}</span>
                    <button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Aumentar quantidade">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="store-cart-remove" type="button" data-cart-action="remove" data-product-id="${item.id}" aria-label="Remover item">
                <i class="fa-solid fa-trash"></i>
            </button>
        </article>
    `).join("");

    emptyState.style.display = "none";
    footer.style.display = "block";
    totalElement.textContent = `R$ ${formatStoreCurrency(getTechStoreCartTotal())}`;
}

function openCartSidebar() {
    const overlay = document.getElementById("storeCartOverlay");
    const sidebar = document.getElementById("storeCartSidebar");
    if (!overlay || !sidebar) return;

    renderCartState();
    overlay.classList.add("is-active");
    sidebar.classList.add("is-active");
    sidebar.setAttribute("aria-hidden", "false");
    document.body.classList.add("store-cart-open");
    document.querySelectorAll("#bagButton, [data-bag-button]").forEach((button) => {
        button.setAttribute("aria-expanded", "true");
    });
}

function closeCartSidebar() {
    const overlay = document.getElementById("storeCartOverlay");
    const sidebar = document.getElementById("storeCartSidebar");
    if (!overlay || !sidebar) return;

    overlay.classList.remove("is-active");
    sidebar.classList.remove("is-active");
    sidebar.setAttribute("aria-hidden", "true");
    document.body.classList.remove("store-cart-open");
    document.querySelectorAll("#bagButton, [data-bag-button]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
    });
}

function setupCartTriggers() {
    document.querySelectorAll("#bagButton, [data-bag-button]").forEach((button) => {
        if (button.dataset.cartBound === "true") return;
        button.dataset.cartBound = "true";
        button.setAttribute("aria-controls", "storeCartSidebar");
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", openCartSidebar);
    });
}

function setupCartDelegation() {
    if (document.body.dataset.storeDelegationReady === "true") return;
    document.body.dataset.storeDelegationReady = "true";

    document.addEventListener("click", (event) => {
        const addButton = event.target.closest("[data-add-product-id]");
        if (addButton) {
            const product = resolveProductById(addButton.dataset.addProductId);
            if (product) {
                addProductToCart(product, {
                    openCart: addButton.dataset.openCart !== "false"
                });
            }
            return;
        }

        const openBagButton = event.target.closest("[data-open-bag]");
        if (openBagButton) {
            openCartSidebar();
        }
    });
}

function resolveInitialTheme() {
    const savedTheme = localStorage.getItem(TECHSTORE_THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setupThemeToggle() {
    const toggleButtons = document.querySelectorAll("#themeToggle, [data-theme-toggle]");
    if (!toggleButtons.length) return;

    applyThemePreference(resolveInitialTheme(), false);

    toggleButtons.forEach((button) => {
        if (button.dataset.themeBound === "true") return;
        button.dataset.themeBound = "true";
        button.addEventListener("click", () => {
            const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
            applyThemePreference(nextTheme, true);
        });
    });

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener?.("change", (event) => {
        if (localStorage.getItem(TECHSTORE_THEME_KEY)) return;
        applyThemePreference(event.matches ? "light" : "dark", false);
    });
}

function applyThemePreference(theme, persist = true) {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    if (persist) {
        localStorage.setItem(TECHSTORE_THEME_KEY, theme);
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute("content", theme === "light" ? "#f4f8ff" : "#07111f");
    }

    document.querySelectorAll("#themeToggle, [data-theme-toggle]").forEach((button) => {
        button.setAttribute("aria-pressed", String(theme === "light"));
        const icon = button.querySelector("i");
        if (icon) {
            icon.className = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    });

    window.dispatchEvent(new CustomEvent("techstore:theme-changed", {
        detail: { theme }
    }));
}

function showStoreToast(message) {
    const existingToast = document.getElementById("toastNote");
    const existingMessage = document.getElementById("toastMessage");

    if (existingToast && existingMessage) {
        existingMessage.textContent = message;
        existingToast.classList.add("is-visible");
        window.clearTimeout(techStoreToastTimer);
        techStoreToastTimer = window.setTimeout(() => existingToast.classList.remove("is-visible"), 2800);
        return;
    }

    let toast = document.getElementById("storeToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "storeToast";
        toast.className = "store-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(techStoreToastTimer);
    techStoreToastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function formatStoreCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
