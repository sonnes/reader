// Worker Request/Response Message Types

// ============================================================================
// Request Messages (Main Thread -> Worker)
// ============================================================================

export type WorkerRequest =
  | ParseFeedRequest
  | ValidateFeedRequest
  | RefreshFeedRequest
  | CancelRequest

export interface ParseFeedRequest {
  type: 'PARSE_FEED'
  id: string
  payload: {
    url: string
  }
}

export interface ValidateFeedRequest {
  type: 'VALIDATE_FEED'
  id: string
  payload: {
    url: string
  }
}

export interface RefreshFeedRequest {
  type: 'REFRESH_FEED'
  id: string
  payload: {
    feedId: string
    feedUrl: string
  }
}

export interface CancelRequest {
  type: 'CANCEL'
  id: string
}

// ============================================================================
// Response Messages (Worker -> Main Thread)
// ============================================================================

export type WorkerResponse =
  | ParseFeedResponse
  | ValidateFeedResponse
  | RefreshFeedResponse
  | ErrorResponse

export interface ParseFeedResponse {
  type: 'PARSE_FEED_RESULT'
  id: string
  payload:
    | {
        success: true
        feed: ParsedFeed
        articles: ParsedArticle[]
      }
    | {
        success: false
        error: string
      }
}

export interface ValidateFeedResponse {
  type: 'VALIDATE_FEED_RESULT'
  id: string
  payload:
    | {
        success: true
        feedUrl: string
        feed: {
          title: string
          siteUrl: string
          favicon: string | null
          description?: string
        }
        articleCount: number
      }
    | {
        success: false
        error: string
        errorType: FeedErrorType
      }
}

export interface RefreshFeedResponse {
  type: 'REFRESH_FEED_RESULT'
  id: string
  payload:
    | {
        success: true
        feed: ParsedFeed
        articles: ParsedArticle[]
      }
    | {
        success: false
        error: string
      }
}

export interface ErrorResponse {
  type: 'ERROR'
  id: string
  payload: {
    error: string
    code: string
  }
}

// ============================================================================
// Parsed Data Types
// ============================================================================

export interface ParsedFeed {
  title: string
  url: string
  siteUrl: string
  favicon: string | null
  description?: string
  format: 'rss' | 'atom' | 'rdf' | 'json'
}

export interface ParsedArticle {
  id: string
  title: string
  url: string
  publishedAt: string
  content: string
  preview: string
}

export type FeedErrorType =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'NOT_A_FEED'
  | 'CORS_BLOCKED'
  | 'TIMEOUT'
