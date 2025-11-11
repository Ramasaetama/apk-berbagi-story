/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'berbagi-story-v2'; // Increment version
const API_CACHE_NAME = 'api-cache-v1';
const IMAGE_CACHE_NAME = 'image-cache-v1';

// Minimal critical files to cache
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-96x96.png',
  './icons/icon-144x144.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        // Cache with error handling for each file
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: All files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache all assets dynamically
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip POST, PUT, DELETE requests - only cache GET
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First strategy with cache fallback
  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response
            return new Response(JSON.stringify({ 
              error: true, 
              message: 'Offline - Data tidak tersedia' 
            }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Image requests - Cache First strategy
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Cache image if successful
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Return placeholder if offline
          return caches.match('./icons/icon-192x192.png');
        });
      })
    );
    return;
  }

  // For CSS, JS, fonts, and other static assets - Stale While Revalidate
  if (
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'font' ||
    /\.(css|js|woff|woff2|ttf|otf)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            // Update cache with new version
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Network failed, return cached if available
            return cachedResponse;
          });

          // Return cached response immediately, but update cache in background
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Other requests (HTML, documents) - Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If document request, return cached index.html
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  let notificationData = {
    title: 'Berbagi Story',
    body: 'Ada cerita baru!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-96x96.png',
    tag: 'story-notification',
    data: {
      url: './#/stories'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'Cerita Baru',
        body: data.body || data.message || 'Ada cerita baru yang dibagikan!',
        icon: data.icon || './icons/icon-192x192.png',
        badge: './icons/icon-96x96.png',
        image: data.image || null,
        tag: data.tag || 'story-notification',
        data: {
          url: data.url || './#/stories',
          storyId: data.storyId || null
        },
        actions: [
          {
            action: 'open',
            title: 'Lihat Detail',
            icon: './icons/icon-96x96.png'
          },
          {
            action: 'close',
            title: 'Tutup',
            icon: './icons/icon-96x96.png'
          }
        ],
        requireInteraction: false,
        vibrate: [200, 100, 200]
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || './#/stories';

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnmerged: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event for offline stories
self.addEventListener('sync', (event) => {
  console.log('Background sync event', event.tag);
  
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  try {
    // Open IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('offline-stories', 'readonly');
    const store = tx.objectStore('offline-stories');
    const offlineStories = await store.getAll();
    
    if (offlineStories.length === 0) {
      console.log('No offline stories to sync');
      return;
    }

    console.log(`Syncing ${offlineStories.length} offline stories...`);

    // Sync each story
    for (const story of offlineStories) {
      try {
        const token = story.token;
        const formData = new FormData();
        formData.append('description', story.description);
        
        // Convert base64 to blob if needed
        if (story.photo) {
          const blob = await fetch(story.photo).then(r => r.blob());
          formData.append('photo', blob, 'photo.jpg');
        }
        
        if (story.lat && story.lon) {
          formData.append('lat', story.lat);
          formData.append('lon', story.lon);
        }

        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          // Remove from offline storage
          const deleteTx = db.transaction('offline-stories', 'readwrite');
          const deleteStore = deleteTx.objectStore('offline-stories');
          await deleteStore.delete(story.id);
          console.log('Story synced successfully:', story.id);
        }
      } catch (error) {
        console.error('Error syncing story:', error);
      }
    }

    // Notify user
    self.registration.showNotification('Sinkronisasi Selesai', {
      body: `${offlineStories.length} cerita berhasil disinkronkan`,
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-96x96.png'
    });

  } catch (error) {
    console.error('Error in syncOfflineStories:', error);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('berbagi-story-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
