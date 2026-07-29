import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{pagesContent.about.badge}</p>
            <h1 className="editable-display mt-5 max-w-2xl text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">About {SITE_CONFIG.name}</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-white/50">{pagesContent.about.description}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <article>
            <div className="space-y-5 text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((paragraph, index) => (
                <EditableReveal key={paragraph} index={index}>
                  <p>{paragraph}</p>
                </EditableReveal>
              ))}
            </div>
          </article>
          <aside className="space-y-4">
            {pagesContent.about.values.map((value, index) => (
              <EditableReveal key={value.title} index={index}>
                <div className="rounded border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                  <h2 className="editable-display text-lg font-medium">{value.title}</h2>
                  <p className="mt-3 text-[14px] leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              </EditableReveal>
            ))}
          </aside>
        </section>
      </main>
    </EditableSiteShell>
  )
}
