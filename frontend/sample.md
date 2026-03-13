- build a dedicated page for the onramp
- write and aggregrator lib file for the onramp, research and get the sandbox apis and keys for each provider.
  most of them only swap to btc so we need to either research a bridge for sbtc after the swap or find a provider that swaps to sbtc

export interface ProviderQuote {
provider: string;
logoSymbol: string;
rate: number; // How many USD per 1 sBTC (higher = better rate for fiat buyer)
feeFixed: number; // Fixed fee in USD
feePercent: number; // Percentage fee (e.g., 0.015 = 1.5%)
feeTotal: number; // Calculated: feeFixed + amount \* feePercent
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

- build out the flow to get quotes, but putting price and currency and select provider.

- use widgets to embed. Start with mtpelerin.

[
{
"name": "Bitzaro",
"slug": "bitzaro",
"shortDescription": "Bitzaro is a licensed Virtual Asset Service Provider offering on and off-ramp solutions and more.\n",  
 },
{
"name": "Dfns",
"slug": "dfns",
"shortDescription": "Wallet infrastructure for digital assets\n",  
 },
{
"name": "Bitpay",
"slug": "bitpay",
"shortDescription": "Buy, store, swap and spend cryptocurrency all in one app.\n",  
 },
{
"name": "Wert",
"slug": "wert",
"shortDescription": "Wert is a checkout experience for NFT and Web3, enabling purchases with credit and debit cards.\n",  
 },
{  
 "name": "ByBarter",
"slug": "bybarter",
"shortDescription": "ByBarter enables users to convert fiat to crypto & vice versa directly from their wallets. \n",

    },
    {
        "name": "Guardarian",
        "slug": "guardarian",
        "shortDescription": "Guardarian is a fiat onramp offering instant crypto exchanges to individuals & businesses. \n",
    },
    {
        "name": "Swipelux ",
        "slug": "swipelux",
        "shortDescription": "Fiat-to-tokens on-ramp, fiat-to-NFT payment rails, one-step wallet and Digital ID Infrastructure.\n",
    },
    {
        "name": "TransFi",
        "slug": "transfi",
        "shortDescription": "TransFi enables buying & selling of crypto with local currencies using apps, QR codes, & e-wallets.\n",

    },
    {
        "name": "Meld",
        "slug": "meld",
        "shortDescription": "Multiple crypto ramps like MoonPay, Banxa, Transak, etc aggregated through a single integration & UI\n",

    },
    {
        "name": "Mt Pelerin",
        "slug": "mtpelerin",
        "shortDescription": "Buy, swap, and cash out crypto from any wallet, with no identification required.\n",
    },
    {
        "name": "Onramp.money",
        "slug": "onramp-money",
        "shortDescription": "Onramp.money leads the Web3 payments space, converting local currency to crypto in emerging markets.\n",

    },
    {
        "name": "Swapin",
        "slug": "swapin",
        "shortDescription": "Ultra-fast payments between crypto and banks.\n",
    },
    {
        "name": "Utila",
        "slug": "utila",
        "shortDescription": "Utila enables organizations of all sizes to securely manage and build on digital assets.\n",

    },
    {
        "name": "Swapped.com",
        "slug": "swappedcom",
        "shortDescription": "Enable customers to buy crypto with 30+ payment methods, customizable to fit your project seamlessly.\n",
    },
    {
        "name": "Ripio",
        "slug": "ripio",
        "shortDescription": "Ripio provides secure, certified infrastructure for institutions to integrate scalable crypto solutions.\n",

        "eyebrowText": "Enterprise Customers"
    }

]
