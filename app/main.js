// main.js — bootstrap: start the router once the document is ready.
// All pages, charts and data live in the modules this file imports.

import { initRouter } from './router.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouter);
} else {
  initRouter();
}
