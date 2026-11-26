// router.js — a tiny hash router. Every page of the site is a hash route
// (#/economy, #/regions, ...), each reached by a link in the sidebar nav.
// The router renders the page, marks the active nav link, scrolls to the
// top, and then tells the page it is ready for its screenshot.

import { NAV } from './data.js';
import { renderPage } from './pages.js';

const TITLES = {
  '/': 'Dashboard',
  '/population': 'Population',
  '/economy': 'Economy',
  '/labour': 'Labour market',
  '/prices': 'Prices',
  '/trade': 'Trade',
  '/health': 'Health',
  '/education': 'Education',
  '/regions': 'Regions',
  '/releases': 'Release calendar',
  '/methods': 'Methods and sources',
  '/explorer': 'Data explorer',
};

export function currentRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1).split('?')[0] || '/';
  return TITLES[path] ? path : '/';
}

function buildNav() {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = NAV.map(
    (item) => `<a href="${item.route}" data-route="${item.route}">${item.label}</a>`,
  ).join('');
}

export function route() {
  const path = currentRoute();
  const root = document.getElementById('page');
  window.__shotReady = false;
  renderPage(path, root);
  document.querySelectorAll('#main-nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-route') === '#' + path);
  });
  document.title = TITLES[path] + ' — Meridia National Statistics';
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  document.getElementById('main-nav').classList.remove('open');
  window.scrollTo(0, 0);
  // Charts draw synchronously inside renderPage; one frame later the page
  // is fully painted and ready for a screenshot.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}

export function initRouter() {
  buildNav();
  window.addEventListener('hashchange', route);
  document.getElementById('menu-toggle').addEventListener('click', () => {
    const nav = document.getElementById('main-nav');
    const open = nav.classList.toggle('open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded', String(open));
  });
  route();
}
