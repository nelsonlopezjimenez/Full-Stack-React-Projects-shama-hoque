// One browser scenario per client stage: sNN runs against stage NN.
// A scenario checks what that stage's lesson adds, and some later ones re-run earlier scenarios
// (s04 runs s03, s13 runs s10, s16 runs s13 + s14) so a later stage cannot silently break them.
// Each run uses fresh users (the time is in their names and emails), so runs never collide.
//
// The helpers use Playwright's user-facing locators: getByRole / getByLabel / getByText find
// things the way a person (or a screen reader) would, not by CSS classes.
import { apiBase } from './config.mjs'

export const s01 = async ({ page, base, see, step }) => {
  step('home page renders the heading')
  await page.goto(base + '/')
  await see('MERN Skeleton')
  await see('Hello from React.')
}

// Talks to the API directly (no browser), to prepare data for a scenario.
export const api = async (method, path, body) => {
  const r = await fetch(apiBase + path, {
    method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body)
  })
  return { status: r.status, data: await r.json().catch(() => ({})) }
}

export const s02 = async ({ page, base, see, step, email }) => {
  const name = 'Lister ' + Date.now()
  const created = await api('POST', '/api/users', { name, email, password: 'secret123' })
  if (created.status !== 201) throw new Error('seed failed ' + JSON.stringify(created))
  step('list shows a user created through the API')
  await page.goto(base + '/')
  await see('All Users')
  await see(name)
  step('server unreachable → error message')
  await page.route('**/api/users', (route) => route.abort())
  await page.reload()
  await see('Cannot reach the server')
  await page.unroute('**/api/users')
}

export const fillSignup = async (page, { name, email, password }) => {
  await page.getByLabel('Name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Submit' }).click()
}

export const s03 = async ({ page, base, see, step, email }) => {
  const name = 'Signer ' + Date.now()
  await page.goto(base + '/')
  step('empty form → all server validation messages')
  await page.getByRole('button', { name: 'Submit' }).click()
  await see('Name is required. Email is required. Password is required.')
  step('valid form → message, list refreshed, fields cleared')
  await fillSignup(page, { name, email, password: 'secret123' })
  await see('Successfully signed up!')
  await see(name)
  if (await page.getByLabel('Name').inputValue() !== '') throw new Error('name not cleared')
  step('same email again → duplicate message')
  await fillSignup(page, { name, email, password: 'secret123' })
  await see('Email already exists')
}

export const s04 = async (ctx) => {
  await s03(ctx)
  const { page, see, step } = ctx
  step('form shows "Cannot reach the server" when the request fails')
  await page.route('**/api/users', (route) => route.request().method() === 'POST' ? route.abort() : route.continue())
  await fillSignup(page, { name: 'Nobody', email: 'nobody@test.io', password: 'secret123' })
  await see('Cannot reach the server')
  await page.unroute('**/api/users')
}

export const s05 = async (ctx) => {
  const { page, base, see, step } = ctx
  await page.goto(base + '/')
  step('MUI home card with the seashell image')
  await see('Home Page')
  await see('Welcome to the MERN Skeleton home page.')
  const bg = await page.locator('[title="Unicorn Shells"]').evaluate((el) => getComputedStyle(el).backgroundImage)
  if (!bg.includes('seashell')) throw new Error('no seashell image: ' + bg)
  console.log('  ✓ seashell image', bg.slice(0, 60))
  const font = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily)
  if (!font.includes('Roboto')) throw new Error('font ' + font)
  console.log('  ✓ font', font)
  await s04(ctx)
}

export const expectUrl = async (page, path) => {
  await page.waitForURL((u) => u.pathname === path, { timeout: 8000 })
  console.log('  ✓ url', path)
}
const hasClass = async (loc, cls) => (await loc.getAttribute('class')).split(' ').includes(cls)

export const s06 = async ({ page, base, see, step, email }) => {
  const name = 'Router ' + Date.now()
  await page.goto(base + '/')
  await see('MERN Skeleton')
  await see('Home Page')
  step('menu → Sign up page, create a user')
  await page.getByRole('link', { name: 'Sign up' }).click()
  await expectUrl(page, '/signup')
  await fillSignup(page, { name, email, password: 'secret123' })
  await see('Successfully signed up!')
  step('menu → Users, active link')
  await page.getByRole('link', { name: 'Users' }).click()
  await expectUrl(page, '/users')
  await see(name)
  if (!await hasClass(page.getByRole('link', { name: 'Users' }), 'active')) throw new Error('Users not active')
  if (await hasClass(page.getByRole('link', { name: 'Home' }), 'active')) throw new Error('Home active')
  console.log('  ✓ only Users is active')
  step('browser Back returns to /signup')
  await page.goBack()
  await expectUrl(page, '/signup')
  step('reload on /users (the dev server answers index.html)')
  await page.goto(base + '/users')
  await see(name)
  step('unknown URL → NotFound')
  await page.goto(base + '/nope/really')
  await see('Page not found')
  await see('/nope/really')
  await page.getByRole('link', { name: 'Go home' }).click()
  await expectUrl(page, '/')
}

export const s07 = async ({ page, base, see, step, email }) => {
  const name = 'Profiled ' + Date.now()
  await api('POST', '/api/users', { name, email, password: 'secret123' })
  await page.goto(base + '/users')
  step('click a user row → /users/:id')
  await page.getByRole('link', { name }).click()
  await page.waitForURL(/\/users\/[0-9a-f]{24}$/)
  console.log('  ✓ url', new URL(page.url()).pathname)
  step('profile needs sign-in → the server says 401')
  await see('UnauthorizedError: No authorization token was found')
}

export const fillSignin = async (page, email, password) => {
  await page.getByRole('heading', { name: 'Sign In' }).waitFor()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Submit' }).click()
}

export const s08 = async ({ page, base, see, step, email }) => {
  const name = 'Signin ' + Date.now()
  step('sign up → dialog → Sign In button → /signin')
  await page.goto(base + '/signup')
  await fillSignup(page, { name, email, password: 'secret123' })
  await see('New account successfully created.')
  await page.getByRole('link', { name: 'Sign In' }).last().click()
  await expectUrl(page, '/signin')
  step('wrong password → one message for both failures')
  await fillSignin(page, email, 'wrong-password')
  await see("Email and password don't match.")
  step('right password → own profile loads thanks to the cookie')
  await page.getByLabel('Password').fill('secret123')
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.waitForURL(/\/users\/[0-9a-f]{24}$/)
  await see(name)
  await see(email)
  await see('Joined:')
  const cookies = await page.context().cookies()
  const t = cookies.find((c) => c.name === 't')
  if (!t || !t.httpOnly) throw new Error('no httpOnly cookie t: ' + JSON.stringify(cookies))
  console.log('  ✓ cookie t is httpOnly, sameSite', t.sameSite)
  const visible = await page.evaluate(() => document.cookie)
  if (visible.includes('t=')) throw new Error('document.cookie sees t')
  console.log('  ✓ document.cookie does not show it:', JSON.stringify(visible))
}

export const signUpAndIn = async (page, base, email, name) => {
  const r = await api('POST', '/api/users', { name, email, password: 'secret123' })
  if (r.status !== 201) throw new Error('signup ' + JSON.stringify(r))
  await page.goto(base + '/signin')
  await fillSignin(page, email, 'secret123')
}

export const s09 = async ({ page, base, see, notSee, step, email }) => {
  const name = 'Helper ' + Date.now()
  step('signed out: menu offers Sign up / Sign In')
  await page.goto(base + '/')
  await see('Sign up')
  await notSee('My Profile')
  step('sign in → home, menu switches')
  await signUpAndIn(page, base, email, name)
  await expectUrl(page, '/')
  await see('My Profile')
  await see('Sign out')
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('jwt')))
  if (!stored?.token || stored.user.email !== email) throw new Error('sessionStorage ' + JSON.stringify(stored))
  console.log('  ✓ sessionStorage jwt = { token, user }')
  step('My Profile sends the Bearer header')
  const reqP = page.waitForRequest((r) => /\/api\/users\/[0-9a-f]{24}$/.test(r.url()))
  await page.getByRole('link', { name: 'My Profile' }).click()
  const req = await reqP
  if (!req.headers().authorization?.startsWith('Bearer ')) throw new Error('no Bearer header')
  console.log('  ✓ Authorization: Bearer …')
  await see(email)
  step('without the cookie, the Bearer header alone still works')
  await page.context().clearCookies()
  await page.reload()
  await see(email)
  step('Sign out → DELETE session, storage cleared, menu back')
  await signUpAndIn(page, base, 'b' + email, name + 'b')
  await expectUrl(page, '/')
  const delP = page.waitForRequest((r) => r.url().endsWith('/api/auth/sessions') && r.method() === 'DELETE')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await delP
  console.log('  ✓ DELETE /api/auth/sessions sent')
  await see('Sign In')
  await notSee('My Profile')
  if (await page.evaluate(() => sessionStorage.getItem('jwt')) !== null) throw new Error('storage not cleared')
  await page.waitForTimeout(300)
  if ((await page.context().cookies()).some((c) => c.name === 't' && c.value)) throw new Error('cookie still there')
  console.log('  ✓ sessionStorage and cookie t cleared')
}

const fakeJwt = (payload) => {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.bad-signature`
}

export const s10 = async ({ page, base, see, step, email }) => {
  const name = 'Private ' + Date.now()
  await api('POST', '/api/users', { name, email, password: 'secret123' })
  step('signed out: list → profile redirects to /signin')
  await page.goto(base + '/users')
  await page.getByRole('link', { name }).click()
  await expectUrl(page, '/signin')
  step('sign in → back on the profile that was asked for')
  await fillSignin(page, email, 'secret123')
  await page.waitForURL(/\/users\/[0-9a-f]{24}$/)
  const profileUrl = page.url()
  await see(email)
  step('Back skips /signin (replace) and returns to /users')
  await page.goBack()
  await expectUrl(page, '/users')
  step('expired token in storage → treated as signed out → /signin')
  const user = await page.evaluate(() => JSON.parse(sessionStorage.getItem('jwt')).user)
  await page.evaluate(([t, u]) => sessionStorage.setItem('jwt', JSON.stringify({ token: t, user: u })),
    [fakeJwt({ _id: user._id, exp: Math.floor(Date.now() / 1000) - 60 }), user])
  await page.goto(profileUrl)
  await expectUrl(page, '/signin')
  step('token the server rejects (bad signature, no cookie) → 401 → /signin')
  await page.context().clearCookies()
  await page.evaluate(([t, u]) => sessionStorage.setItem('jwt', JSON.stringify({ token: t, user: u })),
    [fakeJwt({ _id: user._id, exp: Math.floor(Date.now() / 1000) + 3600 }), user])
  await page.goto(profileUrl)
  await expectUrl(page, '/signin')
}

export const s11 = async ({ page, base, see, notSee, step, email }) => {
  const name = 'Editor ' + Date.now()
  const other = 'Other ' + Date.now()
  await api('POST', '/api/users', { name: other, email: 'o' + email, password: 'secret123' })
  step('sign in, own profile has the Edit button')
  await signUpAndIn(page, base, email, name)
  await expectUrl(page, '/')
  await page.getByRole('link', { name: 'My Profile' }).click()
  await see(email)
  await page.getByRole('link', { name: 'Edit' }).click()
  await page.waitForURL(/\/users\/[0-9a-f]{24}\/edit$/)
  step('form is filled from the server')
  await page.getByRole('heading', { name: 'Edit Profile' }).waitFor()
  await page.waitForFunction(() => document.querySelector('#name')?.value !== '')
  if (await page.getByLabel('Name').inputValue() !== name) throw new Error('name not prefilled')
  console.log('  ✓ name and email prefilled')
  step('change the name → PATCH → back on the profile')
  const patchP = page.waitForRequest((r) => r.method() === 'PATCH')
  await page.getByLabel('Name').fill(name + ' II')
  await page.getByRole('button', { name: 'Submit' }).click()
  const patch = await patchP
  console.log('  ✓ PATCH body', patch.postData())
  if (JSON.parse(patch.postData()).password !== undefined) throw new Error('empty password was sent')
  await page.waitForURL(/\/users\/[0-9a-f]{24}$/)
  await see(name + ' II')
  step('someone else\'s profile: no Edit button')
  await page.getByRole('link', { name: 'Users' }).click()
  await page.getByRole('link', { name: other }).click()
  await see(other)
  await notSee('Edit Profile')
  if (await page.getByRole('link', { name: 'Edit' }).count()) throw new Error('Edit visible on other profile')
  console.log('  ✓ no Edit link')
  step('typing the edit URL of someone else → server 403')
  await page.goto(page.url() + '/edit')
  await page.waitForFunction(() => document.querySelector('#name')?.value !== '')
  await page.getByLabel('Name').fill('Hacked')
  await page.getByRole('button', { name: 'Submit' }).click()
  await see('User is not authorized')
}

export const s12 = async ({ page, base, see, notSee, step, email }) => {
  const name = 'Deleter ' + Date.now()
  await signUpAndIn(page, base, email, name)
  await expectUrl(page, '/')
  await page.getByRole('link', { name: 'My Profile' }).click()
  await see(email)
  step('Delete → dialog → Cancel keeps the account')
  await page.getByRole('button', { name: 'Delete' }).click()
  await see('Confirm to delete your account.')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('Confirm to delete your account.').waitFor({ state: 'hidden' })
  console.log('  ✓ dialog closed')
  step('Delete → Confirm → DELETE, signed out, home')
  const delP = page.waitForRequest((r) => r.method() === 'DELETE' && /\/api\/users\//.test(r.url()))
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await delP
  await expectUrl(page, '/')
  await see('Sign In')
  await notSee('My Profile')
  step('the user is gone from the list')
  await page.getByRole('link', { name: 'Users' }).click()
  await see('All Users')
  await page.locator('a[href^="/users/"]').first().waitFor()
  await notSee(name)
  const all = await api('GET', '/api/users')
  if (all.data.some((u) => u.name === name)) throw new Error('still in the database')
  console.log('  ✓ not in GET /api/users either')
}

export const s13 = async (ctx) => {
  const { page, base, see, step, email } = ctx
  step('signup: empty form → all messages')
  await page.goto(base + '/signup')
  await page.getByRole('button', { name: 'Submit' }).click()
  await see('Name is required. Email is required. Password is required.')
  step('signup error keeps name + email, clears the password')
  const dupe = 'd' + email
  await api('POST', '/api/users', { name: 'Dupe', email: dupe, password: 'secret123' })
  await fillSignup(page, { name: 'Keep Me', email: dupe, password: 'secret123' })
  await see('Email already exists')
  const kept = [await page.getByLabel('Name').inputValue(), await page.getByLabel('Email').inputValue(), await page.getByLabel('Password').inputValue()]
  if (kept[0] !== 'Keep Me' || kept[1] !== dupe || kept[2] !== '') throw new Error('values ' + JSON.stringify(kept))
  console.log('  ✓ fields after error:', JSON.stringify(kept))
  step('signin error keeps the email')
  await page.goto(base + '/signin')
  await fillSignin(page, dupe, 'nope-nope')
  await see("Email and password don't match.")
  if (await page.getByLabel('Email').inputValue() !== dupe) throw new Error('email not kept')
  console.log('  ✓ email kept')
  step('signup → dialog → sign in (wrong, then right password) → home, signed in')
  const name = 'Actions ' + Date.now()
  await page.goto(base + '/signup')
  await fillSignup(page, { name, email, password: 'secret123' })
  await see('New account successfully created.')
  await page.getByRole('link', { name: 'Sign In' }).last().click()
  await expectUrl(page, '/signin')
  await fillSignin(page, email, 'wrong-password')
  await see("Email and password don't match.")
  await page.getByLabel('Password').fill('secret123')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expectUrl(page, '/')
  await see('My Profile')
  step('stage 10 flow (PrivateRoute + from) with the new sign-in form')
  await page.evaluate(() => sessionStorage.clear())
  await page.context().clearCookies()
  await s10({ ...ctx, email: 'p' + email })
}

export const s14 = async (ctx) => {
  const { page, base, step } = ctx
  step('home page does not download the Signin module')
  const loaded = []
  page.on('request', (r) => loaded.push(new URL(r.url()).pathname))
  await page.goto(base + '/')
  await ctx.see('Home Page')
  if (loaded.some((p) => p.endsWith('/auth/Signin.jsx'))) throw new Error('Signin loaded on home')
  console.log('  ✓ Signin.jsx not requested on /')
  await page.getByRole('link', { name: 'Sign In' }).click()
  await page.getByRole('heading', { name: 'Sign In' }).waitFor()
  if (!loaded.some((p) => p.endsWith('/auth/Signin.jsx'))) throw new Error('Signin never loaded')
  console.log('  ✓ Signin.jsx requested when the page opened')
  await page.evaluate(() => sessionStorage.clear())
  await page.context().clearCookies()
  await s11({ ...ctx, email: 'e' + ctx.email })
  await page.evaluate(() => sessionStorage.clear())
  await s12({ ...ctx, email: 'x' + ctx.email })
}

// Stage 15 changes how the app is built and deployed; check-production.mjs covers that.
// In the dev server it must still sign in and out as in stage 09.
export const s15 = async (ctx) => { await s09(ctx) }

export const s16 = async (ctx) => {
  await s13(ctx)
  await ctx.page.evaluate(() => sessionStorage.clear())
  await ctx.page.context().clearCookies()
  await s14({ ...ctx, email: 'z' + ctx.email })
}
