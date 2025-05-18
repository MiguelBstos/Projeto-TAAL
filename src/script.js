document.addEventListener("DOMContentLoaded", function() {
    // =============================================
    // Módulo de Navegação e Menu Mobile
    // =============================================
    const Navigation = (function() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        const navLinks = document.querySelectorAll('.nav-link');
        const header = document.querySelector('.glass-header');
        
        function initMobileMenu() {
            if (menuToggle && mainNav) {
                menuToggle.addEventListener('click', toggleMenu);
                
                // Fechar menu ao clicar em links (mobile)
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (window.innerWidth <= 768) {
                            closeMenu();
                        }
                    });
                });
            }
        }
        
        function toggleMenu() {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        }
        
        function closeMenu() {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function handleHeaderScroll() {
            header.classList.toggle('header-scrolled', window.scrollY > 50);
        }
        
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId !== '#') {
                        e.preventDefault();
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }
                    }
                });
            });
        }
        
        function highlightActiveMenu() {
            const sections = document.querySelectorAll('section');
            let currentSection = '';
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
        
        return {
            init: function() {
                initMobileMenu();
                initSmoothScrolling();
                window.addEventListener('scroll', () => {
                    requestAnimationFrame(highlightActiveMenu);
                    handleHeaderScroll();
                });
                highlightActiveMenu(); // Chamada inicial
            }
        };
    })();

     // =============================================
    // Módulo do Carrossel de Projetos (Atualizado)
    // =============================================
    const ProjectCarousel = (function() {
        function init() {
            document.querySelectorAll('.project-gallery').forEach(initGallery);
        }
        
        function initGallery(gallery) {
            const slider = gallery.querySelector('.gallery-slider');
            const slides = gallery.querySelectorAll('.slide');
            const prevBtn = gallery.querySelector('.prev-btn');
            const nextBtn = gallery.querySelector('.next-btn');
            const dotsContainer = gallery.querySelector('.dots-container');
            
            let currentIndex = 0;
            
            // Cria dots de navegação
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            // Pré-carrega imagens adjacentes
            function preloadAdjacentImages() {
                const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                const nextIndex = (currentIndex + 1) % slides.length;
                
                [prevIndex, nextIndex].forEach(index => {
                    const img = slides[index].querySelector('img');
                    if (img && !img.src && img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                });
            }
            
            function updateSlider() {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
                dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
                preloadAdjacentImages();
            }
            
            function goToSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                updateSlider();
                
                // Força o carregamento se a imagem não tiver sido carregada
                const currentImg = slides[currentIndex].querySelector('img');
                if (currentImg && !currentImg.src && currentImg.dataset.src) {
                    currentImg.src = currentImg.dataset.src;
                }
            }
            
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(currentIndex - 1);
            });
            
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(currentIndex + 1);
            });
            
            // Swipe para mobile
            let touchStartX = 0;
            gallery.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            gallery.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                
                if (diff > 50) goToSlide(currentIndex + 1); // Swipe left
                if (diff < -50) goToSlide(currentIndex - 1); // Swipe right
            }, { passive: true });
            
            // Carrega a primeira imagem imediatamente
            const firstImg = slides[0].querySelector('img');
            if (firstImg && firstImg.dataset.src) {
                firstImg.src = firstImg.dataset.src;
            }
        }
        
        return { init };
    })();

    // =============================================
    // Módulo do Modal de Imagens (Totalmente Reescrito)
    // =============================================
    const ImageModal = (function() {
        const modal = document.getElementById('modal');
        if (!modal) return { init: () => {} };
        
        const modalImg = modal.querySelector('.modal-img');
        const modalCaption = modal.querySelector('.modal-caption');
        const modalGallery = modal.querySelector('.modal-gallery');
        const closeBtn = modal.querySelector('.close-btn');
        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        const mobileIndicator = modal.querySelector('.mobile-indicator');
        
        let currentImages = [];
        let currentIndex = 0;
        
        function openModal(imagesArray, title) {
            if (!imagesArray || imagesArray.length === 0) return;
            
            currentImages = imagesArray;
            currentIndex = 0;
            
            // Limpa a galeria
            modalGallery.innerHTML = '';
            
            // Adiciona miniaturas
            imagesArray.forEach((img, index) => {
                const thumb = document.createElement('img');
                thumb.src = img.url;
                thumb.alt = img.title;
                thumb.classList.toggle('active', index === 0);
                
                thumb.addEventListener('click', () => {
                    currentIndex = index;
                    updateModalContent();
                });
                
                thumb.onerror = () => {
                    thumb.src = './src/img/fallback.jpg';
                };
                
                modalGallery.appendChild(thumb);
            });
            
            // Atualiza o modal
            updateModalContent();
            
            // Atualiza indicador mobile
            if (mobileIndicator) {
                mobileIndicator.querySelector('.current-img').textContent = currentIndex + 1;
                mobileIndicator.querySelector('.total-imgs').textContent = imagesArray.length;
            }
            
            // Exibe o modal
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        
        function updateModalContent() {
            if (!currentImages[currentIndex]) return;
            
            // Cria uma nova imagem para garantir o carregamento
            const newImg = new Image();
            newImg.src = currentImages[currentIndex].url;
            newImg.alt = currentImages[currentIndex].title;
            
            newImg.onload = () => {
                modalImg.src = newImg.src;
                modalImg.alt = newImg.alt;
                modalCaption.textContent = currentImages[currentIndex].title;
                
                // Atualiza miniaturas ativas
                modalGallery.querySelectorAll('img').forEach((img, idx) => {
                    img.classList.toggle('active', idx === currentIndex);
                });
                
                // Atualiza indicador mobile
                if (mobileIndicator) {
                    mobileIndicator.querySelector('.current-img').textContent = currentIndex + 1;
                }
            };
            
            newImg.onerror = () => {
                modalImg.src = './src/img/fallback.jpg';
                modalImg.alt = 'Imagem não disponível';
            };
        }
        
        function navigate(direction) {
            currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
            updateModalContent();
        }
        
        function closeModal() {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        function setupEventListeners() {
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => e.target === modal && closeModal());
            prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
            nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
            
            // Swipe para mobile
            let touchStartX = 0;
            modal.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            modal.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                if (touchStartX - touchEndX > 50) navigate(1);  // Swipe left
                if (touchStartX - touchEndX < -50) navigate(-1); // Swipe right
            }, { passive: true });
            
            // Teclado
            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('show')) return;
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            });
        }
        
        function initProjectListeners() {
            document.querySelectorAll('.project-gallery').forEach(gallery => {
                gallery.addEventListener('click', (e) => {
                    if (!e.target.closest('.nav-btn')) {
                        const activeSlide = gallery.querySelector('.slide.active');
                        if (activeSlide && activeSlide.dataset.images) {
                            try {
                                const images = JSON.parse(activeSlide.dataset.images);
                                const title = gallery.closest('.project-card').querySelector('h3').textContent;
                                openModal(images, title);
                            } catch (e) {
                                console.error("Erro ao analisar imagens:", e);
                                openModal([{ 
                                    url: './src/img/fallback.jpg', 
                                    title: 'Projeto indisponível' 
                                }], 'Erro ao carregar');
                            }
                        }
                    }
                });
            });
            
            document.querySelectorAll('.project-image').forEach(projectImage => {
                projectImage.addEventListener('click', () => {
                    const img = projectImage.querySelector('img');
                    const title = projectImage.closest('.project-card').querySelector('h3').textContent;
                    openModal([{ 
                        url: img.src || img.dataset.src || './src/img/fallback.jpg', 
                        title: title 
                    }], title);
                });
            });
        }
        
        function init() {
            setupEventListeners();
            initProjectListeners();
        }
        
        return { init };
    })();

    // =============================================
    // Módulo de Filtro de Projetos
    // =============================================
    const ProjectFilter = (function() {
        function init() {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const filter = this.dataset.filter;
                    
                    // Atualiza botões ativos
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Filtra projetos
                    document.querySelectorAll('.project-card').forEach(card => {
                        card.style.display = filter === 'all' || 
                            card.dataset.category === filter ? 'block' : 'none';
                    });
                });
            });
        }
        
        return { init };
    })();

    // =============================================
    // Módulo de Estatísticas Animadas
    // =============================================
    const AnimatedStats = (function() {
        function init() {
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        animateNumber(stat);
                        observer.unobserve(stat.parentElement);
                    }
                });
                
                observer.observe(stat.parentElement);
            });
        }
        
        function animateNumber(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            
            let current = 0;
            
            const increment = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(increment);
                } else {
                    element.textContent = target + '+';
                }
            };
            
            increment();
        }
        
        return { init };
    })();

    // =============================================
    // Módulo de Animações ao Scroll
    // =============================================
    const ScrollAnimations = (function() {
        function init() {
            const elements = document.querySelectorAll('section, .servico, .timeline-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1
            });
            
            elements.forEach(element => {
                observer.observe(element);
            });
        }
        
        return { init };
    })();

    // =============================================
    // Módulo de Otimização para Mobile (Atualizado)
    // =============================================
    const MobileOptimization = (function() {
        function init() {
            checkMobile();
            window.addEventListener('resize', checkMobile);
            initLazyLoading();
            initTouchEvents();
        }
        
        function checkMobile() {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            const video = document.querySelector('.hero-video');
            
            if (isMobile && video) {
                video.remove();
                document.querySelector('.hero-section').style.backgroundImage = 
                    'url("./src/img/img-mobile-fallback.jpg")';
            }
        }
        
        function initLazyLoading() {
            const lazyMedia = document.querySelectorAll('[loading="lazy"]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.tagName === 'IMG' && element.dataset.src) {
                            element.src = element.dataset.src;
                        }
                        observer.unobserve(element);
                    }
                });
            }, {
                rootMargin: '200px' // Carrega antes de chegar na viewport
            });
            
            lazyMedia.forEach(element => observer.observe(element));
        }
        
        function initTouchEvents() {
            // Melhora a resposta ao toque em elementos interativos
            document.querySelectorAll('button, a, [role="button"]').forEach(el => {
                el.style.touchAction = 'manipulation';
            });
        }
        
        return { init };
    })();

    // =============================================
    // Inicialização de Todos os Módulos
    // =============================================
    function initAll() {
        Navigation.init();
        ProjectCarousel.init();
        ImageModal.init();
        ProjectFilter.init();
        AnimatedStats.init();
        ScrollAnimations.init();
        MobileOptimization.init();
        
        // Garante que as imagens serão carregadas mesmo se o IntersectionObserver falhar
        setTimeout(() => {
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (!img.src) img.src = img.dataset.src;
            });
        }, 3000);
    }

    // Inicialização com fallback
    try {
        initAll();
    } catch (e) {
        console.error("Erro na inicialização:", e);
        // Fallback básico para garantir funcionalidade
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
});