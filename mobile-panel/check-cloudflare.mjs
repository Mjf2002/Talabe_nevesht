// Fail closed: never create a new Worker or deploy over missing configuration.
const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env
if (!token || !account) throw new Error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in GitHub Actions Secrets.')
if (!/^[a-f0-9]{32}$/i.test(account)) throw new Error('Invalid Cloudflare Account ID.')
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/manejamei-mobile-panel/settings`, {
  headers: { Authorization: `Bearer ${token}` },
})
const data = await response.json()
if (!response.ok || !data.success) throw new Error(`Cannot read existing Worker settings (HTTP ${response.status}). Check token permissions, account and Worker name.`)
const bindings = data.result?.bindings ?? []
const required = ['GITHUB_REPO', 'GITHUB_BRANCH', 'ALLOWED_GITHUB_ID', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_TOKEN', 'SESSION_SECRET']
for (const name of required) {
  if (!bindings.some(b => b.name === name)) throw new Error(`Existing Cloudflare setting is missing: ${name}. Deployment stopped.`)
}
for (const [name, expected] of Object.entries({ GITHUB_REPO: 'Mjf2002/javad', GITHUB_BRANCH: 'v5' })) {
  const b = bindings.find(b => b.name === name)
  if (b.type === 'plain_text' && b.text !== expected) throw new Error(`Unexpected ${name}; deployment stopped.`)
}
console.log('Existing Worker and required settings verified. No secret values were printed.')
