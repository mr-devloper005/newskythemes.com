import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export function dedupeUrls(urls: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      urls
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter((url) => url.length > 0),
    ),
  )
}

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group block min-w-0 overflow-hidden ${dc.surface.dark} ${dc.motion.lift}`}>
      <div className="relative min-h-[480px] p-8 sm:p-10 lg:min-h-[560px]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,25,23,0.1),rgba(27,25,23,0.85))]" />
        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end lg:min-h-[500px]">
          <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{label}</span>
          <h3 className="mt-4 max-w-3xl text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">{post.title}</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65">{getEditableExcerpt(post, 180)}</p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[var(--slot4-dark-bg)]">
            View resource <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} ${dc.media.ratio}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[11px] font-medium text-white">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="p-4">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-3 text-lg font-medium leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-[var(--slot4-soft-muted-text)]">{getEditableExcerpt(post, 120)}</p>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group block min-w-0 ${dc.surface.soft} p-5 ${dc.motion.lift}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-dark-bg)] text-[13px] font-medium text-white">{index + 1}</span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[var(--slot4-soft-muted-text)]">{getEditableExcerpt(post, 100)}</p>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid min-w-0 gap-5 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[200px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[16/12] sm:aspect-auto sm:min-h-[180px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="min-w-0 p-1 sm:py-3 sm:pr-4">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h2 className="mt-2 line-clamp-3 text-xl font-medium leading-snug tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-2xl">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-[var(--slot4-soft-muted-text)]">{getEditableExcerpt(post, 160)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-[var(--slot4-page-text)]">View resource <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}
