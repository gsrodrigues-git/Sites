// ============================================
// CONFIGURAÇÕES GLOBAIS E ESTADO
// ============================================

const APP_CONFIG = {
    countdownDate: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 horas
    itemsPerPage: 8,
    animationDelay: 100
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'todos';
let displayedItems = APP_CONFIG.itemsPerPage;

// ============================================
// DADOS DE PRODUTOS
// ============================================

const produtos = Array.isArray(window.PRODUTOS_DATA) ? window.PRODUTOS_DATA : [];
const ofertas = Array.isArray(window.OFERTAS_DATA) ?
    window.OFERTAS_DATA :
    produtos.slice(0, 4).map(p => ({ ...p, badge: 'Oferta' }));

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.body.classList.add('loaded');
    }, 1500);

    // Renderizar produtos e ofertas
    renderProdutos(produtos);
    renderOfertas(ofertas);

    // Atualizar badge do carrinho
    updateCartBadge();

    // Iniciar countdown
    startCountdown();

    // Configurar event listeners
    setupEventListeners();

    // Iniciar animações de scroll
    setupScrollAnimations();

    // Configurar intersection observer para lazy loading
    setupLazyLoading();

    // Scroll mais suave e responsivo
    setupScrollBehavior();

    // Atualizar link de login com redirect
    setupLoginLinks();
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Navegação suave e fechar menu mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Fechar menu mobile
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('no-scroll');

                // Scroll suave
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Atualizar active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Search bar
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        }
    });

    searchClose.addEventListener('click', () => {
        searchBar.classList.remove('active');
        searchInput.value = '';
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm);
    });

    // Cart sidebar
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');

    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        renderCart();
    });

    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    // Fechar cart ao clicar fora
    document.addEventListener('click', (e) => {
        // Não fechar o sidebar do carrinho quando o clique vier do botão de adicionar
        if (cartSidebar.classList.contains('active') &&
            !cartSidebar.contains(e.target) &&
            !cartBtn.contains(e.target) &&
            !e.target.closest('.btn-add-cart')) {
            cartSidebar.classList.remove('active');
        }
    });

    // Filtros de produtos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayedItems = APP_CONFIG.itemsPerPage;
            renderProdutos(getFilteredProducts());
        });
    });

    // Load more
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedItems += APP_CONFIG.itemsPerPage;
            renderProdutos(getFilteredProducts());
        });
    }

    // Scroll to top
    const scrollToTop = document.getElementById('scrollToTop');
    scrollToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Form contato
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleFormSubmit);

    // Newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Inscrição realizada com sucesso!');
            newsletterForm.reset();
        });
    }
}

// ============================================
// SCROLL HANDLERS
// ============================================

function handleScroll() {
    const header = document.getElementById('mainHeader');
    const scrollToTop = document.getElementById('scrollToTop');

    // Header scrolled effect
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        scrollToTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        scrollToTop.classList.remove('visible');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// SCROLL SUAVE E COMPORTAMENTO DA NAVBAR
// ============================================

let scrollTicking = false;
let lastScrollY = window.scrollY;
let scrollTimeout;

function setupScrollBehavior() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function onScroll() {
    if (scrollTicking) return;

    scrollTicking = true;
    window.requestAnimationFrame(() => {
        handleScroll();

        const header = document.getElementById('mainHeader');
        if (header) {
            const currentY = window.scrollY;
            header.classList.toggle('scrolling-down', currentY > lastScrollY && currentY > 120);
            header.classList.toggle('scrolling-up', currentY < lastScrollY);
            header.classList.add('is-scrolling');

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                header.classList.remove('is-scrolling');
            }, 180);

            lastScrollY = currentY;
        }

        scrollTicking = false;
    });
}

// ============================================
// LOGIN LINK COM REDIRECT
// ============================================

function setupLoginLinks() {
    const links = document.querySelectorAll('[data-login-link]');
    if (!links.length) return;

    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const loginHref = `login.html?redirect=${encodeURIComponent(current)}`;

    links.forEach(link => {
        link.setAttribute('href', loginHref);
    });
}

// ============================================
// PRODUTOS
// ============================================

function renderProdutos(produtosArray) {
    const grid = document.getElementById('produtosGrid');
    const filtered = produtosArray.slice(0, displayedItems);

    grid.innerHTML = filtered.map((produto, index) => `
        <div class="card-produto" data-aos="fade-up" data-aos-delay="${index * 50}">
            ${produto.badge ? `<span class="produto-badge">${produto.badge}</span>` : ''}
            <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <div class="preco-container">
                ${produto.precoAntigo ? `<span class="preco-antigo">R$ ${formatPrice(produto.precoAntigo)}</span>` : ''}
                <div class="preco-atual">R$ ${formatPrice(produto.preco)}</div>
            </div>
            <div class="card-actions">
                <button class="btn-add-cart" onclick="addToCart(${produto.id})">
                    <i class="fas fa-cart-plus"></i>
                    Adicionar
                </button>
                <button class="btn-favorito" onclick="toggleFavorite(event, ${produto.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <a class="btn-detalhes" href="produto.html?id=${produto.id}">
                Ver detalhes
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `).join('');
    
    // Mostrar/ocultar botão "Carregar Mais"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = displayedItems >= produtosArray.length ? 'none' : 'inline-flex';
    }
    
    // Reiniciar animações
    setupScrollAnimations();
}

function renderOfertas(ofertasArray) {
    const grid = document.getElementById('ofertasGrid');
    
    grid.innerHTML = ofertasArray.map((produto, index) => `
        <div class="card-produto" data-aos="fade-up" data-aos-delay="${index * 50}">
            <span class="produto-badge">${produto.badge}</span>
            <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <div class="preco-container">
                <span class="preco-antigo">R$ ${formatPrice(produto.precoAntigo)}</span>
                <div class="preco-atual">R$ ${formatPrice(produto.preco)}</div>
            </div>
            <div class="card-actions">
                <button class="btn-add-cart" onclick="addToCart(${produto.id})">
                    <i class="fas fa-cart-plus"></i>
                    Adicionar
                </button>
                <button class="btn-favorito" onclick="toggleFavorite(event, ${produto.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <a class="btn-detalhes" href="produto.html?id=${produto.id}">
                Ver detalhes
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `).join('');
}

function getFilteredProducts() {
    if (currentFilter === 'todos') {
        return produtos;
    }
    return produtos.filter(p => p.categoria === currentFilter);
}

function filterProducts(searchTerm) {
    if (!searchTerm) {
        renderProdutos(getFilteredProducts());
        return;
    }
    
    const filtered = produtos.filter(p => 
        p.nome.toLowerCase().includes(searchTerm) ||
        p.descricao.toLowerCase().includes(searchTerm)
    );
    
    renderProdutos(filtered);
}

// ============================================
// CARRINHO
// ============================================

function addToCart(productId) {
    const produto = produtos.find(p => p.id === productId);
    if (!produto) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantidade++;
    } else {
        cart.push({
            ...produto,
            quantidade: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    showToast('Produto adicionado ao carrinho!');
    
    // Animação no ícone do carrinho
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.classList.add('bounce');
    setTimeout(() => cartBtn.classList.remove('bounce'), 500);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
    showToast('Produto removido do carrinho');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantidade += change;
    
    if (item.quantidade <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        return;
    }
    
    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.nome}</h4>
                <div class="cart-item-price">R$ ${formatPrice(item.preco)}</div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-quantity">${item.quantidade}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateCartTotal();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    document.getElementById('cartTotal').textContent = `R$ ${formatPrice(total)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ============================================
// FAVORITOS
// ============================================

function toggleFavorite(evt, productId) {
    const btn = evt.currentTarget;
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast('Adicionado aos favoritos!');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast('Removido dos favoritos');
    }
}

// ============================================
// COUNTDOWN TIMER
// ============================================

function startCountdown() {
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = APP_CONFIG.countdownDate - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-timer').innerHTML = '<p>Oferta Encerrada!</p>';
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// ============================================
// FORMULÁRIO DE CONTATO
// ============================================

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Limpar erros anteriores
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    
    let isValid = true;
    
    // Validar nome
    const nome = document.getElementById('nome');
    if (nome.value.trim().length < 3) {
        showFieldError(nome, 'Nome deve ter no mínimo 3 caracteres');
        isValid = false;
    }
    
    // Validar email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showFieldError(email, 'E-mail inválido');
        isValid = false;
    }
    
    // Validar telefone (se preenchido)
    const telefone = document.getElementById('telefone');
    if (telefone.value && telefone.value.replace(/\D/g, '').length < 10) {
        showFieldError(telefone, 'Telefone inválido');
        isValid = false;
    }
    
    // Validar mensagem
    const mensagem = document.getElementById('mensagem');
    if (mensagem.value.trim().length < 10) {
        showFieldError(mensagem, 'Mensagem deve ter no mínimo 10 caracteres');
        isValid = false;
    }
    
    if (isValid) {
        // Simular envio
        showToast('Mensagem enviada com sucesso!');
        e.target.reset();
        
        // Animação de sucesso
        const submitBtn = e.target.querySelector('.btn-submit');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
        setTimeout(() => {
            submitBtn.innerHTML = '<span>Enviar Mensagem</span><i class="fas fa-paper-plane"></i>';
        }, 3000);
    }
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    const errorSpan = formGroup.querySelector('.form-error');
    errorSpan.textContent = message;
}

// ============================================
// ANIMAÇÕES DE SCROLL
// ============================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// LAZY LOADING DE IMAGENS
// ============================================

function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// UTILIDADES
// ============================================

function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Detectar dispositivo e orientação
function detectDevice() {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    if (isMobile) document.body.classList.add('device-mobile');
    if (isTablet) document.body.classList.add('device-tablet');
    if (isDesktop) document.body.classList.add('device-desktop');
    
    // Orientação
    const isPortrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle('portrait', isPortrait);
    document.body.classList.toggle('landscape', !isPortrait);
}

// Atualizar detecção de dispositivo no resize
window.addEventListener('resize', debounce(detectDevice, 150));
detectDevice();

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Debounce para eventos de scroll e resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll atualizado via requestAnimationFrame em setupScrollBehavior()

// Preload de imagens críticas
function preloadImages() {
    const criticalImages = [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();

// ============================================
// ACESSIBILIDADE
// ============================================

// Navegação por teclado
document.addEventListener('keydown', (e) => {
    // Fechar sidebar do carrinho com ESC
    if (e.key === 'Escape') {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('searchBar').classList.remove('active');
    }
    
    // Abrir busca com Ctrl+K
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchBar').classList.add('active');
        document.getElementById('searchInput').focus();
    }
});

// Focus visible para navegação por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// ============================================
// SERVICE WORKER (PWA - Opcional)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registrado'))
        //     .catch(err => console.log('Erro ao registrar Service Worker'));
    });
}

console.log('🚀 TechStore carregado com sucesso!');
