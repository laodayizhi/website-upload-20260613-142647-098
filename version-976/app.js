(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobileNav.hasAttribute('hidden');
      if (isOpen) {
        mobileNav.removeAttribute('hidden');
        mobileButton.setAttribute('aria-expanded', 'true');
      } else {
        mobileNav.setAttribute('hidden', '');
        mobileButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  function nextHero() {
    showHero(heroIndex + 1);
  }

  function resetHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = window.setInterval(nextHero, 5200);
    }
  }

  if (slides.length) {
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        resetHeroTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        resetHeroTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-target') || 0));
        resetHeroTimer();
      });
    });
    resetHeroTimer();
  }

  var grid = document.getElementById('movieGrid');
  var searchInput = document.getElementById('movieSearch');
  var emptyState = document.querySelector('.empty-state');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!grid) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var activeChip = document.querySelector('.filter-chip.active');
    var filter = activeChip ? activeChip.getAttribute('data-filter') : '全部';
    var visible = 0;
    Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
      var text = cardText(card);
      var queryMatch = !query || text.indexOf(query) !== -1;
      var filterMatch = !filter || filter === '全部' || text.indexOf(normalize(filter)) !== -1;
      var show = queryMatch && filterMatch;
      card.classList.toggle('hidden-by-filter', !show);
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (grid) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (searchInput && q) {
      searchInput.value = q;
    }
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        applyFilters();
      });
    });
    applyFilters();
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var source = shell.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        playVideo();
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  initPlayers();
})();
