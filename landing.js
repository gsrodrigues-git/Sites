const TECHSTORE_FALLBACK = [
    {
        id: 101,
        nome: "TechStore Vision X",
        categoria: "smartphones",
        preco: 7299,
        precoAntigo: 8299,
        descricao: "Smartphone premium com IA integrada",
        descricaoLonga: "Criado para entregar velocidade, autonomia e fotos impactantes sem complicar a experiencia de uso.",
        imagem: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80",
        imagensDetalhadas: [
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1512499617640-c2f999098c01?w=900&auto=format&fit=crop&q=80"
        ],
        badge: "Novo",
        rating: 4.8,
        destaques: [
            "Fotos limpas mesmo no escuro",
            "Resposta imediata em apps e jogos",
            "Bateria para o dia inteiro"
        ],
        avaliacoes: [
            { autor: "Marina", nota: 5, texto: "Visual premium e desempenho muito acima do esperado." },
            { autor: "Paulo", nota: 4.8, texto: "A camera segura muito bem luz baixa e o sistema e fluido." }
        ]
    }
];

const COLOR_OPTIONS = [
    { id: "stellar-blue", label: "Azul Stellar", swatch: "linear-gradient(135deg, #9ae8ff, #1958c7)", glow: "rgba(79, 215, 255, 0.32)" },
    { id: "ice-silver", label: "Prata Glacial", swatch: "linear-gradient(135deg, #ffffff, #9eb4d4)", glow: "rgba(196, 225, 255, 0.28)" },
    { id: "midnight-carbon", label: "Carbon Midnight", swatch: "linear-gradient(135deg, #30394d, #05080e)", glow: "rgba(49, 84, 140, 0.32)" }
];

const ROLE_LABELS = [
    "Criadora de conteudo",
    "Designer de produto",
    "Consultor de tecnologia",
    "Fotografa mobile",
    "Usuario premium"
];

const PLACEHOLDER_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const state = {
    featuredProduct: null,
    galleryImages: [],
    activeImageIndex: 0,
    activeColor: COLOR_OPTIONS[0].id
};

document.addEventListener("DOMContentLoaded", initializeLandingPage);

function initializeLandingPage() {
    const products = getProducts();

    renderSkeletonState();
    setupMenu();
    setupLoginLinks();
    setupHeaderState();

    window.setTimeout(() => {
        hydrateLanding(products);
    }, 550);
}

function getProducts() {
    return Array.isArray(window.PRODUTOS_DATA) && window.PRODUTOS_DATA.length
        ? window.PRODUTOS_DATA
        : TECHSTORE_FALLBACK;
}

function hydrateLanding(products) {
    const featuredProduct = pickFeaturedProduct(products);
    const relatedProducts = buildRelatedProducts(products, featuredProduct);
    const testimonials = buildTestimonials(products, featuredProduct);

    state.featuredProduct = featuredProduct;
    state.galleryImages = getGalleryImages(featuredProduct);
    state.activeImageIndex = 0;

    renderHero(featuredProduct);
    renderFeaturedProduct(featuredProduct);
    renderReviewSummary(products);
    renderTestimonials(testimonials);
    renderRelatedProducts(relatedProducts);
    setupRevealObserver();
    setupScrollSpy();
    setupLazyLoading();
    setupZoomStage();

    const loader = document.getElementById("pageLoader");
    if (loader) {
        window.setTimeout(() => loader.classList.add("is-hidden"), 220);
    }
}

function pickFeaturedProduct(products) {
    return products.find((product) => product.id === 2)
        || products.find((product) => product.categoria === "smartphones")
        || products[0];
}

function getGalleryImages(product) {
    return [product.imagem, ...(product.imagensDetalhadas || [])]
        .filter(Boolean)
        .filter((image, index, array) => array.indexOf(image) === index)
        .slice(0, 4);
}

function renderSkeletonState() {
    const galleryThumbs = document.getElementById("galleryThumbs");
    const testimonialStack = document.getElementById("testimonialStack");
    const relatedGrid = document.getElementById("relatedGrid");

    if (galleryThumbs) {
        galleryThumbs.innerHTML = Array.from({ length: 4 }, () => "<div class='skeleton-thumb'></div>").join("");
    }

    if (testimonialStack) {
        testimonialStack.innerHTML = Array.from({ length: 3 }, () => "<article class='skeleton-card'></article>").join("");
    }

    if (relatedGrid) {
        relatedGrid.innerHTML = Array.from({ length: 4 }, () => "<article class='skeleton-card'></article>").join("");
    }
}

function renderHero(product) {
    const image = state.galleryImages[0] || product.imagem;
    const heroImage = document.getElementById("heroDeviceImage");
    const spotlightName = document.getElementById("heroSpotlightName");
    const spotlightText = document.getElementById("heroSpotlightText");

    if (heroImage) {
        heroImage.src = image;
        heroImage.alt = product.nome;
        heroImage.decoding = "async";
    }

    if (spotlightName) {
        spotlightName.textContent = product.nome;
    }

    if (spotlightText) {
        spotlightText.textContent = product.descricaoLonga || product.descricao;
    }
}

function renderFeaturedProduct(product) {
    document.getElementById("featuredBadge").textContent = product.badge || "TechStore premium";
    document.getElementById("featuredRating").textContent = `${formatRating(product.rating)} / 5`;
    document.getElementById("featuredName").textContent = product.nome;
    document.getElementById("featuredSummary").textContent = createBenefitSummary(product);
    document.getElementById("featuredOldPrice").textContent = product.precoAntigo ? `R$ ${formatCurrency(product.precoAntigo)}` : "";
    document.getElementById("featuredPrice").textContent = `R$ ${formatCurrency(product.preco)}`;
    document.getElementById("featuredInstallments").textContent = `ou 12x de R$ ${formatCurrency(product.preco / 12)} sem juros`;
    document.getElementById("detailsFeaturedLink").href = `produto.html?id=${product.id}`;
    document.getElementById("buyFeaturedBtn").setAttribute("aria-label", `Adicionar ${product.nome} a bag`);
    document.getElementById("buyFeaturedBtn").dataset.addProductId = String(product.id);
    document.getElementById("buyFeaturedBtn").dataset.openCart = "true";

    renderGallery(product);
    renderColorSwitcher();
    renderBenefitList(product);
    updateFeaturedImage();
    applyColor(state.activeColor);
}

function renderGallery(product) {
    const galleryThumbs = document.getElementById("galleryThumbs");

    galleryThumbs.innerHTML = state.galleryImages.map((image, index) => `
        <button class="gallery-thumb ${index === state.activeImageIndex ? "is-active" : ""}" type="button" data-gallery-index="${index}" aria-label="Ver imagem ${index + 1} de ${product.nome}">
            <img src="${image}" alt="${product.nome} - visual ${index + 1}">
        </button>
    `).join("");

    galleryThumbs.querySelectorAll("[data-gallery-index]").forEach((button) => {
        button.addEventListener("click", () => {
            state.activeImageIndex = Number(button.dataset.galleryIndex);
            updateFeaturedImage();
        });
    });
}

function renderColorSwitcher() {
    const colorSwitcher = document.getElementById("colorSwitcher");

    colorSwitcher.innerHTML = COLOR_OPTIONS.map((color) => `
        <button
            class="swatch-button"
            type="button"
            role="radio"
            aria-checked="${color.id === state.activeColor}"
            aria-label="${color.label}"
            data-color-id="${color.id}"
            style="background:${color.swatch}"
        ></button>
    `).join("");

    colorSwitcher.querySelectorAll("[data-color-id]").forEach((button) => {
        button.addEventListener("click", () => applyColor(button.dataset.colorId));
    });
}

function renderBenefitList(product) {
    const benefitList = document.getElementById("benefitList");

    benefitList.innerHTML = getBenefitItems(product).map((benefit) => `
        <article class="benefit-item">
            <i class="fa-solid ${benefit.icon}"></i>
            <div>
                <strong>${benefit.title}</strong>
                <span>${benefit.text}</span>
            </div>
        </article>
    `).join("");
}

function renderReviewSummary(products) {
    const average = products.reduce((sum, product) => sum + Number(product.rating || 0), 0) / products.length;
    const totalReviews = products.length * 1468 + 1103;
    const reviewStars = document.getElementById("reviewStars");

    document.getElementById("reviewAverage").textContent = formatRating(average);
    document.getElementById("reviewCount").textContent = totalReviews.toLocaleString("pt-BR");
    reviewStars.innerHTML = buildStarsMarkup(average);
    reviewStars.setAttribute("aria-label", `Media de ${formatRating(average)} de 5 estrelas`);
}

function renderTestimonials(testimonials) {
    const testimonialStack = document.getElementById("testimonialStack");

    testimonialStack.innerHTML = testimonials.map((item) => `
        <article class="testimonial-card reveal">
            <div class="testimonial-top">
                <div class="testimonial-author">
                    <span class="avatar-badge">${item.autor.slice(0, 2).toUpperCase()}</span>
                    <div>
                        <strong>${item.autor}</strong>
                        <span>${item.role}</span>
                    </div>
                </div>
                <span class="testimonial-rating">${buildStarsMarkup(item.nota)}</span>
            </div>
            <h3>${item.headline}</h3>
            <p>${item.texto}</p>
        </article>
    `).join("");
}

function renderRelatedProducts(products) {
    const relatedGrid = document.getElementById("relatedGrid");

    if (!products.length) {
        relatedGrid.innerHTML = `
            <article class="related-card reveal">
                <span class="product-pill">curadoria</span>
                <h3>Novos produtos chegando</h3>
                <p>Estamos preparando mais itens premium para complementar esta vitrine.</p>
                <div class="related-actions">
                    <a class="card-action primary" href="#produtos">Explorar destaque</a>
                </div>
            </article>
        `;
        return;
    }

    relatedGrid.innerHTML = products.map((product) => `
        <article class="related-card reveal">
            <div class="related-media">
                <img class="lazy-image" src="${PLACEHOLDER_IMAGE}" data-src="${product.imagem}" alt="${product.nome}" loading="lazy">
            </div>
            <span class="product-pill">${product.categoria}</span>
            <h3>${product.nome}</h3>
            <p>${createBenefitSummary(product)}</p>
            <div class="product-price-line">
                <strong>R$ ${formatCurrency(product.preco)}</strong>
                ${product.precoAntigo ? `<span>R$ ${formatCurrency(product.precoAntigo)}</span>` : ""}
            </div>
            <div class="related-actions">
                <button class="card-action primary" type="button" data-add-product-id="${product.id}" data-open-cart="false">
                    Adicionar
                </button>
                <a class="card-action" href="produto.html?id=${product.id}">
                    Ver detalhes
                </a>
            </div>
        </article>
    `).join("");
}

function buildRelatedProducts(products, featuredProduct) {
    const sameCategory = products.filter((product) => (
        product.id !== featuredProduct.id && product.categoria === featuredProduct.categoria
    ));

    if (sameCategory.length >= 4) {
        return sameCategory.slice(0, 4);
    }

    const fallback = products.filter((product) => product.id !== featuredProduct.id);
    return fallback.slice(0, 4);
}

function buildTestimonials(products, featuredProduct) {
    const flattened = products.flatMap((product) =>
        (product.avaliacoes || []).slice(0, 1).map((review, index) => ({
            autor: review.autor,
            nota: Number(review.nota || product.rating || 4.8),
            texto: review.texto,
            headline: index === 0
                ? `A experiencia com ${product.nome} supera a primeira impressao.`
                : "Vale o investimento para quem quer um produto premium.",
            role: ROLE_LABELS[(product.id + index) % ROLE_LABELS.length]
        }))
    );

    if (flattened.length >= 3) {
        return flattened.slice(0, 3);
    }

    return [
        ...flattened,
        {
            autor: "Camila",
            nota: 4.9,
            texto: `A curadoria da TechStore deixou a compra muito mais clara e o ${featuredProduct.nome} realmente entrega sensacao de produto premium.`,
            headline: "Design bonito, compra facil e entrega rapida.",
            role: "Cliente verificada"
        }
    ].slice(0, 3);
}

function getBenefitItems(product) {
    const lead = getBenefitLead(product);

    if (product.categoria === "notebooks") {
        return [
            { icon: "fa-wand-magic-sparkles", title: "Fluxo criativo sem travas", text: "Ideal para multitarefa, edicao e trabalho intenso com sensacao constante de fluidez." },
            { icon: "fa-eye", title: "Tela que valoriza cada detalhe", text: "Mais conforto visual para design, video, leitura e longas horas de uso." },
            { icon: "fa-battery-three-quarters", title: "Autonomia que acompanha reunioes e viagens", text: "Voce trabalha por mais tempo com menos dependencia de tomada." }
        ];
    }

    if (product.categoria === "acessorios") {
        return [
            { icon: "fa-music", title: "Experiencia sensorial mais imersiva", text: "Som, conectividade ou monitoramento mais refinados no uso diario." },
            { icon: "fa-heart-pulse", title: "Conforto para longas horas", text: "Acabamento pensado para uso frequente sem cansar ou incomodar." },
            { icon: "fa-bolt", title: "Integracao rapida com sua rotina", text: "Conecta facil e melhora a experiencia com seus outros dispositivos." }
        ];
    }

    return [
        { icon: "fa-camera-retro", title: lead.cameraTitle, text: lead.cameraText },
        { icon: "fa-gauge-high", title: lead.performanceTitle, text: lead.performanceText },
        { icon: "fa-battery-full", title: lead.batteryTitle, text: lead.batteryText }
    ];
}

function createBenefitSummary(product) {
    const firstHighlight = getBenefitLead(product).summaryLead;

    if (product.categoria === "smartphones") {
        return `${firstHighlight}. Design refinado, otima fluidez e uma experiencia que passa sensacao de topo de linha do primeiro toque ao ultimo clique.`;
    }

    if (product.categoria === "notebooks") {
        return `${firstHighlight}. Um upgrade visivel para produtividade, mobilidade e trabalho criativo com cara de produto premium.`;
    }

    return `${firstHighlight}. Um complemento premium para elevar conforto, integracao e praticidade na sua rotina tech.`;
}

function getBenefitLead(product) {
    const rawHighlights = Array.isArray(product.destaques) ? product.destaques : [];
    const normalized = rawHighlights.map((item) => String(item).toLowerCase());

    const hasCamera = normalized.some((item) => item.includes("camera") || item.includes("zoom") || item.includes("foto"));
    const hasBattery = normalized.some((item) => item.includes("bateria") || item.includes("36h") || item.includes("22h"));
    const hasDisplay = normalized.some((item) => item.includes("tela") || item.includes("retina") || item.includes("amoled"));
    const hasPerformance = normalized.some((item) => (
        item.includes("chip") || item.includes("snapdragon") || item.includes("m3") || item.includes("m2") || item.includes("rtx")
    ));

    if (product.categoria === "smartphones") {
        return {
            summaryLead: hasCamera ? "Fotos mais limpas, nitidas e confiantes em qualquer momento do dia" : "Um smartphone premium que parece rapido e refinado em cada toque",
            cameraTitle: hasCamera ? "Fotos nitidas ate no escuro" : "Camera pronta para qualquer momento",
            cameraText: hasCamera ? "Voce registra melhor sem depender de luz perfeita ou ajustes complicados." : "Mais confianca para capturar momentos, trabalho e criacao sem perder detalhe.",
            performanceTitle: hasPerformance ? "Desempenho imediato em tudo" : "Resposta rapida no uso diario",
            performanceText: hasPerformance ? "Apps, camera, redes e multitarefa respondem na hora, sem sensacao de atraso." : "A rotina fica mais fluida do primeiro desbloqueio ao fim do dia.",
            batteryTitle: hasBattery ? "Autonomia para acompanhar seu ritmo" : "Energia para ficar longe da tomada",
            batteryText: hasBattery ? "Mais liberdade para sair, criar e trabalhar com menos preocupacao." : "Voce usa mais e interrompe menos a rotina para recarregar."
        };
    }

    if (product.categoria === "notebooks") {
        return {
            summaryLead: hasPerformance ? "Potencia real para trabalhar, criar e renderizar com tranquilidade" : "Mais produtividade com uma experiencia premium e consistente",
            cameraTitle: hasDisplay ? "Tela que valoriza cada detalhe" : "Visual premium para foco prolongado",
            cameraText: hasDisplay ? "Mais conforto visual para design, video, leitura e trabalho intenso." : "A experiencia visual fica mais clara, elegante e confortavel no uso diario.",
            performanceTitle: hasPerformance ? "Fluxo criativo sem travas" : "Desempenho confiavel no multitarefa",
            performanceText: hasPerformance ? "Voce alterna entre apps pesados, edicao e produtividade sem perder ritmo." : "Mais estabilidade para trabalhar bem ao longo do dia.",
            batteryTitle: hasBattery ? "Autonomia para reunioes e viagens" : "Mais mobilidade com menos interrupcoes",
            batteryText: hasBattery ? "Menos dependencia de tomada em deslocamentos e rotinas longas." : "Voce continua produzindo com mais liberdade."
        };
    }

    return {
        summaryLead: "Um acessorio premium que deixa sua rotina mais confortavel, imersiva e pratica",
        cameraTitle: "Uso mais prazeroso por horas",
        cameraText: "Conforto, acabamento e integracao que fazem diferenca no dia a dia.",
        performanceTitle: "Conexao rapida e experiencia refinada",
        performanceText: "Tudo fica mais simples de usar, sincronizar e aproveitar no ecossistema.",
        batteryTitle: "Mais liberdade durante a rotina",
        batteryText: "Menos friccao, mais praticidade e uma sensacao clara de upgrade real."
    };
}

function updateFeaturedImage() {
    const image = state.galleryImages[state.activeImageIndex] || state.featuredProduct.imagem;
    const featuredImage = document.getElementById("featuredImage");
    const heroImage = document.getElementById("heroDeviceImage");

    featuredImage.src = image;
    featuredImage.alt = state.featuredProduct.nome;
    featuredImage.decoding = "async";

    if (heroImage) {
        heroImage.src = image;
        heroImage.alt = state.featuredProduct.nome;
        heroImage.decoding = "async";
    }

    document.querySelectorAll("[data-gallery-index]").forEach((button) => {
        button.classList.toggle("is-active", Number(button.dataset.galleryIndex) === state.activeImageIndex);
    });
}

function applyColor(colorId) {
    const selectedColor = COLOR_OPTIONS.find((color) => color.id === colorId) || COLOR_OPTIONS[0];
    state.activeColor = selectedColor.id;

    const featuredShell = document.getElementById("deviceShell");
    const heroShell = document.getElementById("heroDeviceShell");
    const currentColorName = document.getElementById("currentColorName");
    const stageGlow = document.getElementById("stageGlow");

    if (featuredShell) featuredShell.dataset.color = selectedColor.id;
    if (heroShell) heroShell.dataset.color = selectedColor.id;
    if (currentColorName) currentColorName.textContent = selectedColor.label;
    if (stageGlow) stageGlow.style.background = `radial-gradient(circle, ${selectedColor.glow}, transparent 66%)`;

    document.querySelectorAll("[data-color-id]").forEach((button) => {
        button.setAttribute("aria-checked", String(button.dataset.colorId === selectedColor.id));
    });
}

function setupMenu() {
    const header = document.getElementById("siteHeader");
    const navToggle = document.getElementById("navToggle");

    navToggle?.addEventListener("click", () => {
        const isOpen = header.classList.toggle("nav-open");
        document.body.classList.toggle("menu-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-anchor").forEach((link) => {
        link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("click", (event) => {
        if (!header?.classList.contains("nav-open")) return;
        if (event.target.closest(".site-nav")) return;
        closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

function closeMenu() {
    const header = document.getElementById("siteHeader");
    const navToggle = document.getElementById("navToggle");

    header?.classList.remove("nav-open");
    document.body.classList.remove("menu-open");
    navToggle?.setAttribute("aria-expanded", "false");
}

function setupHeaderState() {
    const header = document.getElementById("siteHeader");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

function setupScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav-anchor"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const updateActiveLink = () => {
        const offset = window.scrollY + 180;
        let currentId = sections[0]?.id;

        sections.forEach((section) => {
            if (offset >= section.offsetTop) {
                currentId = section.id;
            }
        });

        links.forEach((link) => {
            const href = link.getAttribute("href");
            link.classList.toggle("is-active", href === `#${currentId}`);
        });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
}

function setupRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy-image[data-src]");
    if (!lazyImages.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const image = entry.target;
            image.src = image.dataset.src;
            image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
            image.addEventListener("error", () => image.classList.add("is-loaded"), { once: true });
            observer.unobserve(image);
        });
    }, { threshold: 0.12, rootMargin: "120px 0px" });

    lazyImages.forEach((image) => observer.observe(image));
}

function setupZoomStage() {
    const zoomStage = document.getElementById("zoomStage");
    const featuredShell = document.getElementById("deviceShell");

    if (!zoomStage || !featuredShell) return;

    zoomStage.addEventListener("pointermove", (event) => {
        if (window.innerWidth < 860) return;

        const bounds = zoomStage.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;
        const percentX = (offsetX / bounds.width) * 100;
        const percentY = (offsetY / bounds.height) * 100;
        const rotateY = ((percentX - 50) / 12).toFixed(2);
        const rotateX = ((50 - percentY) / 12).toFixed(2);

        zoomStage.classList.add("is-active");
        zoomStage.style.setProperty("--pointer-x", `${percentX}%`);
        zoomStage.style.setProperty("--pointer-y", `${percentY}%`);
        zoomStage.style.setProperty("--rotate-y", `${rotateY}deg`);
        zoomStage.style.setProperty("--rotate-x", `${rotateX}deg`);
    });

    ["pointerleave", "pointercancel"].forEach((eventName) => {
        zoomStage.addEventListener(eventName, () => {
            zoomStage.classList.remove("is-active");
            zoomStage.style.setProperty("--pointer-x", "50%");
            zoomStage.style.setProperty("--pointer-y", "50%");
            zoomStage.style.setProperty("--rotate-y", "0deg");
            zoomStage.style.setProperty("--rotate-x", "0deg");
        });
    });
}

function setupLoginLinks() {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const loginHref = `login.html?redirect=${encodeURIComponent(currentPath)}`;

    document.querySelectorAll("[data-login-link]").forEach((link) => {
        link.setAttribute("href", loginHref);
    });
}

function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatRating(value) {
    return Number(value || 0).toFixed(1);
}

function buildStarsMarkup(value) {
    const rounded = Math.round(Number(value || 0));

    return Array.from({ length: 5 }, (_, index) => (
        `<i class="fa-${index < rounded ? "solid" : "regular"} fa-star"></i>`
    )).join("");
}
