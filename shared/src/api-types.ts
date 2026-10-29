export interface HealthResponse {
  status: string;
  discoveryConfigured: boolean;
}

export interface DiscoveryFeedItem {
  url: string;
  title: string;
  count: number;
  reason?: string;
}

export interface PopularFeedsResponse {
  feeds: DiscoveryFeedItem[];
}

export interface RecommendationsRequest {
  feeds: string[];
}

export interface RecommendationsResponse {
  feeds: DiscoveryFeedItem[];
}

export interface SubscriptionBatchRequest {
  feeds: string[];
}

export interface SubscriptionBatchResponse {
  accepted: number;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}
