import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import content from '~/content/blog/introduction.md?raw'

export const Route = createFileRoute('/blog/introduction')({
  component: BlogIntroduction,
})

function BlogIntroduction() {
  return (
    <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  )
}
