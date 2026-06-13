(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var query = new URLSearchParams(window.location.search).get("q");

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-text]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      if (!cards.length) {
        return;
      }

      if (query && input) {
        input.value = query;
      }

      function matchYear(card, yearValue) {
        if (!yearValue) {
          return true;
        }

        var year = parseInt(card.getAttribute("data-year") || "0", 10);
        var selected = parseInt(yearValue, 10);

        if (selected === 2010) {
          return year >= 2010 && year <= 2019;
        }

        if (selected === 2000) {
          return year >= 2000 && year <= 2009;
        }

        if (selected === 1990) {
          return year > 0 && year <= 1999;
        }

        return year === selected;
      }

      function apply() {
        var text = normalize(input ? input.value : "");
        var yearValue = yearSelect ? yearSelect.value : "";
        var typeValue = normalize(typeSelect ? typeSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var typeHaystack = normalize(card.getAttribute("data-type") + " " + card.getAttribute("data-tags"));
          var ok = true;

          if (text && haystack.indexOf(text) === -1) {
            ok = false;
          }

          if (typeValue && typeHaystack.indexOf(typeValue) === -1) {
            ok = false;
          }

          if (!matchYear(card, yearValue)) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var button = document.getElementById("player-button");
    var hls = null;
    var loaded = false;

    if (!video || !sourceUrl) {
      return;
    }

    function setReady() {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 24
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              if (hls) {
                hls.destroy();
                hls = null;
              }
            }
          }
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function playMovie() {
      loadSource();
      setReady();

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playMovie);
    }

    if (button) {
      button.addEventListener("click", playMovie);
    }

    video.addEventListener("play", setReady);
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("hidden");
      }
    });
  };
})();
