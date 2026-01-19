import { getDb } from './index'

// Seed data for development
const seedData = {
  folders: [
    { id: 'tech-blogs', name: 'Tech Blogs' },
    { id: 'news', name: 'News' },
  ],
  feeds: [
    {
      id: 'feed-raviatluri-in-rss-xml',
      title: 'Ravi Atluri',
      url: 'https://raviatluri.in/rss.xml',
      site_url: 'https://raviatluri.in',
      favicon: 'https://raviatluri.in/favicon.ico',
      folder_id: 'tech-blogs',
      last_fetched: null,
    },
    {
      id: 'feed-news-ycombinator-com-rss',
      title: 'Hacker News',
      url: 'https://news.ycombinator.com/rss',
      site_url: 'https://news.ycombinator.com',
      favicon: 'https://news.ycombinator.com/favicon.ico',
      folder_id: 'news',
      last_fetched: null,
    },
    {
      id: 'feed-pragmaticengineer-com-rss',
      title: 'The Pragmatic Engineer',
      url: 'https://pragmaticengineer.com/rss',
      site_url: 'https://pragmaticengineer.com',
      favicon: 'https://pragmaticengineer.com/favicon.ico',
      folder_id: null,
      last_fetched: null,
    },
    {
      id: 'feed-jvns-ca-atom-xml',
      title: 'Julia Evans',
      url: 'https://jvns.ca/atom.xml',
      site_url: 'https://jvns.ca',
      favicon: 'https://jvns.ca/favicon.ico',
      folder_id: null,
      last_fetched: null,
    },
  ],
}

export function seedDatabase() {
  const db = getDb()

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM folders').get() as {
    count: number
  }
  if (count.count > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database...')

  // Insert folders
  const insertFolder = db.prepare(
    'INSERT INTO folders (id, name) VALUES (?, ?)',
  )
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
      feed.last_fetched,
    )
  }

  console.log('Database seeded successfully')
}
