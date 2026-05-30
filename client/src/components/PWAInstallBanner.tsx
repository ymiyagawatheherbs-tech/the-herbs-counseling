import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // すでに非表示にした場合はスキップ
    const wasDismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) return;

    // スタンドアロンモード（すでにインストール済み）ならスキップ
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS判定
    const ua = navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iosDevice);

    if (iosDevice) {
      // iOSは3秒後にバナー表示
      setTimeout(() => setShowBanner(true), 3000);
    } else {
      // Android/PC: beforeinstallpromptイベントを待つ
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setTimeout(() => setShowBanner(true), 3000);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!showBanner || dismissed) return null;

  return (
    <>
      {/* インストールバナー */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 shadow-lg"
        style={{ backgroundColor: "#F4EFE6", borderTop: "1px solid #C9B99A" }}
      >
        <div className="flex items-start gap-3 max-w-lg mx-auto">
          <img
            src="/manus-storage/herbs-icon-192_ed669bc6.png"
            alt="THE HERBS"
            className="w-12 h-12 rounded-xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" style={{ color: "#3D2B1F" }}>
              ホーム画面に追加する
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6B5744" }}>
              アプリとして使えるようになります
            </p>
            <button
              onClick={handleInstall}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: "#8B7355" }}
            >
              <Download className="w-3.5 h-3.5" />
              {isIOS ? "追加方法を見る" : "ホーム画面に追加"}
            </button>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-full flex-shrink-0" style={{ color: "#8B7355" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS向け手順ガイド */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "#F4EFE6" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" style={{ color: "#8B7355" }} />
                <h3 className="font-medium" style={{ color: "#3D2B1F" }}>ホーム画面への追加方法</h3>
              </div>
              <button onClick={() => { setShowIOSGuide(false); handleDismiss(); }}>
                <X className="w-5 h-5" style={{ color: "#8B7355" }} />
              </button>
            </div>
            <ol className="space-y-3">
              {[
                { step: "1", text: "画面下部の「共有」ボタン（□↑）をタップ" },
                { step: "2", text: "メニューを下にスクロールして「ホーム画面に追加」をタップ" },
                { step: "3", text: "右上の「追加」をタップして完了" },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "#8B7355" }}
                  >
                    {step}
                  </span>
                  <span className="text-sm pt-0.5" style={{ color: "#3D2B1F" }}>{text}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
              className="mt-5 w-full py-2.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "#8B7355" }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
