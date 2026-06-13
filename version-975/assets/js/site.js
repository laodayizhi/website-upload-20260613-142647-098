(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                var expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                panel.hidden = expanded;
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot') || 0));
                    start();
                });
            });
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            start();
        }

        document.querySelectorAll('.section-actions').forEach(function (actions) {
            var section = actions.closest('.content-section');
            var area = section ? section.querySelector('[data-scroll-area]') : null;
            if (!area) {
                return;
            }
            actions.querySelectorAll('[data-scroll]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var direction = button.getAttribute('data-scroll') === 'left' ? -1 : 1;
                    area.scrollBy({
                        left: direction * 420,
                        behavior: 'smooth'
                    });
                });
            });
        });

        var searchInput = document.querySelector('.movie-search');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
        var empty = document.querySelector('.empty-result');
        var pills = Array.prototype.slice.call(document.querySelectorAll('[data-filter-pill]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var activeFilter = 'all';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function cardMatches(card, query, filter) {
            var text = (card.getAttribute('data-filter') || '').toLowerCase();
            var group = card.getAttribute('data-group') || '';
            var channel = card.getAttribute('data-channel') || '';
            var channelName = '';
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = filter === 'all' || group === filter || channel === filter || text.indexOf(filter.toLowerCase()) !== -1 || channelName === filter;
            return matchesQuery && matchesFilter;
        }

        function applyFilter() {
            if (!cards.length) {
                return;
            }
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var shown = 0;
            cards.forEach(function (card) {
                var visible = cardMatches(card, query, activeFilter);
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
            var form = searchInput.closest('form');
            if (form) {
                form.addEventListener('submit', function (event) {
                    if (cards.length) {
                        event.preventDefault();
                        applyFilter();
                    }
                });
            }
        }

        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                activeFilter = pill.getAttribute('data-filter-pill') || 'all';
                pills.forEach(function (other) {
                    other.classList.toggle('is-active', other === pill);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
})();
