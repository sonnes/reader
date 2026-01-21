import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock modules first (these are hoisted)
vi.mock('~/workers/feed-worker-client', () => ({
  feedWorker: {
    refreshFeed: vi.fn(),
  },
}))

vi.mock('~/db', () => ({
  feedsCollection: {
    update: vi.fn(),
  },
  articlesCollection: {
    insert: vi.fn(),
  },
  timestamp: () => '2024-01-01T00:00:00.000Z',
  generateArticleId: () => `article-${Date.now()}`,
}))

// Import after mocks are defined
import { RefreshScheduler } from './refresh-scheduler'
import { feedWorker } from '~/workers/feed-worker-client'
import { feedsCollection, articlesCollection } from '~/db'

// Mock feeds data
const mockFeeds = [
  {
    id: 'feed-1',
    title: 'Feed 1',
    url: 'https://example1.com/feed.xml',
    siteUrl: 'https://example1.com',
    favicon: null,
    folderId: null,
    preferIframe: false,
    lastFetched: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'feed-2',
    title: 'Feed 2',
    url: 'https://example2.com/feed.xml',
    siteUrl: 'https://example2.com',
    favicon: null,
    folderId: null,
    preferIframe: false,
    lastFetched: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

// Mock IndexedDB
const createMockIndexedDB = () => {
  const mockStore = {
    getAll: vi.fn(() => {
      const request = {
        result: mockFeeds,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      }
      setTimeout(() => request.onsuccess?.(), 0)
      return request
    }),
  }

  const mockTransaction = {
    objectStore: vi.fn(() => mockStore),
  }

  const mockDb = {
    transaction: vi.fn(() => mockTransaction),
  }

  return {
    open: vi.fn(() => {
      const request = {
        result: mockDb,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      }
      setTimeout(() => request.onsuccess?.(), 0)
      return request
    }),
  }
}

describe('RefreshScheduler', () => {
  let scheduler: RefreshScheduler
  const mockRefreshFeed = vi.mocked(feedWorker.refreshFeed)
  const mockFeedsUpdate = vi.mocked(feedsCollection.update)
  const mockArticlesInsert = vi.mocked(articlesCollection.insert)

  beforeEach(() => {
    vi.useFakeTimers()
    scheduler = new RefreshScheduler()
    vi.stubGlobal('indexedDB', createMockIndexedDB())

    // Default mock for refreshFeed
    mockRefreshFeed.mockResolvedValue({
      success: true,
      feed: {
        title: 'Feed',
        url: 'https://example.com/feed.xml',
        siteUrl: 'https://example.com',
        favicon: null,
        format: 'rss',
      },
      articles: [],
    })
  })

  afterEach(() => {
    scheduler.stop()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('start', () => {
    it('schedules interval on start', () => {
      scheduler.start()
      expect(scheduler.isRunning()).toBe(true)
    })

    it('does not start twice', () => {
      scheduler.start()
      scheduler.start()
      expect(scheduler.isRunning()).toBe(true)
    })

    it('triggers initial refresh after delay', async () => {
      scheduler.start()

      // Fast-forward past initial delay (5 seconds)
      await vi.advanceTimersByTimeAsync(5100)

      expect(mockRefreshFeed).toHaveBeenCalled()
    })
  })

  describe('stop', () => {
    it('clears interval on stop', () => {
      scheduler.start()
      expect(scheduler.isRunning()).toBe(true)

      scheduler.stop()
      expect(scheduler.isRunning()).toBe(false)
    })

    it('can be called when not running', () => {
      expect(() => scheduler.stop()).not.toThrow()
    })
  })

  describe('refreshAll', () => {
    it('iterates all feeds', async () => {
      const resultsPromise = scheduler.refreshAll()

      // Wait for async operations
      await vi.advanceTimersByTimeAsync(100)
      await resultsPromise

      expect(mockRefreshFeed).toHaveBeenCalledTimes(2)
      expect(mockRefreshFeed).toHaveBeenCalledWith('feed-1', 'https://example1.com/feed.xml')
      expect(mockRefreshFeed).toHaveBeenCalledWith('feed-2', 'https://example2.com/feed.xml')
    })

    it('returns results for each feed', async () => {
      mockRefreshFeed.mockResolvedValue({
        success: true,
        feed: {
          title: 'Feed',
          url: 'https://example.com/feed.xml',
          siteUrl: 'https://example.com',
          favicon: null,
          format: 'rss',
        },
        articles: [
          {
            id: '1',
            title: 'Article',
            url: 'https://example.com/article',
            publishedAt: '2024-01-01T00:00:00.000Z',
            content: 'Content',
            preview: 'Content',
          },
        ],
      })

      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      const results = await resultsPromise

      expect(results).toHaveLength(2)
      expect(results[0].feedId).toBe('feed-1')
      expect(results[1].feedId).toBe('feed-2')
    })

    it('skips if refresh already in progress', async () => {
      // Make refresh take a while
      mockRefreshFeed.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  feed: {
                    title: 'Feed',
                    url: 'https://example.com/feed.xml',
                    siteUrl: 'https://example.com',
                    favicon: null,
                    format: 'rss',
                  },
                  articles: [],
                }),
              1000
            )
          )
      )

      // Start first refresh
      const firstRefresh = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)

      // Try to start second refresh while first is in progress
      const secondRefresh = await scheduler.refreshAll()

      expect(secondRefresh).toEqual([]) // Should return empty, skipped

      // Clean up first refresh
      await vi.advanceTimersByTimeAsync(2000)
      await firstRefresh
    })

    it('respects minimum refresh interval', async () => {
      // First refresh
      const firstPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      await firstPromise

      mockRefreshFeed.mockClear()

      // Try refresh again immediately (within MIN_REFRESH_INTERVAL_MS)
      const results = await scheduler.refreshAll()

      expect(results).toEqual([])
      expect(mockRefreshFeed).not.toHaveBeenCalled()
    })

    it('allows refresh after minimum interval passes', async () => {
      // First refresh
      const firstPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      await firstPromise

      mockRefreshFeed.mockClear()

      // Advance past minimum interval (15 minutes)
      await vi.advanceTimersByTimeAsync(15 * 60 * 1000 + 1000)

      // Should now be allowed
      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      await resultsPromise

      expect(mockRefreshFeed).toHaveBeenCalled()
    })
  })

  describe('new articles detection', () => {
    it('inserts new articles from refresh', async () => {
      mockRefreshFeed.mockResolvedValue({
        success: true,
        feed: {
          title: 'Feed',
          url: 'https://example.com/feed.xml',
          siteUrl: 'https://example.com',
          favicon: null,
          format: 'rss',
        },
        articles: [
          {
            id: 'article-1',
            title: 'New Article',
            url: 'https://example.com/article-1',
            publishedAt: '2024-01-01T00:00:00.000Z',
            content: 'Content',
            preview: 'Content',
          },
        ],
      })

      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      await resultsPromise

      expect(mockArticlesInsert).toHaveBeenCalled()
    })

    it('updates lastFetched on successful refresh', async () => {
      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      await resultsPromise

      expect(mockFeedsUpdate).toHaveBeenCalledWith('feed-1', expect.any(Function))
    })
  })

  describe('error handling', () => {
    it('continues with other feeds when one fails', async () => {
      mockRefreshFeed
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          feed: {
            title: 'Feed 2',
            url: 'https://example2.com/feed.xml',
            siteUrl: 'https://example2.com',
            favicon: null,
            format: 'rss',
          },
          articles: [],
        })

      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      const results = await resultsPromise

      expect(results).toHaveLength(2)
      expect(results[0].error).toBe('Network error')
      expect(results[1].error).toBeUndefined()
    })

    it('returns error in result for failed feed', async () => {
      mockRefreshFeed.mockResolvedValue({
        success: false,
        error: 'Parse error',
      })

      const resultsPromise = scheduler.refreshAll()
      await vi.advanceTimersByTimeAsync(100)
      const results = await resultsPromise

      expect(results[0].error).toBe('Parse error')
      expect(results[0].newArticles).toBe(0)
    })
  })

  describe('callback', () => {
    it('calls onComplete callback after refresh', async () => {
      const onComplete = vi.fn()
      scheduler.start(onComplete)

      // Trigger initial refresh (5 second delay)
      await vi.advanceTimersByTimeAsync(5100)

      expect(onComplete).toHaveBeenCalledWith(expect.any(Array))
    })
  })
})
