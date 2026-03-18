/**
 * Provider Widget URL Builder — sBTC On-Ramp Aggregator
 *
 * Constructs embeddable widget URLs for each on-ramp provider.
 * All providers support URL/iframe-based embeds with query parameters
 * for amount, currency, crypto asset, and wallet address.
 */

// ─── Provider Config ─────────────────────────────────────────────────────────

export interface ProviderWidgetConfig {
  /** Base URL for the widget (sandbox vs production) */
  baseUrl: string;
  /** Whether the widget requires an API key */
  requiresApiKey: boolean;
  /** The actual API key */
  apiKey?: string;
  /** Query parameter name for the API key */
  apiKeyParam?: string;
}

/**
 * Lazily resolve whether we're in production.
 * Reading process.env at function-call time avoids the Vercel/Turbopack issue
 * where env vars aren't available yet during module initialisation.
 */
function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet";
}

/**
 * Build the provider config map on demand so that every `process.env.*` read
 * happens at call-time, not at module-load time.
 */
function getProviderConfigs(): Record<string, ProviderWidgetConfig> {
  const prod = isProduction();
  return {
    Transak: {
      baseUrl: prod
        ? "https://global.transak.com"
        : "https://global-stg.transak.com",
      requiresApiKey: true,
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "",
      apiKeyParam: "apiKey",
    },
    Guardarian: {
      baseUrl: "https://guardarian.com/calculator/v1/",
      requiresApiKey: true,
      apiKey: process.env.NEXT_PUBLIC_GUARDARIAN_API_KEY || "",
      apiKeyParam: "partner_api_token",
    },
    "Onramp.money": {
      baseUrl: prod
        ? "https://onramp.money/main/buy"
        : "https://staging.onramp.money/main/buy",
      requiresApiKey: true,
      apiKey: process.env.NEXT_PUBLIC_ONRAMP_API_KEY || "",
      apiKeyParam: "appId",
    },
    "Mt Pelerin": {
      baseUrl: "https://widget.mtpelerin.com",
      requiresApiKey: true,
      apiKey: process.env.NEXT_PUBLIC_MTPELERIN_API_KEY || "",
      apiKeyParam: "_ctkn",
    },
  };
}

// ─── URL Builder ──────────────────────────────────────────────────────────────

export interface WidgetUrlParams {
  provider: string;
  amount: number;
  currency: string;
  walletAddress: string;
}

/**
 * Build the embeddable widget URL for a given provider.
 * Returns null if the provider requires an API key that isn't configured.
 */
export function buildProviderWidgetUrl(params: WidgetUrlParams): string | null {
  const { provider, amount, currency, walletAddress } = params;
  const config = getProviderConfigs()[provider];

  if (!config) return null;

  // Check API key availability
  let apiKey: string | undefined;
  if (config.requiresApiKey && config.apiKey) {
    apiKey = config.apiKey;
  } else if (config.requiresApiKey && !config.apiKey) {
    // Return a fallback direct link without embed
    return getProviderFallbackUrl(provider);
  }

  const url = new URL(config.baseUrl);

  switch (provider) {
    case "Transak":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("cryptoCurrencyCode", "BTC");
      url.searchParams.set("fiatCurrency", currency.toUpperCase());
      url.searchParams.set("fiatAmount", amount.toString());
      url.searchParams.set("walletAddress", walletAddress);
      url.searchParams.set("network", "bitcoin");
      url.searchParams.set("themeColor", "f7931a");
      url.searchParams.set("hideMenu", "true");
      url.searchParams.set("disableWalletAddressForm", "true");
      break;

    case "Guardarian":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("default_fiat_currency", currency.toUpperCase());
      url.searchParams.set("default_crypto_currency", "BTC");
      url.searchParams.set("default_fiat_amount", amount.toString());
      url.searchParams.set("create_nav_behaviour", "new_tab");
      url.searchParams.set("theme", "orange");
      url.searchParams.set("payment_address", walletAddress);
      break;

    case "Onramp.money":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("coinCode", "btc");
      url.searchParams.set("fiatAmount", amount.toString());
      url.searchParams.set("fiatType", currency.toUpperCase());
      url.searchParams.set("walletAddress", walletAddress);
      break;

    case "Mt Pelerin":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("type", "buy");
      url.searchParams.set("tab", "buy");
      url.searchParams.set("crys", "BTC");
      url.searchParams.set("bsc", currency.toUpperCase());
      url.searchParams.set("bsa", amount.toString());
      url.searchParams.set("addr", walletAddress);
      url.searchParams.set("net", "bitcoin");
      url.searchParams.set("rfr", "sbtc-onramp"); // referral code placeholder
      break;

    default:
      return null;
  }

  return url.toString();
}

/**
 * Get a direct link to the provider's website (used when API key is missing).
 */
export function getProviderFallbackUrl(provider: string): string | null {
  const FALLBACK_URLS: Record<string, string> = {
    Transak: "https://global.transak.com",
    Guardarian: "https://guardarian.com",
    "Onramp.money": "https://onramp.money/main/buy",
    "Mt Pelerin": "https://www.mtpelerin.com/buy-bitcoin",
  };
  return FALLBACK_URLS[provider] ?? null;
}

/**
 * Check if a provider has a valid API key configured.
 */
export function isProviderConfigured(provider: string): boolean {
  const config = getProviderConfigs()[provider];
  if (!config) return false;
  if (!config.requiresApiKey) return true; // Mt Pelerin
  const key = config.apiKey;
  return !!key && !key.startsWith("pk_test_xxxx") && key !== "xxxx";
}

/**
 * Returns the list of all supported providers.
 */
export function getSupportedProviders(): string[] {
  return Object.keys(getProviderConfigs());
}
