export interface ProviderRegistryEntry {
  id: string;
  title: string;
  endpointUrl: string;
  pricePerCallUsd: number;
  category: string;
  /** These are fixtures/examples unless a provider explicitly replaces them. */
  demo: boolean;
}

/**
 * The single catalog used by the gateway seed, MCP discovery, and the web
 * provider page. Adding a route here makes it visible everywhere; runtime
 * provider registrations may still be appended by the provider API.
 */
export const CANONICAL_PROVIDER_REGISTRY: ProviderRegistryEntry[] = [
  { id: 'ep_sample_llm', title: 'Example LLM response route', endpointUrl: 'https://demo-ai-response.synapse402.network/v1/resource', pricePerCallUsd: 0.0008, category: 'AI / LLM Inferences', demo: true },
  { id: 'ep_scraper_paywall', title: 'Example licensed article access', endpointUrl: 'https://news-provider.media/api/scrape/clean-markdown', pricePerCallUsd: 0.001, category: 'Web Data & Scraping', demo: true },
  { id: 'ep_1', title: 'Example document translation service', endpointUrl: 'https://api.translate-provider.io/v2/document/instant', pricePerCallUsd: 0.001, category: 'Language AI', demo: true },
  { id: 'ep_2', title: 'Example image processing service', endpointUrl: 'https://api.vision-neural.ai/v1/remove-bg', pricePerCallUsd: 0.002, category: 'Computer Vision', demo: true },
  { id: 'ep_3', title: 'Example media access service', endpointUrl: 'https://api.news-dispatch.net/v1/article/unlock', pricePerCallUsd: 0.001, category: 'Publishing / Media', demo: true },
  { id: 'ep_4', title: 'Example Python sandbox service', endpointUrl: 'https://api.sandbox-python.dev/v1/containers/exec', pricePerCallUsd: 0.005, category: 'Code Execution', demo: true },
  { id: 'ep_5', title: 'Example structured web extraction service', endpointUrl: 'https://api.stealth-crawler.net/v1/scrape', pricePerCallUsd: 0.003, category: 'Web Data & Scraping', demo: true },
  { id: 'ep_6', title: 'Example voice synthesis service', endpointUrl: 'https://api.voice-neural.io/v1/synthesize', pricePerCallUsd: 0.004, category: 'Voice & Speech', demo: true },
  { id: 'ep_7', title: 'Example travel availability feed', endpointUrl: 'https://api.gds-flights.network/v1/fares', pricePerCallUsd: 0.002, category: 'Travel / GDS Data', demo: true },
  { id: 'ep_8', title: 'Example identity risk check', endpointUrl: 'https://api.identity-risk.shield/v1/verify', pricePerCallUsd: 0.005, category: 'Compliance & KYC', demo: true },
  { id: 'ep_demo_market_depth', title: 'Example market-depth provider', endpointUrl: 'https://api.market-depth-mesh.io/v3/depth/l2', pricePerCallUsd: 0.001, category: 'Market Depth', demo: true },
  { id: 'ep_demo_sec', title: 'Example SEC filing data route', endpointUrl: 'https://api.sec.gov/filings/10k/structured', pricePerCallUsd: 0.0015, category: 'Academic & Legal', demo: true },
  { id: 'ep_demo_local', title: 'Synapse402 protected demo route', endpointUrl: '/api/v1/test-provider-data', pricePerCallUsd: 0.001, category: 'Demo / Protected Route', demo: true },
  { id: 'ep_demo_sol_depth', title: 'Amberdata SOL/USDT market-depth fixture', endpointUrl: '/api/v1/market/sol-orderbook', pricePerCallUsd: 0.001, category: 'Market Depth · Evaluation Fixture', demo: true },
];

export const CANONICAL_PROVIDER_URLS = CANONICAL_PROVIDER_REGISTRY
  .map((entry) => entry.endpointUrl)
  .filter((url) => /^https?:\/\//i.test(url));
