
// In a real app, this would be your measurement ID from Google Analytics.
// It's recommended to store this in an environment variable.
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

/**
 * Tracks a page view using Google Analytics.
 * @param path The path of the page to track (e.g., '/portfolio').
 */
export const trackPageView = (path: string) => {
    if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: path,
        });
    } else {
        console.log(`Analytics: PageView tracked for ${path}`);
    }
};

/**
 * Tracks a custom event using Google Analytics.
 * @param action The action of the event (e.g., 'click').
 * @param category The category of the event (e.g., 'Portfolio').
 * @param label A label for the event (e.g., 'Delete Domain').
 * @param value An optional numeric value for the event.
 */
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
     if (typeof window.gtag === 'function') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } else {
         console.log(`Analytics: Event tracked - Action: ${action}, Category: ${category}, Label: ${label}`);
    }
};
