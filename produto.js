const produtos = Array.isArray(window.PRODUTOS_DATA) ? window.PRODUTOS_DATA : [];
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get('id'));
const produto = produtos.find((item) => item.id === productId);

const categoryLabels = {
    smartphones: "Smartphones",
    notebooks: "Notebooks",
    acessorios: "Acessorios"
};

const defaultPros = [
    "Experiencia equilibrada",
    "Conjunto atual de recursos"
];

const defaultCons = [
    "Estoque e preco podem variar por loja",
    "Recursos sujeitos a atualizacoes de software"
];

if (!produto) {
    renderNotFound();
} else {
    setupLoginLinks();
    renderProduct();
}

function renderProduct() {
    document.title = `TechStore - ${produto.nome}`;

    const images = Array.isArray(produto.imagensDetalhadas) && produto.imagensDetalhadas.length > 0 ?
        produto.imagensDetalhadas : [produto.imagem];

    const breadcrumb = document.getElementById('productBreadcrumb');
    breadcrumb.textContent = categoryLabels[produto.categoria] || "Produto";

    const category = document.getElementById('productCategory');
    if (category) {
        category.textContent = categoryLabels[produto.categoria] || "Produto";
    }

    document.getElementById('productTitle').textContent = produto.nome;
    document.getElementById('productDescription').textContent = produto.descricao || "";
    document.getElementById('productLongDescription').textContent = produto.descricaoLonga || "";

    const updatedLabel = formatDate(produto.atualizadoEm);
    const updatedEl = document.getElementById('productUpdated');
    if (updatedEl) {
        updatedEl.textContent = updatedLabel;
    }

    const oldPrice = document.getElementById('productOldPrice');
    if (produto.precoAntigo) {
        oldPrice.textContent = `R$ ${formatPrice(produto.precoAntigo)}`;
    } else {
        oldPrice.style.display = 'none';
    }

    document.getElementById('productPrice').textContent = `R$ ${formatPrice(produto.preco)}`;
    document.getElementById('productInstallments').textContent = `12x de R$ ${formatPrice(Math.round(produto.preco / 12))}`;

    const heroImage = document.getElementById('productHeroImage');
    heroImage.src = images[0];
    heroImage.alt = produto.nome;
    heroImage.decoding = 'async';

    const caption = document.getElementById('productCaption');
    if (caption) {
        caption.textContent = `Imagem: TechStore Labs`;
    }

    const galleryMain = document.getElementById('galleryMain');
    galleryMain.src = images[0];
    galleryMain.alt = produto.nome;
    galleryMain.decoding = 'async';

    const addToBagButton = document.getElementById('productAddToBag');
    if (addToBagButton) {
        addToBagButton.dataset.addProductId = String(produto.id);
        addToBagButton.dataset.openCart = 'true';
        addToBagButton.setAttribute('aria-label', `Adicionar ${produto.nome} a bag`);
    }

    renderHighlights();
    renderBadges();
    renderSummary(images[0]);
    renderQuickSpecs();
    renderProsCons();
    renderGalleryThumbs(images);
    renderSpecs();
    renderPriceTable();
    renderReviews();
    renderDetailGallery(images);
    renderRelated();
    setupShareLinks();
    setupNewsletter();
}

function renderHighlights() {
    const container = document.getElementById('productHighlights');
    const items = Array.isArray(produto.destaques) ? produto.destaques : [];

    if (!items.length) {
        container.innerHTML = `
            <span class="highlight-chip">Curadoria TechStore</span>
            <span class="highlight-chip">Entrega premium</span>
            <span class="highlight-chip">Suporte especializado</span>
        `;
        return;
    }

    container.innerHTML = items.map((item) => (
        `<span class="highlight-chip">${item}</span>`
    )).join('');
}

function renderBadges() {
    const container = document.getElementById('productBadges');
    const badge = produto.badge ? `<span class="product-badge">${produto.badge}</span>` : '';
    const rating = produto.rating ? `
        <span class="rating-badge">
            <i class="fas fa-star"></i>
            ${produto.rating.toFixed(1)}
        </span>
    ` : '';

    container.innerHTML = `${badge}${rating}`;
}

function renderSummary(imageSrc) {
    const summaryImage = document.getElementById('summaryImage');
    if (summaryImage) {
        summaryImage.src = imageSrc;
        summaryImage.alt = produto.nome;
        summaryImage.decoding = 'async';
    }

    const summaryTitle = document.getElementById('summaryTitle');
    if (summaryTitle) {
        summaryTitle.textContent = produto.nome;
    }

    const summaryPrice = document.getElementById('summaryPrice');
    if (summaryPrice) {
        summaryPrice.textContent = `R$ ${formatPrice(produto.preco)}`;
    }

    const summaryInstallments = document.getElementById('summaryInstallments');
    if (summaryInstallments) {
        summaryInstallments.textContent = `12x de R$ ${formatPrice(Math.round(produto.preco / 12))}`;
    }

    const summaryRating = document.getElementById('summaryRating');
    if (summaryRating) {
        const ratingValue = produto.rating ? produto.rating.toFixed(1) : "--";
        summaryRating.innerHTML = `${renderStars(produto.rating || 0)} <span>${ratingValue}</span>`;
    }
}

function renderQuickSpecs() {
    const container = document.getElementById('quickSpecs');
    if (!container) return;

    const specs = Array.isArray(produto.especificacoes) ? produto.especificacoes.slice(0, 4) : [];

    container.innerHTML = specs.map((spec) => (
        `<div class="quick-spec">
            <span>${spec.label}</span>
            <strong>${spec.value}</strong>
        </div>`
    )).join('');
}

function renderProsCons() {
    const prosList = document.getElementById('productPros');
    const consList = document.getElementById('productCons');
    if (!prosList || !consList) return;

    const pros = Array.isArray(produto.pros) && produto.pros.length ?
        produto.pros :
        (Array.isArray(produto.destaques) && produto.destaques.length ? produto.destaques : defaultPros);

    const cons = Array.isArray(produto.contras) && produto.contras.length ?
        produto.contras :
        getDefaultConsByCategory(produto.categoria);

    prosList.innerHTML = pros.map((item) => (
        `<li><i class="fas fa-check"></i><span>${item}</span></li>`
    )).join('');

    consList.innerHTML = cons.map((item) => (
        `<li><i class="fas fa-minus"></i><span>${item}</span></li>`
    )).join('');
}

function getDefaultConsByCategory(category) {
    if (category === 'smartphones') {
        return [
            "Preco premium para a categoria",
            "Carregador pode variar por regiao"
        ];
    }

    if (category === 'notebooks') {
        return [
            "Configuracoes mudam conforme a loja",
            "Peso acima dos ultrafinos"
        ];
    }

    if (category === 'acessorios') {
        return [
            "Compatibilidade varia por dispositivo",
            "Disponibilidade pode oscilar no estoque"
        ];
    }

    return defaultCons;
}

function renderGalleryThumbs(images) {
    const thumbs = document.getElementById('galleryThumbs');

    thumbs.innerHTML = images.map((src, index) => (
        `<button class="gallery-thumb ${index === 0 ? 'active' : ''}" type="button" data-src="${src}">
            <img src="${src}" alt="${produto.nome} ${index + 1}">
        </button>`
    )).join('');

    thumbs.querySelectorAll('.gallery-thumb').forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const src = thumb.getAttribute('data-src');
            document.querySelectorAll('.gallery-thumb').forEach((item) => item.classList.remove('active'));
            thumb.classList.add('active');
            const galleryMain = document.getElementById('galleryMain');
            galleryMain.src = src;
            galleryMain.alt = produto.nome;
            galleryMain.decoding = 'async';
        });
    });
}

function renderSpecs() {
    const container = document.getElementById('productSpecs');
    const specs = Array.isArray(produto.especificacoes) ? produto.especificacoes : [];

    container.innerHTML = specs.map((spec) => (
        `<div class="spec-item">
            <span>${spec.label}</span>
            <strong>${spec.value}</strong>
        </div>`
    )).join('');
}

function renderPriceTable() {
    const container = document.getElementById('priceTable');
    const rows = buildPriceHistory(produto);

    renderPriceHighlights(rows);

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Periodo</th>
                    <th>Preco mensal</th>
                    <th>Atualizado em</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((row) => (
                    `<tr>
                        <td>${row.periodo}</td>
                        <td>R$ ${formatPrice(row.preco)}</td>
                        <td>${formatDate(row.atualizadoEm)}</td>
                    </tr>`
                )).join('')}
            </tbody>
        </table>
    `;
}

function renderPriceHighlights(rows) {
    const minEl = document.getElementById('priceMinValue');
    const minDateEl = document.getElementById('priceMinDate');
    const currentEl = document.getElementById('priceCurrentValue');
    const currentDateEl = document.getElementById('priceCurrentDate');

    if (!minEl || !minDateEl || !currentEl || !currentDateEl) return;

    const prices = rows.map((row) => row.preco);
    const minPrice = Math.min(...prices, produto.preco);
    const minRow = rows.find((row) => row.preco === minPrice);

    minEl.textContent = `R$ ${formatPrice(minPrice)}`;
    minDateEl.textContent = formatDate(minRow ? minRow.atualizadoEm : produto.atualizadoEm);

    currentEl.textContent = `R$ ${formatPrice(produto.preco)}`;
    currentDateEl.textContent = formatDate(produto.atualizadoEm);
}

function renderReviews() {
    const container = document.getElementById('reviewsGrid');
    const reviews = Array.isArray(produto.avaliacoes) ? produto.avaliacoes : [];

    if (!reviews.length) {
        container.innerHTML = `
            <article class="review-card">
                <div class="review-header">
                    <strong>TechStore Lab</strong>
                    <span class="review-score">${(produto.rating || 4.8).toFixed(1)}</span>
                </div>
                <div class="review-stars">${renderStars(produto.rating || 4.8)}</div>
                <p>As primeiras impressoes deste produto apontam para uma experiencia premium, bem equilibrada e consistente no uso diario.</p>
            </article>
        `;
        return;
    }

    container.innerHTML = reviews.map((review) => (
        `<article class="review-card">
            <div class="review-header">
                <strong>${review.autor}</strong>
                <span class="review-score">${review.nota.toFixed(1)}</span>
            </div>
            <div class="review-stars">${renderStars(review.nota)}</div>
            <p>${review.texto}</p>
        </article>`
    )).join('');
}

function renderDetailGallery(images) {
    const container = document.getElementById('detailGallery');
    container.innerHTML = images.map((src, index) => (
        `<div class="detail-photo">
            <img src="${src}" alt="${produto.nome} detalhe ${index + 1}">
        </div>`
    )).join('');
}

function renderRelated() {
    const container = document.getElementById('relatedGrid');
    const related = produtos.filter((item) => item.categoria === produto.categoria && item.id !== produto.id).slice(0, 3);

    if (!related.length) {
        container.innerHTML = `
            <div class="card-produto">
                <h3>Mais itens premium chegando</h3>
                <p>Estamos atualizando esta categoria com novas opcoes selecionadas pela curadoria TechStore.</p>
                <a class="btn-detalhes" href="index.html#relacionados">
                    Explorar vitrine
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = related.map((item) => (
        `<div class="card-produto">
            ${item.badge ? `<span class="produto-badge">${item.badge}</span>` : ''}
            <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
            <h3>${item.nome}</h3>
            <p>${item.descricao}</p>
            <div class="preco-container">
                ${item.precoAntigo ? `<span class="preco-antigo">R$ ${formatPrice(item.precoAntigo)}</span>` : ''}
                <div class="preco-atual">R$ ${formatPrice(item.preco)}</div>
            </div>
            <a class="btn-detalhes" href="produto.html?id=${item.id}">
                Ver detalhes
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>`
    )).join('');
}

function buildPriceHistory(product) {
    const defaultFactors = [1.12, 1.08, 1.05, 1.02, 1.0, 0.98];
    const factors = Array.isArray(product.historicoPreco) && product.historicoPreco.length > 0 ?
        product.historicoPreco :
        defaultFactors;

    const months = getLastMonths(factors.length);

    return months.map((month, index) => ({
        periodo: month.label,
        preco: Math.round(product.preco * factors[index]),
        atualizadoEm: month.updated
    }));
}

function getLastMonths(count) {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const months = [];

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const label = `${monthNames[month]} ${year}`;
        const updated = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        months.push({ label, updated });
    }

    return months;
}

function renderStars(score) {
    const full = Math.round(score);
    let stars = '';

    for (let i = 1; i <= 5; i++) {
        stars += i <= full ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }

    return stars;
}

function setupShareLinks() {
    const buttons = document.querySelectorAll('[data-share]');
    if (!buttons.length) return;

    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const text = encodeURIComponent(`Review ${produto.nome} | TechStore`);
    const feedback = document.getElementById('shareFeedback');

    const shareMap = {
        whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`
    };

    buttons.forEach((btn) => {
        const type = btn.dataset.share;
        if (type === 'copy') {
            btn.addEventListener('click', async () => {
                try {
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(url);
                        if (feedback) {
                            feedback.textContent = 'Link copiado!';
                            setTimeout(() => {
                                feedback.textContent = '';
                            }, 2000);
                        }
                    } else {
                        window.prompt('Copie o link:', url);
                    }
                } catch (error) {
                    window.prompt('Copie o link:', url);
                }
            });
            return;
        }

        const href = shareMap[type];
        if (href) {
            btn.setAttribute('href', href);
            btn.setAttribute('target', '_blank');
            btn.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function setupNewsletter() {
    const form = document.getElementById('sidebarNewsletter');
    const feedback = document.getElementById('newsletterFeedback');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const consent = document.querySelector('.newsletter-check input[type="checkbox"]');
        if (consent && !consent.checked) {
            if (feedback) {
                feedback.textContent = 'Confirme os termos para continuar.';
            }
            return;
        }

        form.reset();
        if (consent) {
            consent.checked = false;
        }
        if (feedback) {
            feedback.textContent = 'Inscricao confirmada com sucesso!';
            setTimeout(() => {
                feedback.textContent = '';
            }, 3000);
        }
    });
}

function formatPrice(price) {
    return Number(price).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;

    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
}

function renderNotFound() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <section class="product-not-found">
            <h1>Produto nao encontrado</h1>
            <p>Verifique o link ou volte para a vitrine principal.</p>
            <a class="btn-primary" href="index.html#produtos">Voltar aos produtos</a>
        </section>
    `;
}

function setupLoginLinks() {
    const links = document.querySelectorAll('[data-login-link]');
    if (!links.length) return;

    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const loginHref = `login.html?redirect=${encodeURIComponent(current)}`;

    links.forEach(link => {
        link.setAttribute('href', loginHref);
    });
}
