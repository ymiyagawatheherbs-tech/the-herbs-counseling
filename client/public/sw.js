// THE HERBS パーソナルカウンセリング - Service Worker
const CACHE_NAME = "herbs-counseling-v1";

// インストール時：基本アセットをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/manifest.json"]);
    })
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ時：ネットワーク優先、失敗時にキャッシュから返す
self.addEventListener("fetch", (event) => {
  // APIリクエストはキャッシュしない
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したレスポンスをキャッシュに保存
        if (response.ok && event.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // ネットワーク失敗時はキャッシュから返す
        return caches.match(event.request).then((cached) => {
          return cached || new Response("オフラインです。ネットワーク接続を確認してください。", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        });
      })
  );
});
