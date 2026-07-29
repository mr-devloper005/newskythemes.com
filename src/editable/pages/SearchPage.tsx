import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Globe2, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask } from '@/editable/content/global.content'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
    compactRaw(content.description) ||
    compactRaw(content.excerpt) ||
    compactRaw(content.body) ||
    '',
  )
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  if (derivedTask && isUiHiddenTask(derivedTask)) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const content = getContent(post)
  const website = compactRaw(content.website) || compactRaw(content.url)
  const domain = website ? website.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''

  return (
    <Link href={href} className="group block overflow-hidden rounded border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(27,25,23,0.08)]">
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-dark-bg)]">
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute left-3 top-3 rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[11px] font-medium text-white">{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5">
        {!image ? <span className="inline-block rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[11px] font-medium text-white">{taskLabel}</span> : null}
        <h2 className="editable-display mt-3 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em]">{post.title}</h2>
        {domain ? (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[var(--slot4-muted-text)]"><Globe2 className="h-3.5 w-3.5" /> {domain}</p>
        ) : null}
        {summary ? <p className="mt-2 line-clamp-3 text-[14px] leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--slot4-accent)]">View <ArrowUpRight className="h-3.5 w-3.5" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !isUiHiddenTask(item.key))

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-white/40">{pagesContent.search.hero.badge}</p>
            <h1 className="editable-display mt-4 max-w-2xl text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">{pagesContent.search.hero.title}</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/50">{pagesContent.search.hero.description}</p>

            <form action="/search" className="mt-10 max-w-2xl">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3.5">
                <Search className="h-5 w-5 text-white/40" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/30" />
              </label>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                  <Filter className="h-4 w-4 text-white/40" />
                  <input name="category" defaultValue={category} placeholder="Category" className="w-28 bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-white/30" />
                </label>
                <select name="task" defaultValue={task} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] font-medium text-white outline-none">
                  <option value="">All types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
                <button className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-2.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90" type="submit">Search</button>
              </div>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{results.length} results</p>
              <h2 className="editable-display mt-2 text-2xl font-medium tracking-[-0.02em]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
            </div>
          </div>

          {results.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((post) => <SearchResultCard key={post.id || post.slug} post={post} />)}
            </div>
          ) : (
            <div className="mt-8 rounded border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 text-center">
              <p className="editable-display text-xl font-medium">No matching posts found.</p>
              <p className="mt-3 text-[14px] text-[var(--slot4-muted-text)]">Try a different keyword, type, or category.</p>
            </div>
          )}

          <div className="mt-12">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
