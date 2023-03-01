// Import Workbox libraries
const { offlineFallback, warmStrategyCache } = require("workbox-recipes");
const { CacheFirst } = require("workbox-strategies");
const { registerRoute } = require("workbox-routing");
const { CacheableResponsePlugin } = require("workbox-cacheable-response");
const { ExpirationPlugin } = require("workbox-expiration");
const { precacheAndRoute } = require("workbox-precaching/precacheAndRoute");

// Pre-cache all files listed in the Webpack manifest
precacheAndRoute(self.__WB_MANIFEST);

// Create a cache for HTML pages using the CacheFirst strategy
const pageCache = new CacheFirst({
  cacheName: "page-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60, // expire after 30 days
    }),
  ],
});

// Warm the pageCache by caching the homepage and index page
warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

// Register a route for navigation requests (i.e. clicking on links)
registerRoute(({ request }) => request.mode === "navigate", pageCache);

// TODO: Implement asset caching
// Register a route for non-navigation requests (i.e. assets like stylesheets, scripts, and workers)
registerRoute(
  ({ request }) => ["style", "script", "worker"].includes(request.destination),
  new CacheFirst({
    cacheName: "asset-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // expire after 7 days
      }),
    ],
  })
);
