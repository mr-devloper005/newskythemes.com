import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const uiHiddenTaskKeys = ['profile'] as const
export const isUiHiddenTask = (key: string) =>
  (uiHiddenTaskKeys as readonly string[]).includes(key)

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Curated resources worth saving',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Curated resources worth saving',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse the library', href: '/sbm' },
      secondary: { label: 'Get in touch', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Curated resources, tools, and collections',
    description: 'A calm discovery surface for curated resources, tools, collections, and links worth saving — organized by topic and kept useful.',
    columns: [
      {
        title: 'Collections',
        links: [
          { label: 'All resources', href: '/sbm' },
          { label: 'Tools', href: '/sbm?category=tools' },
          { label: 'Design', href: '/sbm?category=design' },
          { label: 'Development', href: '/sbm?category=development' },
          { label: 'Reference', href: '/sbm?category=reference' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built for calm discovery and curated collections.',
  },
  commonLabels: {
    readMore: 'View resource',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Added',
  },
} as const
