import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173'
const viewports = [
  { width: 1440, height: 1000, name: 'desktop' },
  { width: 390, height: 900, name: 'mobile' },
]

const failures = []
const browser = await chromium.launch({ headless: true })

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport })
  await page.addInitScript(() => window.localStorage.clear())
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => ({
    bodyLength: document.body.innerText.length,
    clientWidth: document.documentElement.clientWidth,
    h1: document.querySelector('h1')?.textContent ?? '',
    scrollWidth: document.documentElement.scrollWidth,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  }))

  if (!response?.ok()) failures.push(`${viewport.name}: HTTP ${response?.status()}`)
  if (consoleErrors.length > 0) failures.push(`${viewport.name}: ${consoleErrors.join(' | ')}`)
  if (metrics.scrollWidth > metrics.clientWidth + 2) {
    failures.push(`${viewport.name}: horizontal overflow ${metrics.scrollWidth}/${metrics.clientWidth}`)
  }
  if (!metrics.h1 || metrics.bodyLength < 500) failures.push(`${viewport.name}: sparse render`)
  if (!metrics.title || !metrics.description) failures.push(`${viewport.name}: missing route metadata`)

  if (viewport.name === 'mobile') {
    await page.getByLabel('Open navigation').click()
    const mobileLinkVisible = await page.locator('a[href="#properties"]', { hasText: 'Featured Homes' }).last().isVisible()
    if (!mobileLinkVisible) failures.push('mobile nav: featured homes link not visible after menu open')
    const tourLinkVisible = await page.locator('a[href="#virtual-tour"]', { hasText: 'Virtual Tour' }).last().isVisible()
    if (!tourLinkVisible) failures.push('mobile nav: virtual tour link not visible after menu open')
  }

  const cookieVisible = await page.getByText('Cookies help us improve your visit').isVisible()
  if (!cookieVisible) failures.push(`${viewport.name}: cookie notice did not appear`)
  await page.getByRole('button', { name: 'Got it' }).click()
  const cookieHidden = await page.getByText('Cookies help us improve your visit').isHidden()
  if (!cookieHidden) failures.push(`${viewport.name}: cookie notice did not dismiss`)

  await page.close()
}

const formPage = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
let leadPayload = null
await formPage.route('**/api/lead', async (route) => {
  leadPayload = route.request().postDataJSON()
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, status: 'saved', data: { id: 'qa-lead' } }),
  })
})
await formPage.goto(`${baseUrl}#callback`, { waitUntil: 'networkidle' })
await formPage.locator('#callback button[type="submit"]').first().click()
const validationVisible = await formPage.getByText('Name is required.').first().isVisible()
if (!validationVisible) failures.push('lead form: required validation did not appear')
await formPage.locator('#callback input[name="name"]').fill('Ava Buyer')
await formPage.locator('#callback input[name="email"]').fill('ava@example.com')
await formPage.locator('#callback input[name="phone"]').fill('+1 917 555 0100')
await formPage.locator('#callback select[name="interest"]').selectOption({ index: 1 })
await formPage.locator('#callback textarea[name="message"]').fill('Interested in a private viewing for a London home.')
await formPage.locator('#callback button[type="submit"]').first().click()
try {
  await formPage.getByText('Details saved. We will reach you shortly.').first().waitFor({ timeout: 5000 })
} catch {
  failures.push('lead form: success state did not appear')
}
if (!leadPayload || leadPayload.niche !== 'real-estate' || leadPayload.email !== 'ava@example.com') {
  failures.push('lead form: lead payload was not submitted correctly')
}
await formPage.close()

const shortHeroPage = await browser.newPage({ viewport: { width: 1280, height: 760 } })
await shortHeroPage.goto(baseUrl, { waitUntil: 'networkidle' })
const heroFormBox = await shortHeroPage.locator('main section form#hero-enquiry').first().boundingBox()
if (!heroFormBox) {
  failures.push('hero form: form not visible on short desktop viewport')
} else if (heroFormBox.y + heroFormBox.height > 760) {
  failures.push(`hero form: clipped on short desktop viewport at ${Math.round(heroFormBox.y + heroFormBox.height)}px`)
}
await shortHeroPage.close()

const tourPage = await browser.newPage({ viewport: { width: 1366, height: 1000 } })
await tourPage.goto(`${baseUrl}#virtual-tour`, { waitUntil: 'networkidle' })
await tourPage.waitForSelector('[data-live-tour]', { timeout: 10000 })
const liveTourVisible = await tourPage.locator('[data-live-tour]').first().isVisible()
if (!liveTourVisible) failures.push('virtual tour: live tour did not render')
await tourPage.getByText('Living Lounge | Daylight reception room').waitFor({ timeout: 10000 })
await tourPage.locator('[data-room-id="kitchen"]').click()
await tourPage.getByText('A bright kitchen with island prep space').waitFor({ timeout: 5000 })
const kitchenPressed = await tourPage.locator('[data-room-id="kitchen"]').getAttribute('aria-pressed')
if (kitchenPressed !== 'true') failures.push('virtual tour: room switching did not update active state')
await tourPage.getByRole('button', { name: 'Evening ambience' }).click()
const liveImageAlt = await tourPage.locator('[data-live-tour] img').first().getAttribute('alt')
if (!liveImageAlt?.includes('Evening ambience')) failures.push('virtual tour: live view toggle did not update image')
await tourPage.close()

await browser.close()

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Browser QA passed')
