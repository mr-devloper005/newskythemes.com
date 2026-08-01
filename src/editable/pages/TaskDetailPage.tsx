import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Shield, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return dedupeUrls([...media, ...images, ...singleImages]).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'
const linkifyMarkdown = (value: string) => value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)
const linkifyText = (value: string) => linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)
const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})
const sanitizeHtml = (html: string) => hardenLinks(html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))
const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value.split(/\n{2,}/).map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`).join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const comparable = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  if (!lead) return ''
  const leadKey = comparable(lead)
  return leadKey && comparable(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--tk-muted)] transition duration-300 hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'resources'}
    </Link>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[16px] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function Divider() {
  return <div className="my-10 h-px bg-[var(--tk-line)]" />
}

/* ----- Bookmark/Resource Detail (public hero) ----- */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const domain = website ? cleanDomain(website) : ''
  const category = categoryOf(post, 'Resource')
  const content = getContent(post)
  const verified = Boolean(content.verified || content.reviewed)
  const lead = leadText(post)

  return (
    <>
      {/* Breadcrumb ribbon */}
      <section className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className="mx-auto flex max-w-[var(--editable-container)] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-[var(--tk-muted)]">
            <Link href="/" className="transition duration-300 hover:text-[var(--tk-accent)]">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/sbm" className="transition duration-300 hover:text-[var(--tk-accent)]">Library</Link>
            <span className="opacity-40">/</span>
            <span className="hidden truncate text-[var(--tk-text)] sm:inline">{post.title}</span>
          </nav>
          {verified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
              <Shield className="h-3 w-3" /> Verified
            </span>
          ) : null}
        </div>
      </section>

      {/* HERO: two-column, light bg — text left, browser preview right */}
      <section className="bg-[var(--tk-bg)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
              {category}
            </p>
            <h1 className="editable-display mt-6 text-balance text-4xl font-medium leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-[4rem]">
              {post.title}
            </h1>
            {lead ? <p className="mt-6 max-w-xl text-[17px] leading-8 text-[var(--tk-muted)]">{lead}</p> : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90">
                  Visit resource <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              <Link href="/sbm" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-7 py-3.5 text-[14px] font-medium transition duration-300 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                Back to library
              </Link>
            </div>
            {post.tags?.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[12px] font-medium text-[var(--tk-muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Mock browser preview card */}
          <div className="lg:pl-6">
            <div className="overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_16px_50px_rgba(27,25,23,0.08)]">
              <div className="flex items-center gap-1.5 border-b border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 truncate rounded-sm border border-[var(--tk-line)] bg-[var(--tk-bg)] px-3 py-1 text-[12px] text-[var(--tk-muted)]">
                  {domain || 'resource preview'}
                </span>
              </div>
              <div className="flex min-h-[280px] flex-col justify-center gap-4 bg-[linear-gradient(135deg,var(--tk-surface),var(--tk-raised))] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                  <Bookmark className="h-6 w-6" />
                </div>
                <p className="editable-display text-2xl font-medium tracking-[-0.02em]">{domain || 'This resource'}</p>
                <p className="text-[13px] text-[var(--tk-muted)]">Curated in the {category} collection</p>
                {website ? (
                  <Link href={website} target="_blank" rel="noreferrer" className="mx-auto mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--tk-accent)]">
                    Open in a new tab <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts strip — dark full-width */}
      <section className="bg-[var(--slot4-dark-bg)] text-white">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-10">
          <FactCell label="Collection" value={category} icon={Tag} />
         
          <FactCell label="Verified" value={verified ? 'Curator reviewed' : 'Pending review'} icon={Shield} />
          <FactCell label="Curated by" value={SITE_CONFIG.name} icon={CheckCircle2} />
        </div>
      </section>

      {/* Body + sticky sidebar */}
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20 lg:px-10">
        <article className="min-w-0">
          <BodyContent post={post} />
          {website ? (
            <div className="mt-12 rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Ready?</p>
              <p className="editable-display mt-3 text-2xl font-medium tracking-[-0.02em]">Open {domain || 'the resource'}</p>
              <p className="mt-2 max-w-xl text-[14px] leading-7 text-[var(--tk-muted)]">
                Everything on this page is a summary — the real thing lives on the resource itself.
              </p>
              <Link href={website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-[14px] font-medium text-white transition duration-300 hover:opacity-90">
                Visit resource <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">Collection index</p>
            <div className="mt-5 divide-y divide-[var(--tk-line)]">
              <div className="grid grid-cols-[36px_1fr] items-start gap-3 py-3">
                
               
              </div>
              {related.map((item, i) => (
                <Link key={item.id || item.slug} href={`/sbm/${item.slug}`} className="grid grid-cols-[36px_1fr] items-start gap-3 py-3 transition duration-300 hover:bg-[var(--tk-raised)]">
                  <span className="editable-display text-lg font-medium text-[var(--tk-muted)]">{String(i + 2).padStart(2, '0')}</span>
                  <p className="line-clamp-2 text-[13px] font-medium leading-5 text-[var(--tk-text)] transition duration-300 hover:text-[var(--tk-accent)]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
        </aside>
      </section>

      {related.length ? <RelatedStrip task="sbm" related={related} label="More from this collection" /> : null}
    </>
  )
}

function FactCell({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Tag }) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="editable-display mt-2 truncate text-lg font-medium tracking-[-0.01em] text-white">{value}</p>
    </div>
  )
}

/* ----- Profile Detail (hidden, direct-URL only) — business-card centered layout ----- */
function ProfileDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation'])
  const company = getField(post, ['company', 'organization'])
  const location = getField(post, ['location', 'address', 'city'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const bio = leadText(post)
  const avatar = images[0]
  const initials = post.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  return (
    <>
      {/* Minimal breadcrumb ribbon */}
      <section className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className="mx-auto flex max-w-[var(--editable-container)] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-[var(--tk-muted)]">
            <Link href="/" className="transition duration-300 hover:text-[var(--tk-accent)]">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-[var(--tk-text)]">Curator</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
            <UserRound className="h-3 w-3" /> Profile
          </span>
        </div>
      </section>

      {/* Centered identity block */}
      <section className="bg-[var(--tk-bg)]">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-24 lg:px-10">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_12px_40px_rgba(27,25,23,0.08)] sm:h-32 sm:w-32">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="editable-display text-3xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">{initials || <UserRound className="h-12 w-12 text-[var(--tk-muted)]" />}</span>
            )}
          </div>
          {role ? (
            <p className="mt-6 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
              {role}
            </p>
          ) : null}
          <h1 className="editable-display mt-5 text-balance text-4xl font-medium leading-[1] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          {company || location ? (
            <p className="mt-4 inline-flex items-center gap-2 text-[14px] text-[var(--tk-muted)]">
              {company ? <span>{company}</span> : null}
              {company && location ? <span className="opacity-40">·</span> : null}
              {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}</span> : null}
            </p>
          ) : null}
          {bio ? <p className="mt-6 max-w-xl text-[15px] leading-8 text-[var(--tk-muted)] sm:text-[16px]">{bio}</p> : null}
          {website || email || phone ? (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-[13px] font-medium text-white transition duration-300 hover:opacity-90">
                  <Globe2 className="h-3.5 w-3.5" /> Website
                </Link>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-[13px] font-medium transition duration-300 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-[13px] font-medium transition duration-300 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--tk-line)]" />

      {/* Details section: info card (left) + body (right) */}
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16 lg:px-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Curator card</p>
            <dl className="mt-5 divide-y divide-[var(--tk-line)] text-[13px]">
              <DlRow label="Name" value={post.title} />
              {role ? <DlRow label="Role" value={role} /> : null}
              {company ? <DlRow label="Company" value={company} /> : null}
              {location ? <DlRow label="Location" value={location} /> : null}
              {website ? <DlRow label="Website" value={cleanDomain(website)} /> : null}
              <DlRow label="Curated on" value={SITE_CONFIG.name} />
            </dl>
            <div className="mt-5 flex items-center gap-1.5 rounded bg-[var(--tk-accent-soft)] px-3 py-2 text-[12px] font-medium text-[var(--tk-accent)]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified curator
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">About</p>
          <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
            More about {post.title.split(/\s+/)[0]}
          </h2>
          <BodyContent post={post} />
          {images.slice(1).length ? (
            <div className="mt-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">Gallery</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.slice(1, 7).map((image, i) => (
                  <img key={`${image}-${i}`} src={image} alt="" className="aspect-square rounded border border-[var(--tk-line)] object-cover" />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium text-[var(--tk-text)]">{value}</dd>
    </div>
  )
}

/* ----- Article ----- */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <BackLink task="article" />
        <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-4 text-balance text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">{post.title}</h1>
        <div className="mt-5 text-[14px] text-[var(--tk-muted)]"><span>{SITE_CONFIG.name}</span></div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ----- Listing ----- */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">Business listing</span>
              <h1 className="editable-display mt-2 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Divider />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ----- Classified ----- */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-6 rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_8px_30px_rgba(27,25,23,0.06)]">
            <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">Classified</span>
            <h1 className="editable-display mt-3 text-2xl font-medium leading-tight tracking-[-0.02em]">{post.title}</h1>
            <p className="editable-display mt-5 text-3xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-5 space-y-2">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-[14px] font-medium text-[var(--tk-on-accent)] transition duration-300 hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-[14px] font-medium transition duration-300 hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ----- Image ----- */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-4 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-4 break-inside-avoid overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image</span>
            <h1 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-[17px] leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ----- PDF ----- */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-7 w-7" /></div>
            <div className="min-w-0">
              <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{categoryOf(post, 'Document')}</span>
              <h1 className="editable-display mt-2 text-2xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-3xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-[14px] font-medium">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-[12px] font-medium text-[var(--tk-on-accent)] transition duration-300 hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] min-h-[520px] w-full bg-[var(--tk-raised)]" />
              <div className="border-t border-[var(--tk-line)] p-4 text-[14px] text-[var(--tk-muted)]">
                Can&apos;t see the document?{' '}
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--tk-accent)] underline">Open it in a new tab</Link>.
              </div>
            </div>
          ) : null}
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[14px] font-medium">Get this document</p>
              <p className="mt-2 text-[14px] leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-[14px] font-medium text-[var(--tk-on-accent)] transition duration-300 hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ----- Shared building blocks ----- */
function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-[14px] font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-[14px] font-medium"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-64 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-[14px] font-medium text-[var(--tk-on-accent)] transition duration-300 hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-[14px] font-medium transition duration-300 hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-[14px] font-medium transition duration-300 hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-5">{buttons}</div>
  return (
    <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-[14px]">
      <span className="font-medium uppercase tracking-[0.1em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-5">
      <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">About this resource</p>
        <div className="mt-4 grid gap-2 text-[14px] text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-medium tracking-[-0.01em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related, label }: { task: TaskKey; related: SitePost[]; label?: string }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-medium tracking-[-0.02em]">{label || `More ${(taskConfig?.label || 'resources').toLowerCase()}`}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-6 w-6 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-4">
          <h3 className="editable-display line-clamp-2 text-[15px] font-medium leading-snug">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded border border-[var(--tk-line)] p-3 transition duration-300 hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-14 w-14 shrink-0 rounded object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[14px] font-medium leading-snug">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
