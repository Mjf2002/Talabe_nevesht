// Frame-scoped theme, rendered on every page for Quartz SPA navigation.
export const homeLayoutCSS = `
:root { --mj-paper:#f7f8f4; --mj-surface:#fff; --mj-ink:#253c33; --mj-soft:#edf2e9; --mj-line:#dce4d8; --mj-muted:#657369; }
:root[saved-theme="dark"] { --mj-paper:#141d19; --mj-surface:#1c2821; --mj-ink:#e2eade; --mj-soft:#25382b; --mj-line:#35483b; --mj-muted:#b0bfaf; }
body { background:var(--mj-paper)!important; }
.center { color:var(--mj-ink); min-width:0; }
.center .page-header,.center #mj-main,.center .mj-site-footer { max-width:1040px!important; box-sizing:border-box; }
.center .page-header { margin:0 auto!important; padding:1.5rem 1rem 0!important; }
.center .mj-site-header { padding:0 0 1rem!important; border-bottom:1px solid var(--mj-line); }
.center .mj-heading-row { min-height:2.5rem; margin:0!important; }
.center .mj-navigation { gap:.4rem 1rem!important; padding:.6rem 0!important; }
.center .mj-navigation a { border-radius:999px; padding:.4rem 1rem; text-decoration:none; color:var(--mj-muted); background:transparent; }
.center .mj-navigation a[aria-current="page"] { background:var(--mj-soft); color:var(--mj-ink)!important; }
.center .mj-wordmark { color:var(--mj-ink); }
.center #mj-main { padding:1rem!important; }
.center #mj-main.mj-home { max-width:1040px!important; }
.center #mj-main.mj-home .mj-home-hero { display:grid!important; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); align-items:center; gap:2rem; text-align:right!important; padding:3.5rem 2.5rem!important; margin:1rem 0 2.5rem!important; background:var(--mj-soft); border:1px solid var(--mj-line); border-radius:28px; overflow:hidden; }
.mj-hero-eyebrow { display:block; color:var(--mj-muted); font-size:.85rem; letter-spacing:.03em; }
.center #mj-main.mj-home .mj-home-hero h1 { color:var(--mj-ink); margin:.4rem 0!important; font-size:clamp(2.3rem,6vw,4.2rem); line-height:1.5; }
.center #mj-main.mj-home .mj-home-hero p { color:var(--mj-muted); margin:0!important; line-height:2.1; }
.center #mj-main.mj-home .mj-hero-actions { display:flex!important; flex-wrap:wrap; gap:.7rem; margin-top:1.5rem; }
.center #mj-main .mj-hero-actions a { padding:.6rem 1.1rem; border:1px solid var(--mj-line); border-radius:12px; background:var(--mj-surface); text-decoration:none; }
.center #mj-main .mj-hero-actions a:first-child { background:#375841; color:#fff!important; border-color:#375841; }
.mj-hero-seal { aspect-ratio:1; max-width:240px; width:100%; margin:auto; border:1px solid color-mix(in srgb,var(--mj-ink) 25%,transparent); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; transform:rotate(-8deg); background:color-mix(in srgb,var(--mj-surface) 35%,transparent); }
.mj-hero-seal:before { content:''; position:absolute; inset:13px; border:1px dashed var(--mj-line); border-radius:50%; }
.mj-hero-seal strong { font-size:2.5rem; color:var(--mj-ink); }
.mj-hero-seal span { font-size:.8rem; color:var(--mj-muted); }
.center #mj-main.mj-home section > h2 { display:flex; align-items:center; gap:1rem; text-align:right!important; font-size:1.3rem; color:var(--mj-ink); margin:0 0 1.25rem!important; }
.center #mj-main.mj-home section > h2:after { content:''; flex:1; height:1px; background:var(--mj-line); }
.center #mj-main.mj-home section > h2:before { display:none; }
.center #mj-main.mj-home .mj-start-notes { padding:1.6rem!important; border:1px solid var(--mj-line); border-radius:22px; background:var(--mj-surface); margin:0 0 2.5rem!important; scroll-margin-top:2rem; }
.center #mj-main.mj-home .mj-start-notes ol { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.8rem; padding:0; margin:0; list-style:none; counter-reset:steps; }
.center #mj-main.mj-home .mj-start-notes li { border:1px solid var(--mj-line); background:var(--mj-paper); border-radius:14px; margin:0; min-width:0; }
.center #mj-main.mj-home .mj-start-notes li > a,.center #mj-main.mj-home .mj-start-notes li > span { display:flex; gap:.65rem; align-items:center; padding:1rem; text-decoration:none; }
.center #mj-main.mj-home .mj-start-notes li > :before { counter-increment:steps; content:counter(steps,decimal-leading-zero); font-size:.8rem; color:var(--mj-muted); }
.center #mj-main.mj-home .mj-home-columns { display:block!important; margin:2.5rem 0!important; }
.center #mj-main.mj-home .mj-home-paths { display:none!important; }
.center #mj-main.mj-home .mj-topic-cards { display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr))!important; gap:1rem!important; }
.center #mj-main .mj-home-cards > a { display:flex; flex-direction:column; align-items:flex-start; gap:.8rem; box-sizing:border-box; min-width:0; padding:1.6rem!important; border:1px solid var(--mj-line); border-radius:20px!important; background:var(--mj-surface); color:var(--mj-ink)!important; text-align:right; text-decoration:none; transition:transform .2s,border-color .2s; }
.center #mj-main .mj-home-cards > a:hover { transform:translateY(-4px); border-color:#8aa486; }
.center #mj-main .mj-topic-cards > a:nth-child(3n+1) { background:var(--mj-soft); }
.center #mj-main .mj-topic-icon { width:36px; height:36px; padding:.6rem; background:var(--mj-paper); border:1px solid var(--mj-line); border-radius:14px; color:var(--mj-ink); }
.center #mj-main .mj-topic-cards strong { font-size:1.3rem; }
.center #mj-main .mj-topic-description { color:var(--mj-muted); font-size:.92rem; line-height:2; flex:1; }
.center #mj-main .mj-topic-button { padding:.35rem .8rem; border-radius:9px; border:1px solid var(--mj-line); font-size:.82rem; }
.center #mj-main.mj-home .mj-recent-notes { margin:2.5rem 0!important; }
.center #mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) ul { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; list-style:none; padding:0; }
.center #mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) li { display:flex; flex-direction:column; min-width:0; margin:0; padding:1.5rem; background:var(--mj-surface); border:1px solid var(--mj-line); border-radius:18px; }
.center #mj-main .mj-recent-notes li a { background:transparent; box-shadow:none; text-decoration:none; }
.mj-note-kicker { display:flex; justify-content:space-between; font-size:.75rem; color:var(--mj-muted); margin-bottom:.6rem; }
.center #mj-main .mj-note-card-title { font-weight:700; font-size:1.13rem; color:var(--mj-ink)!important; }
.center #mj-main .mj-card-excerpt { color:var(--mj-muted); font-size:.9rem; line-height:2; margin:.75rem 0 1.25rem; }
.mj-card-meta { display:flex; justify-content:space-between; gap:.6rem; flex-wrap:wrap; margin-top:auto; padding-top:1rem; font-size:.75rem; color:var(--mj-muted); }
.center #mj-main:not(.mj-home) article { background:var(--mj-surface); border:1px solid var(--mj-line); padding:clamp(1rem,4vw,2.5rem); border-radius:22px; overflow-wrap:anywhere; }
.center .mj-site-footer { border-top:1px solid var(--mj-line); padding:1.5rem 1rem!important; margin:3rem auto 1rem!important; color:var(--mj-muted); }
.center .mj-site-footer .mj-footer-name { font-weight:700; color:var(--mj-ink); }
.center :is(a,button,summary):focus-visible { outline:3px solid #7d9c73; outline-offset:4px; }
@media(max-width:650px) {
 .center .page-header { padding:1rem .5rem 0!important; }
 .center #mj-main { padding:.75rem!important; }
 .center .mj-navigation { gap:.25rem!important; }
 .center .mj-navigation a { padding:.4rem .7rem; font-size:.85rem; }
 .center #mj-main.mj-home .mj-home-hero { grid-template-columns:1fr; padding:2rem 1.3rem!important; gap:1.5rem; border-radius:20px; }
 .mj-hero-seal { max-width:160px; }
 .mj-hero-seal strong { font-size:1.8rem; }
 .mj-hero-seal span { font-size:.65rem; }
 .center #mj-main.mj-home .mj-start-notes ol,.center #mj-main.mj-home .mj-topic-cards,.center #mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) ul { grid-template-columns:1fr!important; }
 .center #mj-main.mj-home .mj-start-notes { padding:1rem!important; }
 .center #mj-main .mj-home-cards > a { padding:1.2rem!important; }
}
@media(prefers-reduced-motion:reduce) { .center #mj-main .mj-home-cards > a { transition:none; } }
`
