(function () {
  'use strict';

  // ---- Data (single source of truth for both light and dark pages) ----
  var MOVIES = [
    { title: 'Hunt for the Wilderpeople', year: 2016 },
    { title: 'Mission Impossible: Rogue Nation', year: 2015 },
    { title: 'Her', year: 2013 },
    { title: 'The Little Hours', year: 2017 },
    { title: 'Blade Runner', year: 1982 },
    { title: 'The Thing', year: 1982 },
    { title: 'The Fifth Element', year: 1997 },
    { title: 'Terminator 2', year: 1991 },
    { title: 'Mars Express', year: 2023 },
    { title: 'Past Lives', year: 2023 },
    { title: 'Starship Troopers', year: 1997 }
  ];

  var SHOWS = [
    { title: 'Succession', year: 2018 },
    { title: 'The Office', year: 2005 },
    { title: 'Futurama', year: 1999 },
    { title: 'What We Do In The Shadows', year: 2019 },
    { title: 'Better Call Saul', year: 2015 },
    { title: 'Freaks and Geeks', year: 1999 },
    { title: 'Firefly', year: 2002 },
    { title: 'White Lotus', year: 2021 }
  ];

  var TOTAL = MOVIES.length + SHOWS.length;

  function groupByYear(list) {
    var years = [];
    list.forEach(function (item) {
      if (years.indexOf(item.year) === -1) years.push(item.year);
    });
    years.sort(function (a, b) {
      return b - a;
    });
    return years.map(function (year) {
      return {
        year: year,
        items: list.filter(function (i) {
          return i.year === year;
        })
      };
    });
  }

  // ---- Rendering ----
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildSection(label, kind, groups, count) {
    var section = el('div', 'section ' + kind);

    var head = el('div', 'section-head');
    head.appendChild(el('span', 'section-badge', label));
    head.appendChild(el('span', 'section-count', String(count)));
    section.appendChild(head);

    groups.forEach(function (grp) {
      var group = el('div', 'year-group');
      group.appendChild(el('p', 'year-label', String(grp.year)));
      var rows = el('div', 'rows');
      grp.items.forEach(function (item) {
        var row = el('div', 'row');
        row.appendChild(el('span', 'row-title', item.title));
        rows.appendChild(row);
      });
      group.appendChild(rows);
      section.appendChild(group);
    });

    return section;
  }

  function render(root, subtitle, query) {
    var q = query.trim().toLowerCase();
    var match = function (item) {
      return !q || item.title.toLowerCase().indexOf(q) !== -1;
    };
    var movies = MOVIES.filter(match);
    var shows = SHOWS.filter(match);

    subtitle.textContent =
      TOTAL + ' titles · ' + movies.length + ' movies · ' + shows.length + ' shows';

    root.textContent = '';

    if (movies.length) {
      root.appendChild(buildSection('Movies', 'movies', groupByYear(movies), movies.length));
    }
    if (shows.length) {
      root.appendChild(buildSection('Shows', 'shows', groupByYear(shows), shows.length));
    }
    if (q && !movies.length && !shows.length) {
      root.appendChild(el('p', 'empty', 'No titles match "' + query.trim() + '"'));
    }
  }

  // ---- Wiring ----
  function init() {
    var root = document.getElementById('list');
    var subtitle = document.getElementById('subtitle');
    var search = document.getElementById('search');
    if (!root || !subtitle || !search) return;

    // Only re-render when the query actually changes, so identical
    // keystrokes don't restart the fade-in animation.
    var lastKey = null;
    function update() {
      var key = search.value.trim().toLowerCase();
      if (key === lastKey) return;
      lastKey = key;
      render(root, subtitle, search.value);
    }
    update();
    search.addEventListener('input', update);

    // Share: copy the page URL.
    var shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      var shareIcon = document.getElementById('share-icon');
      var shareLabel = document.getElementById('share-label');
      var timer;
      shareBtn.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(function () {});
        }
        shareBtn.classList.add('copied');
        if (shareIcon) shareIcon.textContent = 'check';
        if (shareLabel) shareLabel.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          shareBtn.classList.remove('copied');
          if (shareIcon) shareIcon.textContent = 'link';
          if (shareLabel) shareLabel.textContent = 'Share';
        }, 1800);
      });
    }

    // Theme toggle (absent on the always-on dark page).
    var toggle = document.getElementById('theme-toggle');
    if (toggle && !window.__forceDark) {
      toggle.addEventListener('click', function () {
        var dark = document.body.classList.toggle('dark-mode');
        try {
          localStorage.setItem('theme', dark ? 'dark' : 'light');
        } catch (e) {
          /* ignore storage errors */
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
