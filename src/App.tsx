import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  ChartNoAxesColumn,
  CheckCircle2,
  CircleDot,
  Gem,
  Home,
  Image as ImageIcon,
  KeyRound,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Telescope,
  WalletCards,
  X,
} from 'lucide-react'
import { page } from './constants/pages'
import { navGroups, site } from './constants/site'
import { themeStyle } from './constants/theme'
import type { LeadFormConfig, LeadFormField, OfficeCard, PropertyCard, PropertyTypeCard, StatCard, VirtualTourConfig } from './constants/types'
import { LEAD_ERROR_MESSAGE, LEAD_SUCCESS_MESSAGE, submitLead } from './lib/leadApi'

type LeadValues = Record<LeadFormField['name'], string>
type LeadErrors = Partial<Record<LeadFormField['name'], string>>
type RoutePath = '/' | '/about-us' | '/privacy-policy'

type StaticPageContent = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
  }>
}

const routePaths = new Set<RoutePath>(['/', '/about-us', '/privacy-policy'])

const staticPages: Record<Exclude<RoutePath, '/'>, StaticPageContent> = {
  '/about-us': {
    metaTitle: `About Us | ${site.brand.name}`,
    metaDescription: `${site.brand.name} private residential advisory story, buyer standards, and viewing support.`,
    eyebrow: 'About us',
    title: `Meet ${site.brand.name}`,
    description:
      'Aurelia Estates helps serious buyers compare refined residences, understand trade-offs, and move from first brief to private viewing with confidence.',
    sections: [
      {
        title: 'What we do',
        body: 'We support US, UK, relocation, investment, and second-home buyers with curated shortlists, viewing planning, and next-step advisory.',
      },
      {
        title: 'How we support buyers',
        body: 'Our process is built around clear briefs, discreet seller contact, practical due-diligence prompts, and calm communication through each stage.',
      },
      {
        title: 'Our standard',
        body: 'Every enquiry is handled with context: budget, timing, lifestyle needs, legal introductions, survey considerations, and relocation requirements.',
      },
    ],
  },
  '/privacy-policy': {
    metaTitle: `Privacy Policy | ${site.brand.name}`,
    metaDescription: `${site.brand.name} privacy policy for property enquiries, viewing requests, and residential advisory communications.`,
    eyebrow: 'Privacy policy',
    title: 'Privacy Policy',
    description:
      'This page explains how enquiry details and website information are handled for property consultations and viewing requests.',
    sections: [
      {
        title: 'Information we collect',
        body: 'We collect details visitors choose to submit through enquiry forms, such as name, email, phone, buying interest, preferred market, and message context.',
      },
      {
        title: 'How we use information',
        body: 'Submitted information is used to respond to property requests, prepare relevant follow-up, and coordinate private viewing conversations.',
      },
      {
        title: 'Customer choices',
        body: 'Visitors can choose not to submit optional forms and can request support with submitted enquiry details or communication preferences.',
      },
    ],
  },
}

const iconMap = {
  award: Award,
  building: Building2,
  calendar: CalendarDays,
  chart: ChartNoAxesColumn,
  gem: Gem,
  home: Home,
  key: KeyRound,
  shield: ShieldCheck,
  sparkles: Sparkles,
  wallet: WalletCards,
}

function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  }
}

function initialValues(config: LeadFormConfig): LeadValues {
  return config.fields.reduce(
    (values, field) => ({
      ...values,
      [field.name]: '',
    }),
    { name: '', email: '', phone: '', interest: '', message: '' } as LeadValues,
  )
}

function projectKey() {
  return site.brand.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function getRoutePath(): RoutePath {
  const path = window.location.pathname as RoutePath
  return routePaths.has(path) ? path : '/'
}

function localHref(href: string) {
  return href.startsWith('#') ? `/${href}` : href
}

function ImageFrame({
  imageUrl,
  title,
  className = '',
  dark = false,
}: {
  imageUrl: string
  title: string
  className?: string
  dark?: boolean
}) {
  if (imageUrl) {
    return <img className={`h-full w-full object-cover ${className}`} src={imageUrl} alt={title} loading="lazy" />
  }

  return (
    <div
      className={`relative flex h-full min-h-48 w-full overflow-hidden bg-[linear-gradient(135deg,var(--color-accent-soft),var(--color-surface))] p-6 text-center ${
        dark ? 'bg-[linear-gradient(135deg,var(--color-dark-soft),var(--color-accent-dark))] text-white' : 'text-[var(--color-accent-dark)]'
      } ${className}`}
      role="img"
      aria-label={`${title} image placeholder`}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(31,26,22,0.16))]" />
      <div className="absolute left-[14%] top-[24%] h-[42%] w-[58%] rounded-t-[var(--radius-card)] border border-current/20 bg-white/22 backdrop-blur-sm" />
      <div className="absolute bottom-[18%] right-[14%] h-[36%] w-[34%] rounded-t-[var(--radius-card)] border border-current/20 bg-white/18 backdrop-blur-sm" />
      <div className="absolute bottom-[18%] left-[22%] h-[24%] w-[12%] border border-current/20 bg-[var(--color-dark)]/20" />
      <div className="relative z-10 mt-auto">
        <Building2 className="mb-3" size={34} aria-hidden="true" />
        <span className="block text-left text-sm font-black uppercase tracking-[0.18em]">{title}</span>
      </div>
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
  light = false,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description?: string
  light?: boolean
  align?: 'center' | 'left'
}) {
  const alignment = align === 'left' ? 'mx-0 text-left' : 'mx-auto text-center'

  return (
    <div className={`${alignment} mb-10 max-w-3xl`}>
      {eyebrow ? (
        <p className={`mb-3 text-xs font-black uppercase tracking-[0.24em] ${light ? 'text-[var(--color-gold)]' : 'text-[var(--color-accent-dark)]'}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-black leading-tight md:text-5xl ${light ? 'text-white' : 'text-[var(--color-heading)]'}`}>{title}</h2>
      {description ? <p className={`mt-4 text-base md:text-lg ${light ? 'text-white/72' : 'text-[var(--color-muted)]'}`}>{description}</p> : null}
    </div>
  )
}

function Header({ onOpenModal }: { onOpenModal: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="bg-[var(--color-dark)] px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-white">
        {site.announcement}
      </div>
      <div className="mx-auto flex h-20 w-[min(var(--container),calc(100%-32px))] items-center justify-between gap-5">
        <a className="flex min-w-max items-center gap-3" href="/" aria-label={`${site.brand.name} home`}>
          <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-card)] bg-[var(--color-dark)] text-[var(--color-gold)]">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <span>
            <strong className="block text-lg font-black leading-none text-[var(--color-heading)]">{site.brand.shortName}</strong>
            <small className="mt-1 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">{site.brand.suffix}</small>
          </span>
        </a>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div className="group relative" key={group.label}>
              <button className="rounded-[var(--radius-control)] px-4 py-3 text-sm font-black text-[var(--color-heading)] hover:bg-[var(--color-surface-soft)]" type="button">
                {group.label}
              </button>
              <div className="pointer-events-none absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3 opacity-0 shadow-[var(--shadow-card)] transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                {group.items.map((item) => (
                  <a className="block rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent-dark)]" href={localHref(item.href)} key={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-3 text-sm font-black uppercase text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-dark)]" type="button" onClick={onOpenModal}>
            Enquire Now
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] lg:hidden" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] p-4 lg:hidden">
          {navGroups.flatMap((group) => group.items).map((item) => (
            <a className="block rounded-[var(--radius-control)] px-3 py-3 font-bold text-[var(--color-heading)]" href={localHref(item.href)} key={item.href} onClick={() => setMobileOpen(false)}>
              {item.label}
            </a>
          ))}
          <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-3 text-sm font-black uppercase text-white" type="button" onClick={onOpenModal}>
            Enquire Now
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </header>
  )
}

function StatGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div id="stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap] ?? Sparkles
        return (
          <motion.article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]" key={`${stat.value}-${stat.label}`} {...reveal(0.04)}>
            <span className="mb-5 grid h-11 w-11 place-items-center rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] text-[var(--color-accent-dark)]">
              <Icon size={22} aria-hidden="true" />
            </span>
            <strong className="block text-3xl font-black text-[var(--color-heading)]">{stat.value}</strong>
            <span className="mt-2 block text-sm font-bold text-[var(--color-muted)]">{stat.label}</span>
            {stat.caption ? <small className="mt-2 block text-xs text-[var(--color-muted)]">{stat.caption}</small> : null}
          </motion.article>
        )
      })}
    </div>
  )
}

function PropertyTypeCardView({ item }: { item: PropertyTypeCard }) {
  return (
    <motion.article className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]" {...reveal(0.06)}>
      <div className="aspect-[4/3] overflow-hidden">
        <ImageFrame imageUrl={item.imageUrl} title={item.title} />
      </div>
      <div className="p-5">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">{item.price}</p>
        <h3 className="text-xl font-black text-[var(--color-heading)]">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
      </div>
    </motion.article>
  )
}

function PropertyCardView({ item, onOpenModal }: { item: PropertyCard; onOpenModal: () => void }) {
  return (
    <motion.article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]" {...reveal(0.08)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageFrame imageUrl={item.imageUrl} title={item.title} />
        {item.badge ? <span className="absolute left-4 top-4 rounded-[var(--radius-pill)] bg-[var(--color-dark)] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">{item.badge}</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-black text-[var(--color-heading)]">{item.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--color-muted)]">
          <MapPin size={15} aria-hidden="true" />
          {item.location}
        </p>
        <p className="mt-4 text-lg font-black text-[var(--color-accent-dark)]">{item.price}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-black text-[var(--color-heading)]">
          <span className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-surface-soft)] px-2.5 py-2">
            <BedDouble size={15} aria-hidden="true" />
            {item.beds}
          </span>
          <span className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-surface-soft)] px-2.5 py-2">
            <Bath size={15} aria-hidden="true" />
            {item.baths}
          </span>
          <span className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-surface-soft)] px-2.5 py-2">
            <Maximize2 size={15} aria-hidden="true" />
            {item.size}
          </span>
        </div>
        <div className="mt-auto pt-5">
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] px-4 py-3 text-sm font-black uppercase text-[var(--color-accent-dark)] transition hover:bg-[var(--color-accent)] hover:text-white" type="button" onClick={onOpenModal}>
            {item.ctaLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function OfficeCardView({ item }: { item: OfficeCard }) {
  return (
    <motion.article className="overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/8 transition hover:-translate-y-1 hover:bg-white/12" {...reveal(0.06)}>
      <div className="aspect-[16/10]">
        <ImageFrame imageUrl={item.imageUrl} title={item.title} dark />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-black text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
      </div>
    </motion.article>
  )
}

function VirtualPropertyTour({ config, onOpenModal }: { config: VirtualTourConfig; onOpenModal: () => void }) {
  const availableNodes = useMemo(() => config.nodes.filter((node) => node.liveViews.length > 0), [config.nodes])
  const [activeNodeId, setActiveNodeId] = useState(availableNodes[0]?.id ?? '')
  const [activeViewIndex, setActiveViewIndex] = useState(0)
  const [activeHotspotId, setActiveHotspotId] = useState('')
  const activeNode = availableNodes.find((node) => node.id === activeNodeId) ?? availableNodes[0]
  const activeView = activeNode?.liveViews[activeViewIndex] ?? activeNode?.liveViews[0]
  const activeHotspot = activeNode?.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? activeNode?.hotspots[0]

  function activateNode(nodeId: string) {
    setActiveNodeId(nodeId)
    setActiveViewIndex(0)
    setActiveHotspotId('')
  }

  if (!activeNode || !activeView) {
    return (
      <section id="virtual-tour" className="scroll-mt-32 bg-[var(--color-surface-soft)] py-20">
        <div className="mx-auto w-[min(var(--container),calc(100%-32px))]">
          <SectionIntro eyebrow={config.eyebrow} title={config.title} description={config.description} />
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-muted)]">
            Add room images in the virtual tour constants to render the live property tour.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="virtual-tour" className="scroll-mt-32 bg-[var(--color-surface-soft)] py-20">
      <div className="mx-auto w-[min(var(--container),calc(100%-32px))]">
        <SectionIntro eyebrow={config.eyebrow} title={config.title} description={config.description} />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <motion.div className="self-start overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-dark)] shadow-[var(--shadow-lift)]" data-live-tour {...reveal()}>
            <div className="relative h-[680px] overflow-hidden sm:h-[620px] md:h-[640px]">
              <motion.img
                key={`${activeNode.id}-${activeView.label}`}
                src={activeView.imageUrl}
                alt={`${activeNode.name} ${activeView.label}`}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,14,0.1),rgba(23,18,14,0.72))]" />

              <div className="absolute left-4 right-4 top-4 z-20 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <div className="rounded-[var(--radius-card)] border border-white/20 bg-black/45 px-4 py-3 text-white backdrop-blur">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-gold)]">
                    <Camera size={15} aria-hidden="true" />
                    Live view
                  </p>
                  <h3 className="mt-1 text-2xl font-black">{activeNode.name}</h3>
                </div>
                <div className="flex max-w-full overflow-x-auto rounded-[var(--radius-pill)] border border-white/20 bg-black/40 p-1 backdrop-blur">
                  {activeNode.liveViews.map((view, index) => {
                    const Icon = view.tone === 'day' ? Sun : Moon
                    return (
                      <button
                        className={`inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition ${
                          index === activeViewIndex ? 'bg-white text-[var(--color-heading)]' : 'text-white hover:bg-white/10'
                        }`}
                        type="button"
                        key={view.label}
                        onClick={() => setActiveViewIndex(index)}
                        aria-pressed={index === activeViewIndex}
                        aria-label={view.label}
                      >
                        <Icon size={14} aria-hidden="true" />
                        <span className="sm:hidden">{view.tone === 'day' ? 'Day' : 'Evening'}</span>
                        <span className="hidden sm:inline">{view.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {activeNode.hotspots.map((hotspot) => (
                <button
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: hotspot.x, top: hotspot.y }}
                  type="button"
                  key={hotspot.id}
                  onClick={() => setActiveHotspotId(hotspot.id)}
                  aria-label={hotspot.label}
                >
                  <span className={`grid h-11 w-11 place-items-center rounded-full border border-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition ${hotspot.id === activeHotspot?.id ? 'bg-[var(--color-accent)] text-white' : 'bg-white/92 text-[var(--color-accent-dark)] group-hover:bg-[var(--color-accent)] group-hover:text-white'}`}>
                    <CircleDot size={20} aria-hidden="true" />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] hidden w-44 -translate-x-1/2 rounded-[var(--radius-control)] bg-black/75 px-3 py-2 text-xs font-black text-white backdrop-blur md:group-hover:block">
                    {hotspot.label}
                  </span>
                </button>
              ))}

              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="mb-4 max-w-xl rounded-[var(--radius-card)] border border-white/15 bg-black/45 p-4 text-white backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-gold)]">{activeNode.caption}</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{activeNode.description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {availableNodes.map((node) => (
                    <button
                      className={`grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 rounded-[var(--radius-card)] border p-2 text-left transition ${
                        node.id === activeNode.id ? 'border-[var(--color-gold)] bg-white text-[var(--color-heading)]' : 'border-white/15 bg-black/35 text-white hover:bg-black/50'
                      }`}
                      type="button"
                      key={node.id}
                      data-room-id={node.id}
                      onClick={() => activateNode(node.id)}
                      aria-pressed={node.id === activeNode.id}
                    >
                      <img className="h-14 w-20 rounded-[var(--radius-control)] object-cover" src={node.thumbnailUrl} alt="" loading="lazy" />
                      <span>
                        <span className="block text-sm font-black">{node.name}</span>
                        <span className={`mt-1 block text-xs ${node.id === activeNode.id ? 'text-[var(--color-muted)]' : 'text-white/65'}`}>
                          {node.details[0]}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] text-[var(--color-accent-dark)]">
                <Telescope size={22} aria-hidden="true" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">Dynamic sticker</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--color-heading)]">{activeHotspot?.label ?? activeNode.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{activeHotspot?.description ?? activeNode.description}</p>
              {activeHotspot?.targetId ? (
                <button className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white" type="button" onClick={() => activateNode(activeHotspot.targetId!)}>
                  Move to room
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-heading)]">
                <ImageIcon size={16} aria-hidden="true" />
                Room notes
              </p>
              <div className="grid gap-2">
                {activeNode.details.map((detail) => (
                  <span className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm font-bold text-[var(--color-muted)]" key={detail}>
                    <CheckCircle2 className="shrink-0 text-[var(--color-accent-dark)]" size={15} aria-hidden="true" />
                    {detail}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)] shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-heading)]">Tour features</p>
              <ul className="space-y-2">
                {config.mediaFeatures.map((item) => (
                  <li className="flex gap-2 leading-6" key={item}>
                    <CheckCircle2 className="mt-1 shrink-0 text-[var(--color-accent-dark)]" size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-accent-dark)] transition hover:bg-[var(--color-accent)] hover:text-white" type="button" onClick={onOpenModal}>
                Book guided tour
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function LeadForm({ config, compact = false, formId = 'callback' }: { config: LeadFormConfig; compact?: boolean; formId?: string }) {
  const [values, setValues] = useState<LeadValues>(() => initialValues(config))
  const [errors, setErrors] = useState<LeadErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const controlClass = `w-full rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-4 ${
    compact ? 'py-2.5' : 'py-3'
  } text-[var(--color-heading)] outline-none focus:border-[var(--color-accent)]`

  function validate() {
    const nextErrors: LeadErrors = {}
    for (const field of config.fields) {
      const value = values[field.name].trim()
      if (!value) nextErrors[field.name] = field.requiredMessage
      if (field.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) nextErrors[field.name] = field.requiredMessage
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function updateField(name: LeadFormField['name'], value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (status !== 'loading') {
      setStatus('idle')
      setMessage('')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    setStatus('loading')
    setMessage('')

    try {
      await submitLead({
        niche: 'real-estate',
        project: site.brand.name,
        projectKey: projectKey(),
        formId,
        pagePath: window.location.pathname,
        pageUrl: window.location.href,
        referrer: document.referrer,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        interest: values.interest.trim(),
        message: values.message.trim(),
        fields: values,
        metadata: {
          brand: site.brand.name,
          formTitle: config.title,
        },
      })
      setSubmitted(true)
      setStatus('success')
      setMessage(LEAD_SUCCESS_MESSAGE)
    } catch {
      setStatus('error')
      setMessage(LEAD_ERROR_MESSAGE)
    }
  }

  return (
    <form id={formId} className={`scroll-mt-28 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lift)] ${compact ? '' : 'md:p-7'}`} onSubmit={handleSubmit} noValidate>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[var(--color-heading)]">{submitted ? 'Request captured' : config.title}</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{submitted ? config.successMessage : config.description}</p>
      </div>

      <div className={compact ? 'grid gap-x-4 sm:grid-cols-2' : ''}>
        {config.fields.map((field) => (
          <label className={`mb-4 block ${compact && field.type === 'textarea' ? 'sm:col-span-2' : ''}`} key={field.name}>
            <span className="mb-1 block text-sm font-black text-[var(--color-heading)]">{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea className={`${compact ? 'min-h-20' : 'min-h-28'} ${controlClass}`} name={field.name} placeholder={field.placeholder} value={values[field.name]} onChange={(event) => updateField(field.name, event.target.value)} />
            ) : field.type === 'select' ? (
              <select className={controlClass} name={field.name} value={values[field.name]} onChange={(event) => updateField(field.name, event.target.value)}>
                <option value="">{field.placeholder}</option>
                {field.options?.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input className={controlClass} name={field.name} placeholder={field.placeholder} type={field.type} value={values[field.name]} onChange={(event) => updateField(field.name, event.target.value)} />
            )}
            {errors[field.name] ? <span className="mt-1 block text-sm font-bold text-red-700">{errors[field.name]}</span> : null}
          </label>
        ))}
      </div>

      <button className="w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Saving...' : config.submitLabel}
      </button>
      {message ? (
        <p className={`mt-4 rounded-[var(--radius-control)] px-4 py-3 text-sm font-black ${status === 'success' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-dark)]' : 'bg-red-50 text-red-700'}`} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  )
}

function CookieNotice() {
  const [visible, setVisible] = useState(() => window.localStorage.getItem('cookie-notice-accepted') !== 'true')

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lift)]">
      <h2 className="text-base font-black text-[var(--color-heading)]">Cookies help us improve your visit</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        We use cookies to keep the website running smoothly, understand usage, and improve the property enquiry experience.
      </p>
      <button
        className="mt-4 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-3 text-sm font-black uppercase text-white"
        type="button"
        onClick={() => {
          window.localStorage.setItem('cookie-notice-accepted', 'true')
          setVisible(false)
        }}
      >
        Got it
      </button>
    </div>
  )
}

function Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={page.leadForm.title}>
      <div className="max-h-[calc(100dvh-32px)] w-full max-w-xl overflow-auto rounded-[var(--radius-card)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] p-4">
          <strong className="text-lg font-black text-[var(--color-heading)]">Enquire now</strong>
          <button className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)]" type="button" onClick={onClose} aria-label="Close enquiry form">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <LeadForm config={page.leadForm} compact formId="modal-enquiry" />
        </div>
      </div>
    </div>
  )
}

function StaticPage({ content }: { content: StaticPageContent }) {
  return (
    <section className="bg-[var(--color-background)]">
      <div className="mx-auto grid w-[min(var(--container),calc(100%-32px))] gap-10 py-16 lg:grid-cols-[0.78fr_1.22fr]">
        <motion.div className="lg:sticky lg:top-32 lg:h-fit" {...reveal(0)}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-accent-dark)]">{content.eyebrow}</p>
          <h1 className="text-5xl font-black uppercase leading-tight text-[var(--color-heading)] md:text-7xl">{content.title}</h1>
          <p className="mt-5 text-lg leading-8 text-[var(--color-muted)]">{content.description}</p>
          <a className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-4 text-sm font-black uppercase text-white" href="/#callback">
            Enquire Now
          </a>
        </motion.div>
        <div className="grid gap-5">
          {content.sections.map((section, index) => (
            <motion.article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]" key={section.title} {...reveal(index * 0.05)}>
              <h2 className="text-2xl font-black text-[var(--color-heading)]">{section.title}</h2>
              <p className="mt-3 leading-7 text-[var(--color-muted)]">{section.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [route, setRoute] = useState<RoutePath>(() => getRoutePath())
  const [modalOpen, setModalOpen] = useState(false)
  const cssVars = useMemo(() => themeStyle(), [])

  useEffect(() => {
    const staticContent = route !== '/' ? staticPages[route] : null
    document.title = staticContent?.metaTitle ?? page.meta.title
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }
    description.content = staticContent?.metaDescription ?? page.meta.description
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [route])

  useEffect(() => {
    const handlePopState = () => setRoute(getRoutePath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div id="top" style={cssVars} className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <Header onOpenModal={() => setModalOpen(true)} />

      <main>
        {route !== '/' ? (
          <StaticPage content={staticPages[route]} />
        ) : (
          <>
        <section className="relative bg-[var(--color-dark)] text-white">
          <div className="absolute inset-0 opacity-55">
            {page.hero.imageUrl ? (
              <ImageFrame imageUrl={page.hero.imageUrl} title={page.hero.title} dark />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(193,139,65,0.42),transparent_34%),linear-gradient(135deg,var(--color-dark),var(--color-dark-soft))]" />
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,18,14,0.9),rgba(23,18,14,0.62)_44%,rgba(23,18,14,0.18))]" />
          <div className="relative mx-auto grid min-h-[calc(100svh-176px)] w-[min(var(--container),calc(100%-32px))] items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-black uppercase tracking-[0.24em] text-[var(--color-gold)]">{page.hero.eyebrow}</p>
              <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">{page.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-white/78 md:text-xl">{page.hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-dark)]" href={localHref(page.hero.primaryCta.href)}>
                  {page.hero.primaryCta.label}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/35 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-white/10" href={localHref(page.hero.secondaryCta.href)}>
                  {page.hero.secondaryCta.label}
                </a>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {page.hero.highlights.map((highlight) => (
                  <span className="rounded-[var(--radius-card)] border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/88" key={highlight}>
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <LeadForm config={page.leadForm} compact formId="hero-enquiry" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(var(--container),calc(100%-32px))] py-16">
          <StatGrid stats={page.stats} />
        </section>

        <section id="property-types" className="mx-auto w-[min(var(--container),calc(100%-32px))] scroll-mt-32 py-16">
          <SectionIntro eyebrow={page.propertyTypes.eyebrow} title={page.propertyTypes.title} description={page.propertyTypes.description} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {page.propertyTypes.items.map((item) => (
              <PropertyTypeCardView item={item} key={item.title} />
            ))}
          </div>
        </section>

        <section id="about" className="scroll-mt-32 bg-[var(--color-surface-soft)] py-20">
          <div className="mx-auto grid w-[min(var(--container),calc(100%-32px))] items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
            <motion.div {...reveal()}>
              <SectionIntro eyebrow={page.why.eyebrow} title={page.why.title} description={page.why.description} align="left" />
              <div className="mb-8 grid gap-3 text-sm font-bold text-[var(--color-heading)] sm:grid-cols-3">
                {['Brief-led search', 'Private viewings', 'Clear next steps'].map((item) => (
                  <span className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-card)]" key={item}>
                    <CheckCircle2 size={17} className="text-[var(--color-accent-dark)]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {page.why.stats.map((stat) => (
                  <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5" key={`${stat.value}-${stat.label}`}>
                    <strong className="block text-3xl font-black text-[var(--color-heading)]">{stat.value}</strong>
                    <span className="mt-1 block text-sm font-bold text-[var(--color-muted)]">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] shadow-[var(--shadow-lift)]" {...reveal(0.08)}>
              <ImageFrame imageUrl={page.why.imageUrl} title={page.why.title} />
            </motion.div>
          </div>
        </section>

        <section id="properties" className="mx-auto w-[min(var(--container),calc(100%-32px))] scroll-mt-32 py-20">
          <SectionIntro eyebrow={page.properties.eyebrow} title={page.properties.title} description={page.properties.description} />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {page.properties.items.map((item) => (
              <PropertyCardView item={item} key={item.title} onOpenModal={() => setModalOpen(true)} />
            ))}
          </div>
        </section>

        <VirtualPropertyTour config={page.virtualTour} onOpenModal={() => setModalOpen(true)} />

        <section id="process" className="scroll-mt-32 bg-[var(--color-dark)] py-20 text-white">
          <div className="mx-auto grid w-[min(var(--container),calc(100%-32px))] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div {...reveal()}>
              <SectionIntro eyebrow={page.payment.eyebrow} title={page.payment.title} description={page.payment.description} light align="left" />
              <div className="grid gap-3">
                {page.payment.accepted.map((item, index) => (
                  <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-4" key={item}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-card)] bg-white text-[var(--color-accent-dark)]">
                      {index + 1}
                    </span>
                    <span className="font-black">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-gold)]">Advisor handoff</p>
                <div className="mt-4 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
                  <span>Viewing window: Confirmed with client</span>
                  <span>Documents: Shared before offer</span>
                  <span>Specialists: Lender and legal introductions</span>
                </div>
              </div>
            </motion.div>
            <motion.div className="overflow-hidden rounded-[var(--radius-card)] border border-white/15 shadow-[var(--shadow-lift)]" {...reveal(0.08)}>
              <ImageFrame imageUrl={page.payment.imageUrl} title={page.payment.title} dark />
            </motion.div>
          </div>
        </section>

        <section id="offices" className="scroll-mt-32 bg-[var(--color-dark-soft)] py-20">
          <div className="mx-auto w-[min(var(--container),calc(100%-32px))]">
            <SectionIntro eyebrow={page.offices.eyebrow} title={page.offices.title} description={page.offices.description} light />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {page.offices.items.map((item) => (
                <OfficeCardView item={item} key={item.title} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-[min(var(--container),calc(100%-32px))] items-center gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div {...reveal()}>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-accent-dark)]">Private enquiry</p>
            <h2 className="text-4xl font-black leading-tight text-[var(--color-heading)]">Tell us what would make a property worth viewing.</h2>
            <div className="mt-8 space-y-4 text-[var(--color-muted)]">
              <p className="flex items-center gap-3">
                <MessageCircle size={18} aria-hidden="true" />
                Share the market, budget range, bedrooms, and timing that matter most.
              </p>
              <p className="flex items-center gap-3">
                <Mail size={18} aria-hidden="true" />
                An advisor will follow up with relevant homes and sensible next steps.
              </p>
            </div>
          </motion.div>
          <motion.div {...reveal(0.08)}>
            <LeadForm config={page.leadForm} formId="callback" />
          </motion.div>
        </section>
          </>
        )}
      </main>

      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-[min(var(--container),calc(100%-32px))] flex-col gap-4 py-8 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
          <span>{site.footer}</span>
          <div className="flex flex-wrap gap-4">
            <a className="font-bold text-[var(--color-heading)]" href="/about-us">About Us</a>
            <a className="font-bold text-[var(--color-heading)]" href="/privacy-policy">Privacy Policy</a>
            <span>{site.brand.name}</span>
          </div>
        </div>
      </footer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} />
      <CookieNotice />
    </div>
  )
}
