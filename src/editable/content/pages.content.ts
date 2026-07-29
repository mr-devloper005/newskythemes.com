import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Curated resources, tools, and collections worth saving',
      description: 'Discover curated links, tools, collections, and resources organized by topic — a calm browsing experience for things worth bookmarking.',
      openGraphTitle: 'Curated resources, tools, and collections worth saving',
      openGraphDescription: 'Discover curated links, tools, collections, and resources organized by topic.',
      keywords: ['curated resources', 'bookmark collections', 'resource library', 'link curation'],
    },
    hero: {
      badge: 'The Library',
      title: ['A curated collection of', 'resources worth saving.'],
      description: 'Discover tools, references, guides, and links organized into browsable collections — curated for quality and kept useful over time.',
      primaryCta: { label: 'Browse the library', href: '/sbm' },
      secondaryCta: { label: 'Learn more', href: '/about' },
      searchPlaceholder: 'Search resources, tools, collections...',
      focusLabel: 'Focus',
      featureCardBadge: 'latest additions',
      featureCardTitle: 'New resources shape the collections as they arrive.',
      featureCardDescription: 'Recently added links and tools keep the library fresh without changing the browsing experience.',
    },
    intro: {
      badge: 'How it works',
      title: 'A calmer way to discover useful resources, tools, and references.',
      paragraphs: [
        'Instead of scattered bookmarks and disorganized link dumps, the library keeps curated resources grouped into browsable collections that stay useful over time.',
        'Each resource is reviewed, described, and filed into the right collection so you can find it when you need it — not just when you first discover it.',
        'Whether you are looking for a specific tool, exploring a topic, or building your own reference shelf, the library makes discovery feel calm and purposeful.',
      ],
      sideBadge: 'Why it works',
      sidePoints: [
        'Resources organized into clear, browsable collections by topic.',
        'Every link is described and verified before it enters the library.',
        'Collections grow steadily without cluttering the browsing experience.',
        'A calm rhythm designed for discovery, not distraction.',
      ],
      primaryLink: { label: 'Browse resources', href: '/sbm' },
      secondaryLink: { label: 'About the library', href: '/about' },
    },
    cta: {
      badge: 'Contribute',
      title: 'Know a resource worth saving? Add it to the library.',
      description: 'Submit tools, references, and links that deserve a place in the collection — curated by the community, useful for everyone.',
      primaryCta: { label: 'Submit a resource', href: '/create' },
      secondaryCta: { label: 'Get in touch', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest additions to this collection.',
    },
  },
  about: {
    badge: 'About',
    title: 'A calm, organized space for useful resources.',
    description: `${slot4BrandConfig.siteName} is built to make discovering tools, references, and curated links feel organized and purposeful — not overwhelming.`,
    paragraphs: [
      'The web is full of great resources scattered across bookmarks, threads, newsletters, and forgotten tabs. This library brings them together into browsable collections that stay useful.',
      'Every resource is described, categorized, and maintained so the collection grows without becoming cluttered. The goal is not volume — it is usefulness.',
    ],
    values: [
      {
        title: 'Calm discovery',
        description: 'We prioritize clarity and organization so finding the right resource feels effortless, not exhausting.',
      },
      {
        title: 'Curated quality',
        description: 'Every resource is reviewed and described before it enters a collection — no link dumps, no clutter.',
      },
      {
        title: 'Built to last',
        description: 'Collections are maintained over time so resources stay relevant and useful long after they are added.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Have a question, suggestion, or resource to share? Reach out.',
    description: 'Whether you want to submit a resource, report an issue, or suggest a new collection — we will make sure it gets to the right place.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search curated resources, tools, collections, and links across the library.',
    },
    hero: {
      badge: 'Search the library',
      title: 'Find resources, tools, and collections faster.',
      description: 'Use keywords, categories, and collection types to discover resources from every corner of the library.',
      placeholder: 'Search by keyword, topic, or collection',
    },
    resultsTitle: 'Latest resources',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a new resource to the library.',
    },
    locked: {
      badge: 'Curator access',
      title: 'Sign in to submit resources.',
      description: 'Use your account to submit tools, links, and references to the library collections.',
    },
    hero: {
      badge: 'Submit a resource',
      title: 'Add to the library.',
      description: 'Choose the collection, add details, and submit a resource with a description, link, and category.',
    },
    formTitle: 'Resource details',
    submitLabel: 'Submit resource',
    successTitle: 'Resource submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to your account.',
      badge: 'Welcome back',
      title: 'Sign in to your library account.',
      description: 'Access your submissions, manage saved resources, and continue curating your collections.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first.',
      success: 'Signed in. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create a library account.',
      badge: 'Join the library',
      title: 'Create your account and start curating.',
      description: 'Sign up to submit resources, save collections, and become a contributor to the library.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting...',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'More from this curator',
      fallbackDescription: 'Curator details will appear here once available.',
      visitButton: 'Visit website',
    },
  },
} as const
