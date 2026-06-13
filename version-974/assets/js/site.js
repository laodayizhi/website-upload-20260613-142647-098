(function () {
    function list(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function clean(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileNav() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = list(".hero-slide", slider);
        var dots = list("[data-hero-dot]", slider);
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        list("[data-card-filter]").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-card-filter");
            var target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }
            var cards = list(".movie-card", target);
            var keyword = panel.querySelector("[data-search-input]");
            var year = panel.querySelector("[data-year-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var region = panel.querySelector("[data-region-filter]");

            function apply() {
                var keywordValue = clean(keyword && keyword.value);
                var yearValue = clean(year && year.value);
                var typeValue = clean(type && type.value);
                var regionValue = clean(region && region.value);

                cards.forEach(function (card) {
                    var cardText = clean([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matched = true;
                    if (keywordValue && cardText.indexOf(keywordValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && clean(card.getAttribute("data-year")) !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && clean(card.getAttribute("data-type")) !== typeValue) {
                        matched = false;
                    }
                    if (regionValue && clean(card.getAttribute("data-region")) !== regionValue) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }

            [keyword, year, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.setupMoviePlayer = function (playSource) {
        var video = document.getElementById("mainVideo");
        var layer = document.querySelector("[data-play-layer]");
        var trigger = document.querySelector("[data-play-trigger]");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !playSource) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playSource);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playSource;
            }
            loaded = true;
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        if (layer) {
            layer.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        attach();
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHeroSlider();
        initCardFilters();
    });
})();
