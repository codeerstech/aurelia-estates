import type { NavGroup } from './types'

export const site = {
  brand: {
    name: 'Aurelia Estates',
    shortName: 'Aurelia',
    suffix: 'Estates',
  },
  announcement: 'Private viewings and buyer consultations for US, UK, and international clients',
  footer: '© 2026 Aurelia Estates. Residential advisory, viewings, and buyer introductions.',
}

export const navGroups: NavGroup[] = [
  {
    label: 'Properties',
    items: [
      { label: 'Buying Goals', href: '#property-types' },
      { label: 'Featured Homes', href: '#properties' },
      { label: 'Virtual Tour', href: '#virtual-tour' },
    ],
  },
  {
    label: 'Advisory',
    items: [
      { label: 'Buyer Journey', href: '#process' },
      { label: 'Consultation', href: '#callback' },
      { label: 'Advisory Desks', href: '#offices' },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Results', href: '#stats' },
      { label: 'Enquire Now', href: '#callback' },
    ],
  },
]
