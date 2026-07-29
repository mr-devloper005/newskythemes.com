'use client'

import Link from 'next/link'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10'

const backToTop = () => {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const quickLinks = [
    { label: 'All resources', href: '/sbm' },
    ...CATEGORY_OPTIONS.slice(0, 5).map((c) => ({ label: c.name, href: `/sbm?category=${c.slug}` })),
    { label: 'Contact', href: '/contact' },
  ]

  const menuLinks = [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/sbm' },
    { label: 'About', href: '/about' },
    { label: 'Search', href: '/search' },
    ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Sign up', href: '/signup' }]),
  ]

  const utilityLinks = [
    { label: 'Style guide', href: '/about' },
    { label: 'Privacy', href: '/about' },
    { label: 'Changelog', href: '/about' },
  ]

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* Top strip: tagline + Suggest CTA */}
      <div className="border-b border-white/10">
        <div className={`${container} flex flex-col items-start gap-6 py-12 sm:py-16 md:flex-row md:items-center md:justify-between`}>
          <p className="editable-display max-w-2xl text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
            {globalContent.footer?.tagline || `Our shelves are flexible — bend them around what you're reading next.`}
          </p>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90"
          >
            Suggest a resource <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main columns */}
      <div className={`${container} grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20`}>
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-11 w-11 object-contain brightness-200" />
            </span>
            <span className="editable-display text-lg font-medium tracking-[-0.01em] text-white">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-6 max-w-sm text-[14px] leading-7 text-white/50">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
        </div>

        <div>
          <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/40">Quick section</h3>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="text-[14px] font-medium text-white/60 transition duration-300 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/40">Menu pages</h3>
          <div className="mt-5 grid gap-3">
            {menuLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="text-[14px] font-medium text-white/60 transition duration-300 hover:text-white">
                {link.label}
              </Link>
            ))}
            {session ? (
              <button type="button" onClick={logout} className="text-left text-[14px] font-medium text-white/60 transition duration-300 hover:text-white">
                Sign out
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/40">Utility pages</h3>
          <div className="mt-5 grid gap-3">
            {utilityLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[14px] font-medium text-white/60 transition duration-300 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="overflow-hidden border-t border-white/10">
        <div className={container}>
          <p
            aria-hidden="true"
            className="editable-display select-none py-6 text-center text-[18vw] font-medium leading-none tracking-[-0.06em] text-white/[0.06] sm:py-8"
          >
            {SITE_CONFIG.name}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className={`${container} flex flex-col items-center justify-between gap-4 py-6 md:flex-row`}>
          <p className="text-[12px] font-medium text-white/40">
            {year} © {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={backToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[12px] font-medium text-white/70 transition duration-300 hover:border-white/40 hover:text-white"
            >
              Back to top <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
