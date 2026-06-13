(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    if (menuButton) {
      menuButton.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector("[data-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var active = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function startCarousel() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide") || 0));
          startCarousel();
        });
      });
      startCarousel();
    }

    var searchInput = document.querySelector(".movie-search");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle("is-hidden", !(matchKeyword && matchFilter));
      });
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    var player = document.querySelector(".movie-player");
    if (player) {
      var video = player.querySelector(".player-video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var prepared = false;
      var hlsInstance = null;

      function prepareVideo() {
        if (prepared || !video || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.controls = true;
      }

      function startVideo() {
        prepareVideo();
        player.classList.add("is-playing");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (cover && video) {
        cover.addEventListener("click", startVideo);
        video.addEventListener("click", function () {
          if (!prepared || video.paused) {
            startVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
