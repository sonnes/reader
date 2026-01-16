import { getDb } from './index'

// Seed data for development
const seedData = {
  folders: [
    { id: 'folder-1', name: 'Tech Blogs' },
    { id: 'folder-2', name: 'News' },
  ],
  feeds: [
    {
      id: 'feed-1',
      title: 'Ravi Atluri',
      url: 'https://raviatluri.in/rss.xml',
      site_url: 'https://raviatluri.in',
      favicon: 'https://raviatluri.in/favicon.ico',
      folder_id: 'folder-1',
      last_fetched: '2026-01-15T08:30:00Z',
    },
    {
      id: 'feed-2',
      title: 'Hacker News',
      url: 'https://news.ycombinator.com/rss',
      site_url: 'https://news.ycombinator.com',
      favicon: 'https://news.ycombinator.com/favicon.ico',
      folder_id: 'folder-2',
      last_fetched: '2026-01-15T09:15:00Z',
    },
    {
      id: 'feed-3',
      title: 'The Pragmatic Engineer',
      url: 'https://pragmaticengineer.com/rss',
      site_url: 'https://pragmaticengineer.com',
      favicon: 'https://pragmaticengineer.com/favicon.ico',
      folder_id: null,
      last_fetched: '2026-01-14T22:00:00Z',
    },
    {
      id: 'feed-4',
      title: 'Julia Evans',
      url: 'https://jvns.ca/atom.xml',
      site_url: 'https://jvns.ca',
      favicon: 'https://jvns.ca/favicon.ico',
      folder_id: null,
      last_fetched: '2026-01-15T07:45:00Z',
    },
  ],
  articles: [
    {
      id: 'article-1',
      feed_id: 'feed-1',
      title: 'Introducing xapi - Type-Safe HTTP APIs in Go',
      url: 'https://raviatluri.in/articles/introducing-xapi',
      published_at: '2025-10-15T10:00:00Z',
      preview:
        'xapi is a lightweight Go library that brings type safety and simplicity to building HTTP APIs. It leverages Go generics to provide compile-time guarantees...',
      content:
        '<p>xapi is a lightweight Go library that brings type safety and simplicity to building HTTP APIs. It leverages Go generics to provide compile-time guarantees for your request and response types.</p><h2>Why xapi?</h2><p>Traditional HTTP handlers in Go require manual parsing and validation. With xapi, you define your types once and the library handles the rest.</p><pre><code>func CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {\n  // Your logic here\n}</code></pre>',
      is_read: 1,
      is_starred: 1,
    },
    {
      id: 'article-2',
      feed_id: 'feed-1',
      title: 'Building September - A Communication Assistant',
      url: 'https://raviatluri.in/articles/building-september',
      published_at: '2025-09-09T14:00:00Z',
      preview:
        'A communication assistant for people living with neurodegenerative conditions like ALS, MND, or other speech & motor difficulties.',
      content:
        '<p>September is a communication assistant designed for people living with neurodegenerative conditions like ALS, MND, or other speech and motor difficulties.</p><p>The app uses eye-tracking and predictive text to help users communicate effectively despite physical limitations.</p>',
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-3',
      feed_id: 'feed-1',
      title: 'Handling Errors in Go - Beyond the Basics',
      url: 'https://raviatluri.in/articles/handling-go-errors',
      published_at: '2025-05-27T09:00:00Z',
      preview:
        "Go's error handling philosophy is straightforward, though sophisticated applications require custom error types and structured metadata for maintainability.",
      content:
        "<p>Go's error handling philosophy is straightforward: errors are values. But as your application grows, you'll need more than <code>if err != nil</code>.</p><h2>Custom Error Types</h2><p>Create custom error types to carry context about what went wrong and where.</p>",
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-4',
      feed_id: 'feed-1',
      title: 'Introducing xkafka - Kafka, but Simpler (for Go)',
      url: 'https://raviatluri.in/articles/introducing-xkafka',
      published_at: '2025-05-07T11:00:00Z',
      preview:
        'xkafka is a Go library that brings HTTP-like abstractions to Apache Kafka, making it easier to build event-driven applications.',
      content:
        '<p>xkafka is a Go library that brings HTTP-like abstractions to Apache Kafka. Instead of dealing with low-level consumer groups and partition assignments, you define handlers that process messages.</p>',
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-5',
      feed_id: 'feed-1',
      title: 'Career Growth - Beyond IC vs Manager',
      url: 'https://raviatluri.in/articles/career-growth',
      published_at: '2025-04-30T08:00:00Z',
      preview:
        'Career advancement involves expanding skills, tackling complex problems, and building influence across multiple dimensions.',
      content:
        '<p>The IC vs Manager dichotomy is a false choice. Career advancement is about expanding your skills, tackling increasingly complex problems, and building influence—regardless of your title.</p>',
      is_read: 0,
      is_starred: 1,
    },
    {
      id: 'article-6',
      feed_id: 'feed-1',
      title: 'The ALS Story',
      url: 'https://raviatluri.in/articles/the-als-story',
      published_at: '2021-12-23T10:00:00Z',
      preview: 'Personal narrative detailing an ALS diagnosis journey and its impact on daily life.',
      content:
        '<p>In early 2021, I noticed my left hand getting weaker. What followed was a journey through diagnosis, acceptance, and adaptation that changed everything about how I work and live.</p>',
      is_read: 1,
      is_starred: 1,
    },
    {
      id: 'article-7',
      feed_id: 'feed-2',
      title: 'Scaling long-running autonomous coding',
      url: 'https://cursor.com/blog/scaling-agents',
      published_at: '2026-01-14T22:18:04Z',
      preview: 'How Cursor approaches scaling autonomous coding agents for long-running tasks across large codebases.',
      content:
        '<p>As AI coding assistants become more capable, the challenge shifts from single-turn completions to managing long-running autonomous tasks.</p>',
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-8',
      feed_id: 'feed-2',
      title: 'New Safari developer tools provide insight into CSS Grid Lanes',
      url: 'https://webkit.org/blog/17746/new-safari-developer-tools-provide-insight-into-css-grid-lanes/',
      published_at: '2026-01-15T00:34:59Z',
      preview: "Safari's latest developer tools update brings powerful visualization for CSS Grid layouts.",
      content:
        '<p>The latest Safari Technology Preview introduces new developer tools for inspecting CSS Grid layouts, making it easier to understand and debug complex grid structures.</p>',
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-9',
      feed_id: 'feed-2',
      title: 'Is Rust faster than C?',
      url: 'https://steveklabnik.com/writing/is-rust-faster-than-c/',
      published_at: '2026-01-10T19:37:36Z',
      preview:
        "A nuanced look at performance comparisons between Rust and C, and why the question itself might be misleading.",
      content:
        "<p>The question 'Is Rust faster than C?' comes up constantly. The short answer is: it depends. The longer answer requires understanding what we mean by 'faster' and how both languages approach optimization.</p>",
      is_read: 1,
      is_starred: 0,
    },
    {
      id: 'article-10',
      feed_id: 'feed-2',
      title: 'Generate QR Codes with Pure SQL in PostgreSQL',
      url: 'https://tanelpoder.com/posts/generate-qr-code-with-pure-sql-in-postgres/',
      published_at: '2026-01-10T16:19:42Z',
      preview: 'A deep dive into generating QR codes using nothing but PostgreSQL SQL queries.',
      content:
        '<p>Yes, you can generate QR codes entirely in SQL. Here\'s how to do it in PostgreSQL using recursive CTEs and binary operations.</p>',
      is_read: 0,
      is_starred: 1,
    },
    {
      id: 'article-11',
      feed_id: 'feed-2',
      title: 'Crafting Interpreters',
      url: 'https://craftinginterpreters.com/',
      published_at: '2026-01-14T22:26:17Z',
      preview:
        'A handbook for making programming languages. Contains everything you need to implement a full-featured, efficient scripting language.',
      content:
        "<p>This book contains everything you need to implement a full-featured, efficient scripting language. You'll learn both high-level concepts and gritty details from scanning and parsing through bytecode and garbage collection.</p>",
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-12',
      feed_id: 'feed-2',
      title: 'Ask HN: Share your personal website',
      url: 'https://news.ycombinator.com/item?id=46618714',
      published_at: '2026-01-14T17:07:42Z',
      preview: 'A community thread where Hacker News users share and discuss their personal websites and portfolios.',
      content:
        "<p>Share your personal website! I'm always looking for inspiration and curious what tools/frameworks people are using these days.</p>",
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-13',
      feed_id: 'feed-2',
      title: 'Furiosa: 3.5x efficiency over H100s',
      url: 'https://furiosa.ai/blog/introducing-rngd-server-efficient-ai-inference-at-data-center-scale',
      published_at: '2026-01-15T00:53:21Z',
      preview: 'Furiosa announces their RNGD server claiming 3.5x better efficiency than NVIDIA H100s for AI inference workloads.',
      content:
        "<p>Today we're introducing the RNGD server, our answer to efficient AI inference at data center scale. Our benchmarks show 3.5x better efficiency compared to NVIDIA H100s.</p>",
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-14',
      feed_id: 'feed-3',
      title: 'The Trimodal Nature of Tech Compensation',
      url: 'https://pragmaticengineer.com/blog/trimodal-compensation',
      published_at: '2026-01-12T10:00:00Z',
      preview: "Why tech compensation isn't a single bell curve, but three distinct distributions based on company type.",
      content:
        '<p>Tech compensation follows a trimodal distribution. Traditional companies, competitive tech companies, and top-tier tech companies each have their own compensation bands that barely overlap.</p>',
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-15',
      feed_id: 'feed-3',
      title: 'What TPMs Do and Why You Need Them',
      url: 'https://pragmaticengineer.com/blog/tpms',
      published_at: '2026-01-08T09:00:00Z',
      preview: "Technical Program Managers are often misunderstood. Here's what they actually do and when you should hire one.",
      content:
        "<p>Technical Program Managers (TPMs) are one of the most misunderstood roles in tech. They're not project managers, not product managers, and not engineers—but they work closely with all three.</p>",
      is_read: 0,
      is_starred: 0,
    },
    {
      id: 'article-16',
      feed_id: 'feed-3',
      title: "Inside Stripe's Engineering Culture",
      url: 'https://pragmaticengineer.com/blog/stripe-engineering',
      published_at: '2026-01-02T11:00:00Z',
      preview: 'A deep dive into how Stripe builds software, based on interviews with current and former engineers.',
      content:
        '<p>Stripe has one of the most respected engineering cultures in tech. I talked with a dozen current and former Stripe engineers to understand what makes it tick.</p>',
      is_read: 1,
      is_starred: 0,
    },
  ],
}

export function seedDatabase() {
  const db = getDb()

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number }
  if (count.count > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database...')

  // Insert folders
  const insertFolder = db.prepare('INSERT INTO folders (id, name) VALUES (?, ?)')
  for (const folder of seedData.folders) {
    insertFolder.run(folder.id, folder.name)
  }

  // Insert feeds
  const insertFeed = db.prepare(`
    INSERT INTO feeds (id, title, url, site_url, favicon, folder_id, last_fetched)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  for (const feed of seedData.feeds) {
    insertFeed.run(
      feed.id,
      feed.title,
      feed.url,
      feed.site_url,
      feed.favicon,
      feed.folder_id,
      feed.last_fetched
    )
  }

  // Insert articles
  const insertArticle = db.prepare(`
    INSERT INTO articles (id, feed_id, title, url, published_at, preview, content, is_read, is_starred)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const article of seedData.articles) {
    insertArticle.run(
      article.id,
      article.feed_id,
      article.title,
      article.url,
      article.published_at,
      article.preview,
      article.content,
      article.is_read,
      article.is_starred
    )
  }

  console.log('Database seeded successfully')
}
