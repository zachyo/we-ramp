export interface ProviderQuote {
  provider: string;
  logoSymbol: string;
  rate: number; // How many USD per 1 sBTC (higher = better rate for fiat buyer)
  feeFixed: number; // Fixed fee in USD
  feePercent: number; // Percentage fee (e.g., 0.015 = 1.5%)
  feeTotal: number; // Calculated: feeFixed + amount * feePercent
  amountOut: number; // sBTC you receive for the given fiat amount
  estimatedTime: string;
  noKyc: boolean;
  kycThreshold: number; // Max USD purchasable without KYC
  minAmount: number;
  maxAmount: number;
  available: boolean;
  badge?: string;
  score: number; // Computed ranking score (higher = better)
  isLiveQuote: boolean; // true if quote came from real API, false if computed
}

export interface AggregatorParams {
  amount: number; // Fiat amount in USD
  currency?: string;
}

// Mock live BTC price for testing logic
const MOCK_BTC_PRICE_USD = 65000;

/**
 * Calculates a unified score based on fees, speed, and no-KYC friendliness
 */
function calculateScore(quote: Partial<ProviderQuote>): number {
  let score = 100;
  // Penalty for high fees
  const feePenalty = (quote.feeTotal || 0) * 2; 
  score -= feePenalty;

  // Bonus for No-KYC
  if (quote.noKyc) score += 20;

  // Small penalty for longer times
  if (quote.estimatedTime?.includes("mins")) score -= 5;
  if (quote.estimatedTime?.includes("hrs")) score -= 15;

  return Math.max(0, score);
}

/**
 * Simulates fetching quotes from multiple providers.
 * In a real-world scenario, this would make parallel fetch requests to each provider's API.
 * Currently simulates the sBTC amount assuming a 1:1 bridge conversion rate from native BTC.
 */
export async function getQuotes(params: AggregatorParams): Promise<ProviderQuote[]> {
  const { amount, currency = 'USD' } = params;
  
  // Return empty if amount is invalid
  if (!amount || amount <= 0) return [];

  // Simulate network delay for API calls
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 1. Mt Pelerin (Known for good No-KYC limits up to ~1k CHF/USD daily)
  const mtPelerinFeeFixed = 0;
  const mtPelerinFeePercent = 0.00; // First 500 CHF/USD often feeless or very low
  const mtPelerinTotalFee = mtPelerinFeeFixed + (amount * mtPelerinFeePercent);
  const mtPelerinAmountOut = (amount - mtPelerinTotalFee) / MOCK_BTC_PRICE_USD;

  // 2. Transak (Solid coverage, standard fee structure)
  const transakFeeFixed = 2.0;
  const transakFeePercent = 0.015; // 1.5%
  const transakTotalFee = transakFeeFixed + (amount * transakFeePercent);
  const transakAmountOut = (amount - transakTotalFee) / MOCK_BTC_PRICE_USD;

  // 3. Guardarian (Instant exchanges, higher limits)
  const guardarianFeeFixed = 0;
  const guardarianFeePercent = 0.02; // 2% bundled
  const guardarianTotalFee = guardarianFeeFixed + (amount * guardarianFeePercent);
  const guardarianAmountOut = (amount - guardarianTotalFee) / MOCK_BTC_PRICE_USD;

  // 4. Onramp.money (Good emerging market coverage)
  const onrampFeeFixed = 1.0;
  const onrampFeePercent = 0.01; // ~1%
  const onrampTotalFee = onrampFeeFixed + (amount * onrampFeePercent);
  const onrampAmountOut = (amount - onrampTotalFee) / MOCK_BTC_PRICE_USD;

  const quotes: ProviderQuote[] = [
    {
      provider: "Mt Pelerin",
      logoSymbol: "M",
      rate: MOCK_BTC_PRICE_USD,
      feeFixed: mtPelerinFeeFixed,
      feePercent: mtPelerinFeePercent,
      feeTotal: mtPelerinTotalFee,
      amountOut: Number(mtPelerinAmountOut.toFixed(8)),
      estimatedTime: "~1 min",
      noKyc: true,
      kycThreshold: 1000, 
      minAmount: 50,
      maxAmount: 10000,
      available: amount >= 50 && amount <= 10000,
      badge: amount < 1000 ? "Best Rate" : undefined,
      score: 0,
      isLiveQuote: false,
    },
    {
      provider: "Transak",
      logoSymbol: "T",
      rate: MOCK_BTC_PRICE_USD,
      feeFixed: transakFeeFixed,
      feePercent: transakFeePercent,
      feeTotal: transakTotalFee,
      amountOut: Number(transakAmountOut.toFixed(8)),
      estimatedTime: "~3 mins",
      noKyc: false,
      kycThreshold: 0,
      minAmount: 10,
      maxAmount: 50000,
      available: amount >= 10 && amount <= 50000,
      score: 0,
      isLiveQuote: false,
    },
    {
      provider: "Guardarian",
      logoSymbol: "G",
      rate: MOCK_BTC_PRICE_USD,
      feeFixed: guardarianFeeFixed,
      feePercent: guardarianFeePercent,
      feeTotal: guardarianTotalFee,
      amountOut: Number(guardarianAmountOut.toFixed(8)),
      estimatedTime: "~5 mins",
      noKyc: false, // Usually requires basic KYC
      kycThreshold: 0,
      minAmount: 50,
      maxAmount: 20000,
      available: amount >= 50 && amount <= 20000,
      score: 0,
      isLiveQuote: false,
    },
    {
      provider: "Onramp.money",
      logoSymbol: "O",
      rate: MOCK_BTC_PRICE_USD,
      feeFixed: onrampFeeFixed,
      feePercent: onrampFeePercent,
      feeTotal: onrampTotalFee,
      amountOut: Number(onrampAmountOut.toFixed(8)),
      estimatedTime: "~2 mins",
      noKyc: false,
      kycThreshold: 0,
      minAmount: 5,
      maxAmount: 10000,
      available: amount >= 5 && amount <= 10000,
      score: 0,
      isLiveQuote: false,
    }
  ];

  // Calculate scores and sort by amountOut (best return for user)
  const scoredQuotes = quotes.map(q => ({
    ...q,
    score: calculateScore(q)
  })).sort((a, b) => b.amountOut - a.amountOut);

  // If the highest amountOut doesn't already have a badge, we can assign it
  if (scoredQuotes.length > 0 && !scoredQuotes[0].badge) {
    scoredQuotes[0].badge = "Best Return";
  }

  return scoredQuotes;
}
