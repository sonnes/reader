import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import content from '~/content/blog/how-to-use.md?raw'

export const Route = createFileRoute('/blog/how-to-use')({
  component: BlogHowToUse,
})

function BlogHowToUse() {
  return (
    <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  )
}
