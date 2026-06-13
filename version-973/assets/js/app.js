(function () {
  function each(selector, root, callback) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function bindMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function bindHeroSlider() {
    each('[data-hero-slider]', document, function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function bindFilters() {
    each('[data-filter-scope]', document, function (scope) {
      var parent = scope.parentElement || document;
      var search = scope.querySelector('[data-search-input]');
      var genre = scope.querySelector('[data-genre-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(parent.querySelectorAll('[data-movie-card]'));

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var genreValue = genre ? genre.value : 'all';
        var yearValue = year ? year.value : 'all';
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.genre, card.dataset.category].join(' ').toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchGenre = genreValue === 'all' || (card.dataset.genre || '').indexOf(genreValue) !== -1;
          var matchYear = yearValue === 'all' || card.dataset.decade === yearValue;
          card.classList.toggle('is-hidden', !(matchKeyword && matchGenre && matchYear));
        });
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (genre) {
        genre.addEventListener('change', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
    });
  }

  function loadScript(src, callback) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        callback();
      } else {
        existing.addEventListener('load', callback, { once: true });
      }
      return;
    }
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', function () {
      script.dataset.loaded = 'true';
      callback();
    });
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    if (!video || !source) {
      return;
    }

    var hlsInstance = null;
    var started = false;

    function attachAndPlay() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js', function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', attachAndPlay);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (!started) {
        attachAndPlay();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  bindMobileMenu();
  bindHeroSlider();
  bindFilters();
})();
