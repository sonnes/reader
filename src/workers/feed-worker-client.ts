import type {
  WorkerRequest,
  WorkerResponse,
  ParsedFeed,
  ParsedArticle,
  FeedErrorType,
} from './types'

type RequestCallback = (response: WorkerResponse) => void

export interface ValidateFeedResult {
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

export interface ValidateFeedError {
  success: false
  error: string
  errorType: FeedErrorType
}

export interface ParseFeedResult {
  success: true
  feed: ParsedFeed
  articles: ParsedArticle[]
}

export interface ParseFeedError {
  success: false
  error: string
}

class FeedWorkerClient {
  private worker: Worker | null = null
  private pendingRequests = new Map<string, RequestCallback>()
  private requestIdCounter = 0

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./feed-worker.ts', import.meta.url), {
        type: 'module',
      })

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data
        const callback = this.pendingRequests.get(response.id)
        if (callback) {
          callback(response)
          this.pendingRequests.delete(response.id)
        }
      }

      this.worker.onerror = (error) => {
        console.error('[FeedWorker] Worker error:', error)
      }
    }
    return this.worker
  }

  private generateRequestId(): string {
    return `req-${++this.requestIdCounter}-${Date.now()}`
  }

  private sendRequest(request: WorkerRequest): Promise<WorkerResponse> {
    return new Promise((resolve) => {
      this.pendingRequests.set(request.id, resolve)
      this.getWorker().postMessage(request)
    })
  }

  /**
   * Validate a URL and discover feed information
   */
  async validateFeed(url: string): Promise<ValidateFeedResult | ValidateFeedError> {
    const response = await this.sendRequest({
      type: 'VALIDATE_FEED',
      id: this.generateRequestId(),
      payload: { url },
    })

    if (response.type === 'VALIDATE_FEED_RESULT') {
      return response.payload
    }

    return {
      success: false,
      error: 'Unexpected response from worker',
      errorType: 'FETCH_FAILED',
    }
  }

  /**
   * Parse a feed and return articles
   */
  async parseFeed(url: string): Promise<ParseFeedResult | ParseFeedError> {
    const response = await this.sendRequest({
      type: 'PARSE_FEED',
      id: this.generateRequestId(),
      payload: { url },
    })

    if (response.type === 'PARSE_FEED_RESULT') {
      return response.payload
    }

    return {
      success: false,
      error: 'Unexpected response from worker',
    }
  }

  /**
   * Refresh a single feed
   */
  async refreshFeed(
    feedId: string,
    feedUrl: string
  ): Promise<ParseFeedResult | ParseFeedError> {
    const response = await this.sendRequest({
      type: 'REFRESH_FEED',
      id: this.generateRequestId(),
      payload: { feedId, feedUrl },
    })

    if (response.type === 'REFRESH_FEED_RESULT') {
      return response.payload
    }

    return {
      success: false,
      error: 'Unexpected response from worker',
    }
  }

  /**
   * Cancel a pending request
   */
  cancel(requestId: string): void {
    this.getWorker().postMessage({
      type: 'CANCEL',
      id: requestId,
    })
    this.pendingRequests.delete(requestId)
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.pendingRequests.clear()
    }
  }
}

// Singleton instance
export const feedWorker = new FeedWorkerClient()

// Export class for testing
export { FeedWorkerClient }
