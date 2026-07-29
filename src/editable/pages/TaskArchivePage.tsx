import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Download, FileText, Globe, Layers, Mail, MapPin, Phone, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return dedupeUrls([...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value
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
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const pad = (n: number) => String(n).padStart(2, '0')

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const totalPages = pagination.totalPages || 1
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const filterCategories = CATEGORY_OPTIONS.slice(0, 14)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* ============ MAGAZINE EDITORIAL HEADER ============ */}
        <section className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
            <nav className="flex items-center gap-2 text-[13px] font-medium text-[var(--tk-muted)]">
              <Link href="/" className="transition duration-300 hover:text-[var(--tk-accent)]">Home</Link>
              <span className="opacity-40">/</span>
              <span className="text-[var(--tk-text)]">{label}</span>
            </nav>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
                  {voice?.eyebrow || theme.kicker}
                </p>
                <h1 className="editable-display mt-5 max-w-4xl text-balance text-4xl font-medium leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[5rem]">
                  {voice?.headline || `Browse ${label.toLowerCase()}`}
                </h1>
                <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[var(--tk-muted)] sm:text-[17px]">
                  {voice?.description || theme.note}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 lg:grid-cols-1 lg:gap-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">Showing</p>
                  <p className="editable-display mt-2 text-3xl font-medium tracking-[-0.02em] text-[var(--tk-text)]">
                    {posts.length}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--tk-muted)]">on this page</p>
                </div>
                <div className="lg:border-t lg:border-[var(--tk-line)] lg:pt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">Filter</p>
                  <p className="editable-display mt-2 text-lg font-medium tracking-[-0.01em] text-[var(--tk-text)]">
                    {categoryLabel}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--tk-muted)]">Page {page} of {totalPages}</p>
                </div>
              </div>
            </div>

            {/* Mobile category chip rail */}
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href={pageHref(basePath, 'all', 1)} className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition duration-300 ${category === 'all' ? 'bg-[var(--tk-accent)] text-[var(--tk-on-accent)]' : 'border border-[var(--tk-line)] text-[var(--tk-muted)]'}`}>
                All
              </Link>
              {filterCategories.map((item) => (
                <Link key={item.slug} href={pageHref(basePath, item.slug, 1)} className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition duration-300 ${category === item.slug ? 'bg-[var(--tk-accent)] text-[var(--tk-on-accent)]' : 'border border-[var(--tk-line)] text-[var(--tk-muted)]'}`}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONTENT: sticky rail + main column ============ */}
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            {/* Sticky filter rail — desktop only */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">Categories</p>
                  <div className="mt-4 space-y-1">
                    <CategoryRailLink basePath={basePath} slug="all" name="All categories" active={category === 'all'} />
                    {filterCategories.map((item) => (
                      <CategoryRailLink key={item.slug} basePath={basePath} slug={item.slug} name={item.name} active={category === item.slug} />
                    ))}
                  </div>
                </div>
                <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">Suggest one</p>
                  <p className="mt-2 text-[13px] leading-6 text-[var(--tk-muted)]">
                    Spotted something worth shelving? Send it our way.
                  </p>
                  <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-accent)]">
                    Suggest a resource <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main column */}
            <div className="min-w-0">
              {posts.length ? (
                <ArchiveMain task={task} posts={posts} basePath={basePath} />
              ) : (
                <div className="rounded border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-20 text-center">
                  <Search className="mx-auto h-6 w-6 text-[var(--tk-muted)]" />
                  <h2 className="editable-display mt-4 text-2xl font-medium tracking-[-0.02em]">Nothing on this shelf yet</h2>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tk-muted)]">
                    Try another category, or check back after new {label.toLowerCase()} are added.
                  </p>
                  <Link href={basePath} className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-[13px] font-medium text-[var(--tk-text)] transition duration-300 hover:border-[var(--tk-accent)]">
                    Clear filter
                  </Link>
                </div>
              )}

              {/* Numbered pagination */}
              {posts.length && totalPages > 1 ? (
                <NumberedPagination basePath={basePath} category={category} page={page} totalPages={totalPages} pagination={pagination} />
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function CategoryRailLink({ basePath, slug, name, active }: { basePath: string; slug: string; name: string; active: boolean }) {
  return (
    <Link
      href={pageHref(basePath, slug, 1)}
      className={`flex items-center justify-between border-l-2 px-4 py-2 text-[14px] font-medium transition duration-300 ${
        active
          ? 'border-[var(--tk-accent)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]'
          : 'border-transparent text-[var(--tk-muted)] hover:border-[var(--tk-line)] hover:text-[var(--tk-text)]'
      }`}
    >
      {name}
      {active ? <ArrowRight className="h-3.5 w-3.5" /> : null}
    </Link>
  )
}

function NumberedPagination({ basePath, category, page, totalPages, pagination }: { basePath: string; category: string; page: number; totalPages: number; pagination: SiteFeedPagination }) {
  const pages: Array<number | 'gap'> = []
  const push = (n: number | 'gap') => pages.push(n)
  push(1)
  if (page - 2 > 2) push('gap')
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) push(p)
  if (page + 2 < totalPages - 1) push('gap')
  if (totalPages > 1) push(totalPages)
  const seen = new Set<string>()
  const cleaned = pages.filter((v) => {
    const key = String(v)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2 text-[14px]">
      {pagination.hasPrevPage ? (
        <Link href={pageHref(basePath, category, page - 1)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium text-[var(--tk-muted)] transition duration-300 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
          <ArrowLeft className="h-3.5 w-3.5" /> Prev
        </Link>
      ) : null}
      {cleaned.map((entry, i) => entry === 'gap' ? (
        <span key={`gap-${i}`} className="px-2 text-[var(--tk-muted)]">…</span>
      ) : (
        <Link
          key={entry}
          href={pageHref(basePath, category, entry)}
          className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-full border px-3 font-medium transition duration-300 ${
            entry === page
              ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]'
              : 'border-[var(--tk-line)] text-[var(--tk-muted)] hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]'
          }`}
        >
          {entry}
        </Link>
      ))}
      {pagination.hasNextPage ? (
        <Link href={pageHref(basePath, category, page + 1)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-4 py-2 font-medium text-[var(--tk-muted)] transition duration-300 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
          Next <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </nav>
  )
}

function ArchiveMain({ task, posts, basePath }: { task: TaskKey; posts: SitePost[]; basePath: string }) {
  if (task === 'sbm') return <SbmMain posts={posts} basePath={basePath} />
  if (task === 'profile') return <ProfileMain posts={posts} basePath={basePath} />
  return <GenericGrid task={task} posts={posts} basePath={basePath} />
}

/* ============ SBM: featured hero + numbered list + in-feed ad ============ */
function SbmMain({ posts, basePath }: { posts: SitePost[]; basePath: string }) {
  const [featured, ...rest] = posts
  const adIndex = Math.min(5, Math.floor(rest.length / 2))
  const featuredHref = `${basePath}/${featured.slug}`
  const featuredDomain = getField(featured, ['website', 'url', 'link'])
  const featuredCategory = getCategory(featured, 'Resource')
  const featuredImage = getImages(featured)[0]

  return (
    <div className="space-y-10">
      {/* Featured resource — magazine hero card */}
      <EditableReveal>
        <Link
          href={featuredHref}
          className="group grid gap-0 overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(27,25,23,0.08)] md:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative aspect-[16/11] overflow-hidden bg-[var(--slot4-dark-bg)] md:aspect-auto md:min-h-[360px]">
            {featuredImage ? (
              <img src={featuredImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#1b1917,#2a2624)] text-white/40">
                <Layers className="h-14 w-14" />
              </div>
            )}
            <span className="absolute left-5 top-5 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
              Featured
            </span>
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{featuredCategory}</span>
            <h2 className="editable-display text-2xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-3xl lg:text-4xl">
              {featured.title}
            </h2>
            <p className="line-clamp-3 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(featured)}</p>
            {featuredDomain ? (
              <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-muted)]">
                <Globe className="h-3.5 w-3.5" /> {cleanDomain(featuredDomain)}
              </p>
            ) : null}
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-[13px] font-medium text-white transition duration-300 group-hover:opacity-90">
              Read resource <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </EditableReveal>

      {/* Rest — numbered index list */}
      {rest.length ? (
        <div className="divide-y divide-[var(--tk-line)] border-y border-[var(--tk-line)]">
          {rest.map((post, index) => (
            <div key={post.id || post.slug}>
              {index === adIndex ? (
                <div className="py-6">
                  <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
                </div>
              ) : null}
              <EditableReveal index={index % 5}>
                <SbmIndexRow post={post} href={`${basePath}/${post.slug}`} index={index + 2} />
              </EditableReveal>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SbmIndexRow({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const domain = getField(post, ['website', 'url', 'link'])
  const category = getCategory(post, 'Resource')
  return (
    <Link
      href={href}
      className="group grid grid-cols-[60px_1fr_auto] items-start gap-6 py-6 transition duration-300 hover:bg-[var(--tk-raised)] sm:grid-cols-[80px_1fr_auto] sm:py-8"
    >
      <span className="editable-display text-2xl font-medium tracking-[-0.01em] text-[var(--tk-accent)] sm:text-3xl">
        {pad(index)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
          <span className="text-[var(--tk-accent)]">{category}</span>
          {domain ? (
            <>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal"><Globe className="h-3.5 w-3.5" /> {cleanDomain(domain)}</span>
            </>
          ) : null}
        </div>
        <h3 className="editable-display mt-3 text-xl font-medium leading-snug tracking-[-0.01em] sm:text-2xl">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
      <ArrowUpRight className="mt-2 h-5 w-5 shrink-0 text-[var(--tk-muted)] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

/* ============ PROFILE: contact-card directory ============ */
function ProfileMain({ posts, basePath }: { posts: SitePost[]; basePath: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {posts.map((post, index) => (
        <EditableReveal key={post.id || post.slug} index={index % 6}>
          <ProfileDirectoryCard post={post} href={`${basePath}/${post.slug}`} />
        </EditableReveal>
      ))}
    </div>
  )
}

function ProfileDirectoryCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'address', 'city'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <Link
      href={href}
      className="group flex flex-col gap-5 rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)] hover:shadow-[0_12px_40px_rgba(27,25,23,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-raised)]">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7 text-[var(--tk-muted)]" />}
        </div>
        <div className="min-w-0 flex-1">
          {role ? <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{role}</p> : null}
          <h3 className="editable-display mt-1 text-lg font-medium leading-tight tracking-[-0.01em]">{post.title}</h3>
          {location ? <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-[var(--tk-muted)]"><MapPin className="h-3 w-3" /> {location}</p> : null}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)] transition duration-300 group-hover:text-[var(--tk-accent)]" />
      </div>
      <p className="line-clamp-2 text-[13px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="flex flex-wrap gap-1.5 border-t border-[var(--tk-line)] pt-4">
        {website ? <Chip icon={Globe} label="Web" /> : null}
        {email ? <Chip icon={Mail} label="Email" /> : null}
        {phone ? <Chip icon={Phone} label="Call" /> : null}
        {!website && !email && !phone ? <span className="text-[12px] text-[var(--tk-muted)]">Contact via profile</span> : null}
      </div>
    </Link>
  )
}

function Chip({ icon: Icon, label }: { icon: typeof Globe; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--tk-raised)] px-2.5 py-1 text-[11px] font-medium text-[var(--tk-muted)]">
      <Icon className="h-3 w-3" /> {label}
    </span>
  )
}

/* ============ Generic grid for other task types ============ */
function GenericGrid({ task, posts, basePath }: { task: TaskKey; posts: SitePost[]; basePath: string }) {
  const gridClass: Record<TaskKey, string> = {
    article: 'grid gap-5 sm:grid-cols-2',
    listing: 'grid gap-4',
    classified: 'grid gap-5 sm:grid-cols-2',
    image: 'columns-1 gap-4 [column-fill:_balance] sm:columns-2',
    sbm: 'grid gap-5 sm:grid-cols-2',
    pdf: 'grid gap-5 sm:grid-cols-2',
    profile: 'grid gap-5 sm:grid-cols-2',
  }
  return (
    <div className={gridClass[task]}>
      {posts.map((post, index) => (
        <EditableReveal key={post.id || post.slug} index={index % 6}>
          <GenericCard task={task} post={post} basePath={basePath} index={index} />
        </EditableReveal>
      ))}
    </div>
  )
}

function GenericCard({ task, post, basePath, index }: { task: TaskKey; post: SitePost; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} />
}

const cardBase = 'group block rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(27,25,23,0.08)]'

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function ArticleArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-5 sm:p-6">
        <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{category}</span>
        <h2 className="editable-display mt-2 text-xl font-medium leading-snug tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read article" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-5 sm:p-6`}>
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-8 w-8 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-lg font-medium tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-1 line-clamp-1 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition duration-300 group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-2xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-4 text-lg font-medium leading-snug tracking-[-0.01em]">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-[12px] font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition duration-300 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-4 block break-inside-avoid overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(27,25,23,0.78))] opacity-80 transition duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-snug text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-white/70">View image <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-5 w-5" /></div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-5 text-lg font-medium leading-snug tracking-[-0.01em]">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

