// Lemon Squeezy Integration Utility
// Handles checkout flow with Supabase user metadata

export interface CheckoutOptions {
  userId: string;
  userEmail: string;
  username?: string;
}

/**
 * Opens Lemon Squeezy checkout overlay with user metadata
 * @param productId - Lemon Squeezy product ID
 * @param options - User information to pass as custom metadata
 */
export function openLemonSqueezyCheckout(
  productId: string,
  options: CheckoutOptions
): void {
  // Check if Lemon.js is loaded
  if (typeof window.createLemonSqueezy !== 'function') {
    console.error('Lemon Squeezy SDK not loaded');
    alert('Payment system is loading. Please try again in a moment.');
    return;
  }

  // Initialize Lemon Squeezy
  window.createLemonSqueezy();

  // Build checkout URL with custom metadata
  const checkoutUrl = `https://store.lemonsqueezy.com/checkout/buy/${productId}`;
  
  // Encode user metadata as query parameters
  const metadata = {
    supabase_user_id: options.userId,
    supabase_user_email: options.userEmail,
    username: options.username || '',
  };

  // Open checkout with metadata
  window.LemonSqueezy?.Url?.Open(checkoutUrl, {
    checkoutData: {
      email: options.userEmail,
      custom: {
        user_id: options.userId,
        user_email: options.userEmail,
        username: options.username || '',
      },
    },
  });
}

/**
 * Alternative method using direct URL with query parameters
 */
export function openLemonSqueezyCheckoutDirect(
  productId: string,
  options: CheckoutOptions
): void {
  const baseUrl = `https://store.lemonsqueezy.com/checkout/buy/${productId}`;
  
  // Encode metadata in URL
  const params = new URLSearchParams({
    'checkout[email]': options.userEmail,
    'checkout[custom][user_id]': options.userId,
    'checkout[custom][user_email]': options.userEmail,
    'checkout[custom][username]': options.username || '',
  });

  const checkoutUrl = `${baseUrl}?${params.toString()}`;
  
  // Open in new window or use Lemon Squeezy overlay
  if (typeof window.createLemonSqueezy === 'function') {
    window.createLemonSqueezy();
    window.LemonSqueezy?.Url?.Open(checkoutUrl);
  } else {
    // Fallback: open in new tab
    window.open(checkoutUrl, '_blank');
  }
}

/**
 * Product IDs for different tiers
 * Replace these with your actual Lemon Squeezy product IDs
 */
export const PRODUCT_IDS = {
  SNAKE_PASS_BASIC: 'your-basic-product-id',
  SNAKE_PASS_PREMIUM: 'your-premium-product-id',
  SNAKE_PASS_ULTIMATE: 'your-ultimate-product-id',
  COIN_PACK_SMALL: 'your-coin-small-id',
  COIN_PACK_MEDIUM: 'your-coin-medium-id',
  COIN_PACK_LARGE: 'your-coin-large-id',
};

/**
 * Helper to check if Lemon Squeezy is loaded
 */
export function isLemonSqueezyLoaded(): boolean {
  return typeof window.createLemonSqueezy === 'function';
}

/**
 * Load Lemon Squeezy SDK dynamically if not already loaded
 */
export function loadLemonSqueezySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLemonSqueezyLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Lemon Squeezy SDK'));
    document.head.appendChild(script);
  });
}

// Type declarations for Lemon Squeezy
declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy?: {
      Url: {
        Open: (url: string, options?: any) => void;
      };
      Setup: (callback: () => void) => void;
    };
  }
}
