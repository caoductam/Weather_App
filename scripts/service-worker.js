const CACHE_NAME = 'weather-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/style.css',
    '/scripts/app.js',
    '/scripts/storage.js',
    '/manifest.json',
    // Thêm các đường dẫn đến icon và các tài nguyên khác
];

// Cài đặt Service Worker và cache các tài nguyên
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Phục vụ các yêu cầu từ cache khi offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Trả về từ cache nếu tìm thấy
                if (response) {
                    return response;
                }
                
                // Nếu không có trong cache, thực hiện yêu cầu mạng
                return fetch(event.request).then((response) => {
                    // Kiểm tra response hợp lệ
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone response để lưu vào cache
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Xóa cache cũ khi cập nhật Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});