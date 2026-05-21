/* Quranic Numerics — Theme Engine
   Handles: preference storage, toggle sync, system-pref listener.
   The no-flash init runs inline in <head> on each page.
   Load this file: <script src="theme.js"></script> before </body>
*/
(function () {
  'use strict';

  var KEY = 'qn_theme';

  function getStored()       { return localStorage.getItem(KEY) || 'system'; }
  function isSystemDark()    { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function resolve(pref)     { return pref === 'system' ? (isSystemDark() ? 'dark' : 'light') : pref; }

  function applyResolved(res, animate) {
    var html = document.documentElement;
    if (!animate) {
      html.setAttribute('data-theme', res);
      return;
    }
    /* View Transitions API — radial reveal from stored click coords */
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        html.setAttribute('data-theme', res);
      });
    } else {
      /* Fallback: class-based cross-fade */
      html.classList.add('theme-fx');
      html.setAttribute('data-theme', res);
      setTimeout(function () { html.classList.remove('theme-fx'); }, 420);
    }
  }

  function syncButtons(pref) {
    document.querySelectorAll('.tt-btn[data-theme-val]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.themeVal === pref);
    });
  }

  function setTheme(pref) {
    localStorage.setItem(KEY, pref);
    applyResolved(resolve(pref), true);
    syncButtons(pref);
  }

  /* React to OS-level dark/light changes when user chose "System" */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (getStored() === 'system') applyResolved(resolve('system'), true);
  });

  document.addEventListener('DOMContentLoaded', function () {
    syncButtons(getStored());

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.tt-btn[data-theme-val]');
      if (!btn) return;

      /* Store click coords for the radial View Transition origin */
      var r = btn.getBoundingClientRect();
      document.documentElement.style.setProperty('--vt-x', (r.left + r.width  / 2) + 'px');
      document.documentElement.style.setProperty('--vt-y', (r.top  + r.height / 2) + 'px');

      setTheme(btn.dataset.themeVal);
    });
  });
}());
