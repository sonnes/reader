import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { WorkerResponse, ValidateFeedResponse, ParseFeedResponse } from './types'

// Mock Worker class
class MockWorker {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null
  onerror: ((error: ErrorEvent) => void) | null = null

  postMessage(_data: unknown): void {
    // Will be spied on in tests
  }

  terminate(): void {
    // Will be spied on in tests
  }
}

// Store reference to created workers for testing
let mockWorkerInstance: MockWorker | null = null

// Create a proper constructor function for the mock
const MockWorkerConstructor = function (this: MockWorker) {
  mockWorkerInstance = new MockWorker()
  Object.assign(this, mockWorkerInstance)
  return mockWorkerInstance
} as unknown as typeof Worker

vi.stubGlobal('Worker', MockWorkerConstructor)

// Import after mocking Worker
import { FeedWorkerClient } from './feed-worker-client'

describe('FeedWorkerClient', () => {
  let client: FeedWorkerClient

  beforeEach(() => {
    client = new FeedWorkerClient()
    mockWorkerInstance = null
  })

  afterEach(() => {
    client.terminate()
    vi.clearAllMocks()
  })

  describe('validateFeed', () => {
    it('sends VALIDATE_FEED request and returns success result', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const validatePromise = client.validateFeed('https://example.com/feed.xml')

      // Verify request was sent
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VALIDATE_FEED',
          payload: { url: 'https://example.com/feed.xml' },
        })
      )

      // Get the request ID from the call
      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      // Simulate worker response
      const response: ValidateFeedResponse = {
        type: 'VALIDATE_FEED_RESULT',
        id: request.id,
        payload: {
          success: true,
          feedUrl: 'https://example.com/feed.xml',
          feed: {
            title: 'Test Feed',
            siteUrl: 'https://example.com',
            favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
            description: 'A test feed',
          },
          articleCount: 10,
        },
      }

      // Trigger the response
      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await validatePromise

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.feedUrl).toBe('https://example.com/feed.xml')
        expect(result.feed.title).toBe('Test Feed')
        expect(result.articleCount).toBe(10)
      }
    })

    it('returns error for invalid URL', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const validatePromise = client.validateFeed('not-a-url')

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: ValidateFeedResponse = {
        type: 'VALIDATE_FEED_RESULT',
        id: request.id,
        payload: {
          success: false,
          error: 'Invalid URL format',
          errorType: 'INVALID_URL',
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await validatePromise

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid URL format')
        expect(result.errorType).toBe('INVALID_URL')
      }
    })

    it('returns error for non-feed content', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const validatePromise = client.validateFeed('https://example.com/page.html')

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: ValidateFeedResponse = {
        type: 'VALIDATE_FEED_RESULT',
        id: request.id,
        payload: {
          success: false,
          error: 'No feed found at this URL',
          errorType: 'NOT_A_FEED',
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await validatePromise

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errorType).toBe('NOT_A_FEED')
      }
    })

    it('handles CORS blocked error', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const validatePromise = client.validateFeed('https://blocked-site.com/feed.xml')

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: ValidateFeedResponse = {
        type: 'VALIDATE_FEED_RESULT',
        id: request.id,
        payload: {
          success: false,
          error: 'Blocked by CORS policy',
          errorType: 'CORS_BLOCKED',
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await validatePromise

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errorType).toBe('CORS_BLOCKED')
      }
    })
  })

  describe('parseFeed', () => {
    it('sends PARSE_FEED request and returns articles', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const parsePromise = client.parseFeed('https://example.com/feed.xml')

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PARSE_FEED',
          payload: { url: 'https://example.com/feed.xml' },
        })
      )

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: ParseFeedResponse = {
        type: 'PARSE_FEED_RESULT',
        id: request.id,
        payload: {
          success: true,
          feed: {
            title: 'Test Feed',
            url: 'https://example.com/feed.xml',
            siteUrl: 'https://example.com',
            favicon: null,
            format: 'rss',
          },
          articles: [
            {
              id: 'article-1',
              title: 'First Article',
              url: 'https://example.com/article-1',
              publishedAt: '2024-01-01T00:00:00.000Z',
              content: '<p>Article content</p>',
              preview: 'Article content',
            },
          ],
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await parsePromise

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.feed.title).toBe('Test Feed')
        expect(result.articles).toHaveLength(1)
        expect(result.articles[0].title).toBe('First Article')
      }
    })

    it('returns error for failed parsing', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const parsePromise = client.parseFeed('https://example.com/broken.xml')

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: ParseFeedResponse = {
        type: 'PARSE_FEED_RESULT',
        id: request.id,
        payload: {
          success: false,
          error: 'Failed to parse feed',
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await parsePromise

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Failed to parse feed')
      }
    })
  })

  describe('refreshFeed', () => {
    it('sends REFRESH_FEED request with feedId and feedUrl', async () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      const refreshPromise = client.refreshFeed('feed-123', 'https://example.com/feed.xml')

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'REFRESH_FEED',
          payload: {
            feedId: 'feed-123',
            feedUrl: 'https://example.com/feed.xml',
          },
        })
      )

      const request = postMessageSpy.mock.calls[0][0] as { id: string }

      const response: WorkerResponse = {
        type: 'REFRESH_FEED_RESULT',
        id: request.id,
        payload: {
          success: true,
          feed: {
            title: 'Refreshed Feed',
            url: 'https://example.com/feed.xml',
            siteUrl: 'https://example.com',
            favicon: null,
            format: 'rss',
          },
          articles: [],
        },
      }

      mockWorkerInstance?.onmessage?.(new MessageEvent('message', { data: response }))

      const result = await refreshPromise

      expect(result.success).toBe(true)
    })
  })

  describe('cancel', () => {
    it('sends CANCEL request to worker', () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      // Start a request to initialize worker
      client.validateFeed('https://example.com')

      client.cancel('req-123')

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: 'CANCEL',
        id: 'req-123',
      })
    })
  })

  describe('terminate', () => {
    it('terminates the worker', () => {
      const terminateSpy = vi.spyOn(MockWorker.prototype, 'terminate')

      // Initialize worker
      client.validateFeed('https://example.com')

      client.terminate()

      expect(terminateSpy).toHaveBeenCalled()
    })

    it('clears pending requests on terminate', () => {
      // Start a request
      client.validateFeed('https://example.com')

      // Terminate before response - should not throw
      expect(() => client.terminate()).not.toThrow()
    })
  })

  describe('worker reuse', () => {
    it('reuses the same worker instance for multiple requests', () => {
      const postMessageSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

      // Make two requests
      client.validateFeed('https://example1.com')
      client.validateFeed('https://example2.com')

      // Both should use same worker (postMessage called twice)
      expect(postMessageSpy).toHaveBeenCalledTimes(2)
    })
  })
})
