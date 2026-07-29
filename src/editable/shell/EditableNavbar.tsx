'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, ChevronDown, Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const COLLECTIONS = CATEGORY_OPTIONS.slice(0, 8).map((c) => ({ label: c.name, href: `/sbm?category=${c.slug}` }))

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    setOpen(false)
    setCollectionsOpen(false)
  }, [pathname])

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/sbm' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10'

  return (
    <header className="sticky top-0 z-50">
      {/* Main navbar */}
      <div className="border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)]">
        <nav className={`${container} flex h-20 items-center gap-6`}>
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-dark-bg)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
            </span>
            <span className="editable-display text-lg font-medium tracking-[-0.01em]">{SITE_CONFIG.name}</span>
          </Link>

          {/* Center menu */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-[14px] font-medium transition duration-300 ${
                    active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
                onClick={() => setCollectionsOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-4 py-2 text-[14px] font-medium text-[var(--slot4-page-text)] transition duration-300 hover:text-[var(--slot4-accent)]"
                aria-expanded={collectionsOpen}
              >
                Collections <ChevronDown className={`h-3.5 w-3.5 transition duration-300 ${collectionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {collectionsOpen ? (
                <div
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                  className="absolute left-1/2 top-full z-50 min-w-[220px] -translate-x-1/2 pt-2"
                >
                  <div className="rounded border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-2 shadow-[0_8px_30px_rgba(27,25,23,0.08)]">
                    {COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.href}
                        href={collection.href}
                        className="flex items-center justify-between gap-3 rounded px-3 py-2 text-[14px] font-medium text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-accent)]"
                      >
                        {collection.label} <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-full transition duration-300 hover:bg-[var(--slot4-panel-bg)]"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px] text-[var(--slot4-muted-text)]" />
            </Link>

            {session ? (
              <>
                <Link
                  href="/create"
                  className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90 sm:inline-flex"
                >
                  Suggest a resource <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--slot4-muted-text)] transition duration-300 hover:text-[var(--slot4-page-text)] lg:inline-flex"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--slot4-muted-text)] transition duration-300 hover:text-[var(--slot4-page-text)] lg:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact"
                  className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[14px] font-medium text-white transition duration-300 hover:opacity-90 sm:inline-flex"
                >
                  Suggest a resource <ArrowUpRight className="h-4 w-4" />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition duration-300 hover:bg-[var(--slot4-panel-bg)] lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open ? (
          <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] lg:hidden">
            <div className={`${container} py-5`}>
              <div className="grid gap-1">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded px-4 py-3 text-[15px] font-medium text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
                <p className="mt-3 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-soft-muted-text)]">Collections</p>
                {COLLECTIONS.map((collection) => (
                  <Link
                    key={collection.href}
                    href={collection.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded px-4 py-2.5 text-[14px] font-medium text-[var(--slot4-muted-text)] transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-accent)]"
                  >
                    {collection.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
                <div className="mt-4 grid gap-2 border-t border-[var(--editable-border)] pt-4">
                  {session ? (
                    <>
                      <Link href="/create" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-[14px] font-medium text-white">
                        Suggest a resource <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => { logout(); setOpen(false) }} className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-[14px] font-medium">Sign out</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-center text-[14px] font-medium">Sign in</Link>
                      <Link href="/signup" onClick={() => setOpen(false)} className="rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-center text-[14px] font-medium text-white">Sign up</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
