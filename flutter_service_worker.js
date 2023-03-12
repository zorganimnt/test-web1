'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "6d21fac52ccd647889323c78478c7e71",
"index.html": "4fba63237e3dea2b94028c0168440447",
"/": "4fba63237e3dea2b94028c0168440447",
"main.dart.js": "e0d7baf384bc8a4ee3e7cb18213d09fa",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "10d5015bdb05fc5ae8fa3f0b0661281d",
"assets/AssetManifest.json": "1d7308285d9b7925a06beb7e003941e0",
"assets/NOTICES": "437e2e675ba256f82d706eadbf7a00d3",
"assets/FontManifest.json": "40fb07695abfce1418a5bd6b9d2ce800",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/shaders/ink_sparkle.frag": "dcb307b1e37c2201e4ca31ca8250b2ac",
"assets/fonts/luckiest_guy.ttf": "c6004be49628b1226eb31b068348d24f",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/icons/team.png": "9f65b18d1237d4300fbe3b87907d4cac",
"assets/assets/icons/classique.png": "312241f2d04d276dfa6b23e984e61bf1",
"assets/assets/icons/ludo.png": "f502f65d4f1c6fb381f3a6ddf12a43fd",
"assets/assets/icons/yellow.png": "39a27b31d2a8f412bacdbb24560729d4",
"assets/assets/icons/blue.png": "87e67187fd92a349da1c3c380cd630b0",
"assets/assets/icons/person.png": "5881d504ebde91e6ee176adefb06b5c4",
"assets/assets/icons/plus.svg": "ddccab75c86d4e0f19df1da795bd293e",
"assets/assets/icons/check.svg": "4408ba455d1474b1cc5e60b9803da746",
"assets/assets/icons/close.svg": "65d9cce0a6e3ade8bce733b7d5554fb7",
"assets/assets/icons/red.svg": "3fcf060ddfea85e9ff37afd09f4033fc",
"assets/assets/icons/green.png": "8daaa9fdfbdae49c05512851b94db059",
"assets/assets/icons/classs.png": "1cb17ea4a42637a32d9b15633dc2714a",
"assets/assets/icons/logo.png": "636d512471ad35d002549ece2f8931d2",
"assets/assets/icons/spin.png": "870393786ff51dad8de96d94a7ceb199",
"assets/assets/icons/modern.png": "a40466856622c76b77251f9ddfca4d9b",
"assets/assets/icons/vip.png": "b172a4c5a4c3bf9dfd25d432fb18726d",
"assets/assets/icons/btn2.png": "b54181216ef9f51ba7ba58d578e9ad86",
"assets/assets/icons/bg1.jpeg": "9d453a729ae8c99bab387e1359e1ede2",
"assets/assets/icons/btn1.png": "563a635acbb2b9d2e1e65e6bbbe12dfd",
"assets/assets/icons/coin.png": "75dac4be48af9e0be0359dd1c29bbf53",
"assets/assets/icons/bg.jpeg": "38c9c8921de6142552c34d07b0b018b2",
"assets/assets/icons/minus.svg": "52732932e47cecda9116e1398959556a",
"assets/assets/icons/red.png": "44c4e4865437e154d415242a577dafa7",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
