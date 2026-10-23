// Loaded by the frame itself: does not depend on Header being registered in the layout.
export const homeLayoutCSS = `
.center:has(#mj-main.mj-home) { width:100%; min-width:0; box-sizing:border-box; }
.center:has(.mj-home) .page-header { padding-top:0!important; margin-top:0!important; }
.center:has(.mj-home) .mj-heading-row { min-height:0!important; margin:0!important; padding:0!important; }
.center:has(.mj-home) .mj-tools { position:absolute; top:1rem; inset-inline-end:1rem; }
.center:has(.mj-home) .mj-site-header { position:relative; padding-top:1rem!important; }
.center:has(.mj-home) .mj-navigation { display:flex!important; justify-content:center!important; flex-wrap:wrap; gap:1rem 2rem; padding:1rem 5rem!important; margin:0!important; border-top:0!important; }
.center:has(.mj-home) .popover-hint { display:none!important; }
.center #mj-main.mj-home { max-width:960px!important; width:100%!important; box-sizing:border-box; padding:0 1rem!important; margin:0 auto!important; direction:rtl; }
#mj-main.mj-home .mj-home-hero { text-align:center; padding:2.5rem 0 1.5rem; }
#mj-main.mj-home .mj-home-hero h1 { margin:0 0 1rem!important; font-size:clamp(2.3rem,5vw,3.5rem); line-height:1.5; }
#mj-main.mj-home .mj-home-hero p { margin:0; line-height:2; }
#mj-main.mj-home section > h2 { display:flex; align-items:center; justify-content:center; gap:1.4rem; text-align:center!important; margin:0 0 1.5rem!important; font-size:1.35rem; }
#mj-main.mj-home section > h2:before,#mj-main.mj-home section > h2:after { content:''; height:1px; width:100px; background:var(--gray); opacity:.5; }
#mj-main.mj-home .mj-start-notes { margin:1.5rem 0 2rem!important; }
#mj-main.mj-home .mj-start-notes ol { display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1rem; padding:0!important; margin:0!important; list-style:none!important; counter-reset:start; }
#mj-main.mj-home .mj-start-notes li { margin:0!important; border:1px solid var(--gray); border-radius:7px; min-width:0; }
#mj-main.mj-home .mj-start-notes li > a,#mj-main.mj-home .mj-start-notes li > span { display:flex; align-items:center; gap:.8rem; padding:1rem; height:100%; box-sizing:border-box; text-decoration:none; }
#mj-main.mj-home .mj-start-notes li > :before { counter-increment:start; content:counter(start,decimal-leading-zero); color:var(--secondary); }
.center #mj-main.mj-home .mj-home-columns { display:block!important; margin:2rem 0!important; }
.center #mj-main.mj-home .mj-home-paths { display:none!important; }
.center #mj-main.mj-home .mj-topic-cards { display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr))!important; gap:1.4rem!important; width:100%!important; }
.center #mj-main.mj-home .mj-topic-cards > a { display:flex!important; flex-direction:column; align-items:center; justify-content:flex-start; gap:1rem; text-align:center!important; padding:1.7rem 1rem!important; margin:0!important; width:auto!important; min-width:0; box-sizing:border-box; border:1px solid var(--gray); border-radius:8px!important; text-decoration:none; color:var(--dark)!important; }
#mj-main.mj-home .mj-topic-icon { width:40px; height:40px; color:var(--secondary); }
#mj-main.mj-home .mj-topic-cards strong { font-size:1.45rem; }
#mj-main.mj-home .mj-topic-cards .mj-topic-description { font-size:.95rem; line-height:1.9; flex:1; }
#mj-main.mj-home .mj-topic-button { display:block; border:1px solid var(--secondary); color:var(--secondary); border-radius:8px; padding:.35rem 1rem; font-size:.9rem; }
#mj-main.mj-home .mj-recent-notes { margin:2.5rem 0!important; }
#mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) ul { padding:0!important; list-style:none; }
#mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) li { padding:.85rem 1rem; border:1px solid var(--gray); border-radius:7px; margin:.7rem 0; }
#mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) li a { display:block; text-decoration:none; }
.center:has(.mj-home) .mj-site-footer { max-width:928px!important; margin:3rem auto 1rem!important; padding-top:1.5rem; border-top:1px solid var(--gray); }
@media(max-width:650px) {
 .center:has(.mj-home) .mj-tools { position:static; margin:0 auto .5rem; }
 .center:has(.mj-home) .mj-navigation { padding:.8rem 0!important; gap:.6rem 1.2rem; }
 .center #mj-main.mj-home .mj-topic-cards,#mj-main.mj-home .mj-start-notes ol { grid-template-columns:1fr!important; }
 #mj-main.mj-home .mj-home-hero { padding:1.8rem 0 1rem; }
 .center:has(.mj-home) .mj-site-footer { margin-inline:1rem!important; width:auto!important; }
}
`
