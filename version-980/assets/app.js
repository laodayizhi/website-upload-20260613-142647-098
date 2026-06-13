(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var siteNav = document.querySelector("[data-site-nav]");
        if (menuButton && siteNav) {
            menuButton.addEventListener("click", function () {
                siteNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).map(function (panel) {
            return panel.parentElement || document;
        });
        if (!roots.length) {
            roots = [document];
        }

        roots.forEach(function (root) {
            var search = root.querySelector("[data-movie-search]");
            var genre = root.querySelector("[data-genre-filter]");
            var year = root.querySelector("[data-year-filter]");
            var clear = root.querySelector("[data-clear-filter]");
            var empty = root.querySelector("[data-no-results]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function applyFilters() {
                var q = normalize(search && search.value);
                var selectedGenre = normalize(genre && genre.value);
                var selectedYear = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region + " " + card.dataset.year);
                    var matchSearch = !q || text.indexOf(q) !== -1;
                    var matchGenre = !selectedGenre || normalize(card.dataset.genre).indexOf(selectedGenre) !== -1;
                    var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                    var show = matchSearch && matchGenre && matchYear;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    if (genre) {
                        genre.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    applyFilters();
                });
            }
        });
    });
})();
