import Link from 'next/link'
import {
  ArrowDown, ArrowRight, ArrowUpRight, ChevronDown,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 140) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
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

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10'

function firstImageOf(posts: SitePost[]) {
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (img && !img.includes('placeholder')) return img
  }
  return ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ============================== HERO ============================== */
export function EditableHomeHero({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const backdrop = firstImageOf(pool)
  const eyebrowLines = ['SEAMLESS DISCOVERY', 'LASTING REFERENCE']

  return (
    <section className="relative isolate overflow-hidden bg-[var(--slot4-dark-bg)] text-white">
      {backdrop ? (
        <>
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,25,23,0.35),rgba(27,25,23,0.85))]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#1b1917_0%,#2a2624_60%,#1b1917_100%)]" />
      )}
      <div className={`${container} relative flex min-h-[720px] flex-col justify-center py-24 text-center sm:py-32`}>
        <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-white/50">
          {eyebrowLines[0]}
        </p>
        <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.24em] text-white/50">
          {eyebrowLines[1]}
        </p>
        <h1 className="editable-display mx-auto mt-8 max-w-4xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
          {pagesContent.home.hero.title?.join(' ') || `A curated collection of resources worth saving`}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-white/60 sm:text-[17px]">
          {pagesContent.home.hero.description || `${SITE_CONFIG.name} organizes the internet's most useful references, tools and reading into shelves you can trust.`}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href={pagesContent.home.hero.primaryCta?.href || primaryRoute} className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90">
            {pagesContent.home.hero.primaryCta?.label || 'Browse the library'} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={pagesContent.home.hero.secondaryCta?.href || '/about'} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:bg-white/5">
            {pagesContent.home.hero.secondaryCta?.label || 'About the library'}
          </Link>
        </div>
        <div className="mt-16 flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.24em] text-white/40">
          <ArrowDown className="h-4 w-4 animate-bounce" />
          <span>Scroll down</span>
        </div>
      </div>
    </section>
  )
}

/* ==================== PARTNERS / COLLECTIONS ROW ==================== */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = CATEGORY_OPTIONS.slice(0, 8)
  return (
    <EditableReveal>
      <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
        <div className={`${container} flex flex-col gap-6 py-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between`}>
          <p className="editable-display max-w-md text-[15px] font-medium tracking-[-0.01em] text-[var(--slot4-muted-text)]">
            Trusted collections across every corner of the working web
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`${primaryRoute}?category=${category.slug}`}
                className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2 text-[13px] font-medium text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </EditableReveal>
  )
}

/* =================== ABOUT (two-column text + image) =================== */
export function EditableFeatures() {
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} grid gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1fr] lg:items-center`}>
        <EditableReveal>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              ABOUT THE LIBRARY
            </p>
            <h2 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              We keep the web&apos;s best reading within reach
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              {`${SITE_CONFIG.name} was built to solve a simple problem — good things get lost. We collect, review and organize the resources that keep proving useful, so they stay findable long after the tab closes.`}
            </p>
            <div className="mt-8">
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-[14px] font-medium transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                About {SITE_CONFIG.name} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </EditableReveal>
        <EditableReveal index={1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] lg:aspect-[5/6]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(197,74,13,0.15),transparent_50%,rgba(27,25,23,0.4))]" />
            <div className="absolute inset-0 flex items-center justify-center p-10 text-center">
              <div>
                <p className="editable-display text-6xl font-medium tracking-[-0.03em] text-white sm:text-7xl">01</p>
                <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.24em] text-white/50">Curated · Reviewed · Kept</p>
              </div>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ============== SERVICES — 4-column numbered cards ============== */
export function EditableMagazineSplit({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(0, 4)
  const fallback = [
    { title: 'Design & inspiration', summary: 'Portfolios, systems and craft references saved from the far corners of the web.' },
    { title: 'Tools & software', summary: 'The apps, utilities and SaaS quietly powering the way people work today.' },
    { title: 'Reading & writing', summary: 'Long-form pieces, essays and reference material worth saving beyond a tab.' },
    { title: 'Reference material', summary: 'Docs, guides and evergreen pages you find yourself returning to weekly.' },
  ]
  const items = pool.length >= 4 ? pool.slice(0, 4).map((post) => ({
    title: post.title,
    summary: getExcerpt(post, 130),
    href: postHref('sbm', post, primaryRoute),
    image: getEditablePostImage(post),
    category: categoryOf(post) || 'Collection',
  })) : fallback.map((item, i) => ({
    ...item,
    href: primaryRoute,
    image: '',
    category: pad(i + 1),
  }))

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${container} py-20 sm:py-28`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Collections</p>
            <h2 className="editable-display mt-5 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              What lives inside the library
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-8 text-[var(--slot4-muted-text)]">
            Four broad shelves group everything we save, so you can wander through by mood or hunt something specific.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <EditableReveal key={item.title} index={i}>
              <Link href={item.href} className="group flex h-full flex-col overflow-hidden rounded border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(27,25,23,0.08)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-dark-bg)]">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#1b1917,#2a2624)]" />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-dark-bg)]">
                    {pad(i + 1)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{item.category}</p>
                  <h3 className="editable-display mt-3 text-xl font-medium leading-snug tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-7 text-[var(--slot4-muted-text)]">{item.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--slot4-accent)]">
                    Explore <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============ INDUSTRY COVERAGE → Topics we care about ============ */
export function EditableStatsBand({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const topics = [
    { title: 'Working software', body: 'Apps, SaaS and micro-tools that quietly earn a place in daily workflows.' },
    { title: 'Design & taste', body: 'Portfolios, systems and case studies from the people shaping how the web looks.' },
    { title: 'Reading & essays', body: 'Long-form work worth sitting with, saved before the algorithm forgets them.' },
    { title: 'Reference & docs', body: 'The evergreen pages, guides and manuals that keep proving useful weekly.' },
  ]
  const counts = topics.map((_, i) => Math.max(1, Math.floor(pool.length / topics.length) + (i === 0 ? pool.length % topics.length : 0)))

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} grid gap-16 py-20 sm:py-28 lg:grid-cols-[0.85fr_1.15fr]`}>
        <EditableReveal>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Topics we cover</p>
            <h2 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Subjects that keep the library growing
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              {SITE_CONFIG.name} covers the topics readers keep coming back for, shaping each shelf around real curiosity rather than trending noise.
            </p>
          </div>
        </EditableReveal>

        <div className="divide-y divide-[var(--editable-border)] border-t border-[var(--editable-border)]">
          {topics.map((topic, i) => (
            <EditableReveal key={topic.title} index={i}>
              <div className="grid grid-cols-[64px_1fr_auto] items-start gap-6 py-8">
                <span className="editable-display text-2xl font-medium text-[var(--slot4-accent)]">{pad(i + 1)}</span>
                <div>
                  <h3 className="editable-display text-xl font-medium leading-snug tracking-[-0.01em] sm:text-2xl">{topic.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-[var(--slot4-muted-text)]">{topic.body}</p>
                </div>
                <span className="hidden text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)] sm:block">
                  {counts[i]} saved
                </span>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================ PROCESS — How we curate (4 steps) ================ */
export function EditableTimeCollections({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const steps = [
    { title: 'We spot it', body: 'Something interesting surfaces — a tool, a piece of writing, a reference worth revisiting.' },
    { title: 'We read it', body: 'Every submission gets opened and read before it earns a slot. No auto-import, no scraping.' },
    { title: 'We shelve it', body: 'The resource lands on the right shelf with a short note explaining what makes it worth your click.' },
    { title: 'We keep it', body: 'Links get checked, stale entries pruned, and shelves reshuffled so the library stays honest.' },
  ]
  const images = pool.slice(0, 4).map(getEditablePostImage).filter((img) => img && !img.includes('placeholder'))

  return (
    <section className="bg-[var(--slot4-dark-bg)] text-white">
      <div className={`${container} py-20 sm:py-28`}>
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">How we curate</p>
          <h2 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            A slow, quiet process — the way libraries used to work
          </h2>
          <p className="mt-6 text-[15px] leading-8 text-white/60">
            Every resource gets a human read before it lands here. That's why the shelves feel calm, and why what you find still holds up months later.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <EditableReveal key={step.title} index={i}>
              <div className="border-t border-white/15 pt-6">
                <p className="editable-display text-4xl font-medium tracking-[-0.02em] text-white/80">{pad(i + 1)}</p>
                <h3 className="editable-display mt-6 text-xl font-medium leading-snug tracking-[-0.01em]">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-white/55">{step.body}</p>
              </div>
            </EditableReveal>
          ))}
        </div>

        {images.length ? (
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.slice(0, 4).map((img, i) => (
              <EditableReveal key={img} index={i}>
                <div className="aspect-[4/5] overflow-hidden rounded border border-white/10 bg-[var(--slot4-panel-bg)]">
                  <img src={img} alt="" className="h-full w-full object-cover opacity-80 transition duration-700 hover:opacity-100 hover:scale-[1.03]" />
                </div>
              </EditableReveal>
            ))}
          </div>
        ) : null}

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <Link href={primaryRoute} className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-[14px] font-medium text-white transition duration-300 hover:opacity-90">
            Start browsing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[14px] font-medium text-white transition duration-300 hover:bg-white/5">
            Suggest a resource
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ============================= FAQ ============================= */
export function EditableFaq() {
  const faqs = [
    { q: `What does ${SITE_CONFIG.name} save?`, a: `Working tools, reference material, essays and design worth returning to. If it deserves more than a bookmark folder, it belongs on a shelf.` },
    { q: 'How is each resource reviewed?', a: `Every link is opened and read by a human before it earns a slot. We check that it loads, that it holds up, and that it fits an existing shelf — or deserves a new one.` },
    { q: 'Can I suggest a resource?', a: `Yes — the contact page routes every submission to a curator. Include a short note about why it matters and we'll take it from there.` },
    { q: 'How often are shelves updated?', a: `New entries land throughout the week. Old links get audited monthly so broken or outdated resources disappear before you find them.` },
    { q: 'Do you follow trending topics?', a: `Not really. Trend cycles come and go — the library keeps what still feels useful six months later. That's the only bar.` },
    { q: 'Is browsing free?', a: `Every shelf is public and free to read. An account only becomes useful when you want to save or submit resources of your own.` },
  ]

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr]`}>
        <EditableReveal>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">FAQs</p>
            <h2 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              Got another question? Get in touch — we read everything that lands.
            </p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-[14px] font-medium transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
              Contact us <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className="divide-y divide-[var(--editable-border)] border-y border-[var(--editable-border)]">
          {faqs.map((item, i) => (
            <details key={item.q} className="group py-6" open={i === 0}>
              <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                <span className="editable-display text-[17px] font-medium leading-snug tracking-[-0.01em] sm:text-lg">{item.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[var(--slot4-accent)] transition duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[var(--slot4-muted-text)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========================= FINAL CTA ========================= */
export function EditableHomeCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--slot4-dark-bg)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(197,74,13,0.18)_0%,transparent_50%,rgba(197,74,13,0.08)_100%)]" />
      <div className={`${container} relative flex flex-col items-center gap-10 py-24 text-center sm:py-32`}>
        <EditableReveal>
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
            Start reading
          </p>
        </EditableReveal>
        <EditableReveal index={1}>
          <h2 className="editable-display max-w-4xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
            {pagesContent.home.cta?.title || `Bookmarks that finally sit still`}
          </h2>
        </EditableReveal>
        <EditableReveal index={2}>
          <p className="max-w-2xl text-[15px] leading-8 text-white/60 sm:text-[17px]">
            {pagesContent.home.cta?.description || `Stop hoarding tabs. Let ${SITE_CONFIG.name} keep the good stuff shelved, sorted, and easy to find again.`}
          </p>
        </EditableReveal>
        <EditableReveal index={3}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={pagesContent.home.cta?.primaryCta?.href || '/sbm'} className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90">
              {pagesContent.home.cta?.primaryCta?.label || `Enter the library`} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={pagesContent.home.cta?.secondaryCta?.href || '/contact'} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:bg-white/5">
              {pagesContent.home.cta?.secondaryCta?.label || `Suggest something`} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
