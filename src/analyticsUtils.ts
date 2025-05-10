type GtagParams = {
  [key: string]: any;
};

/**
 * カスタムイベントを送信します
 * @param eventName - イベント名
 * @param params - イベントパラメータ（任意）
 */
export function trackEvent(eventName: string, params?: GtagParams): void {
  if (import.meta.env.PROD && typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  } else {
    console.debug("[trackEvent]", eventName, params);
  }
}

/**
 * ページビューを送信します
 * @param path - パス（例: "/about"）
 * @param title - タイトル（任意）
 */
export function trackPageView(path: string, title?: string): void {
  if (import.meta.env.PROD && typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title,
    });
  } else {
    console.debug("[trackPageView]", path, title);
  }
}

/**
 * エラーイベントを送信します
 * @param description - エラーの説明
 * @param fatal - 致命的かどうか（デフォルト: false）
 */
export function trackError(description: string, fatal: boolean = false): void {
  trackEvent("exception", {
    description,
    fatal,
  });
}

