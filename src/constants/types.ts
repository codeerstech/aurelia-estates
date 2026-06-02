export type ThemeTokens = {
  colors: {
    background: string
    surface: string
    surfaceSoft: string
    text: string
    muted: string
    heading: string
    line: string
    accent: string
    accentDark: string
    accentSoft: string
    dark: string
    darkSoft: string
    gold: string
  }
  radii: {
    card: string
    control: string
    pill: string
  }
  shadows: {
    card: string
    lift: string
  }
  layout: {
    container: string
  }
}

export type Cta = {
  label: string
  href: string
}

export type NavItem = {
  label: string
  href: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export type HeroSection = {
  eyebrow: string
  title: string
  subtitle: string
  primaryCta: Cta
  secondaryCta: Cta
  imageUrl: string
  highlights: string[]
}

export type StatCard = {
  value: string
  label: string
  caption?: string
  icon?: string
}

export type PropertyCard = {
  title: string
  location: string
  price: string
  summary: string
  beds: string
  baths: string
  size: string
  badge?: string
  imageUrl: string
  ctaLabel: string
}

export type CardSection<T> = {
  eyebrow?: string
  title: string
  description?: string
  items: T[]
}

export type PropertyTypeCard = {
  title: string
  price: string
  description: string
  imageUrl: string
}

export type OfficeCard = {
  title: string
  description: string
  imageUrl: string
}

export type LeadFormField = {
  name: 'name' | 'email' | 'phone' | 'interest' | 'message'
  label: string
  placeholder: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  requiredMessage: string
  options?: string[]
}

export type LeadFormConfig = {
  title: string
  description: string
  submitLabel: string
  successMessage: string
  fields: LeadFormField[]
}

export type VirtualTourHotspot = {
  id: string
  label: string
  description: string
  x: string
  y: string
  targetId?: string
}

export type VirtualTourLiveView = {
  label: string
  imageUrl: string
  tone: 'day' | 'evening'
}

export type VirtualTourNode = {
  id: string
  name: string
  caption: string
  description: string
  thumbnailUrl: string
  liveViews: VirtualTourLiveView[]
  details: string[]
  hotspots: VirtualTourHotspot[]
}

export type VirtualTourConfig = {
  eyebrow: string
  title: string
  description: string
  mediaFeatures: string[]
  nodes: VirtualTourNode[]
}

export type TemplatePage = {
  meta: {
    title: string
    description: string
    sourceUrl: string
  }
  hero: HeroSection
  stats: StatCard[]
  propertyTypes: CardSection<PropertyTypeCard>
  why: {
    eyebrow: string
    title: string
    description: string
    imageUrl: string
    stats: StatCard[]
  }
  properties: CardSection<PropertyCard>
  virtualTour: VirtualTourConfig
  payment: {
    eyebrow: string
    title: string
    description: string
    imageUrl: string
    accepted: string[]
  }
  offices: CardSection<OfficeCard>
  leadForm: LeadFormConfig
}
