// Hallmark · Specimen · Persian editorial home. Content and conditions remain in DefaultFrame.
export const homeLayoutCSS = `
.center:has(.mj-home) .page-header { margin:0; padding:0; }
.center:has(.mj-home) .popover-hint { display:none; }
.center:has(.mj-home) .mj-site-header { margin-bottom:0; }
.center:has(.mj-home) .mj-navigation { justify-content:flex-start; border-top:2px solid var(--dark); }
.center #mj-main.mj-home { max-width:none; padding:0; direction:rtl; }
#mj-main.mj-home .mj-home-hero { display:grid; grid-template-columns:1.35fr 1fr; align-items:end; gap:3rem; padding:4rem 0 3.5rem; border-bottom:1px solid var(--dark); }
#mj-main.mj-home .mj-home-hero h1 { font-size:clamp(3.2rem,7vw,6rem); font-weight:850; line-height:1.4; margin:0; letter-spacing:-.04em; }
#mj-main.mj-home .mj-home-hero p { margin:0 0 .65rem; max-width:30rem; color:var(--darkgray); font-size:1.08rem; line-height:2.2; border-inline-start:2px solid var(--secondary); padding-inline-start:1.5rem; }
#mj-main.mj-home section > h2 { font-size:1.2rem; font-weight:650; margin:0 0 1.5rem; text-align:start; }
#mj-main.mj-home .mj-start-notes { display:grid; grid-template-columns:1fr 3fr; gap:2rem; margin:0; padding:2.5rem 0; border-bottom:1px solid var(--lightgray); }
#mj-main.mj-home .mj-start-notes ol { list-style:none; padding:0; margin:0; counter-reset:reading; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1.5rem; }
#mj-main.mj-home .mj-start-notes li { min-width:0; counter-increment:reading; border-inline-start:1px solid var(--lightgray); padding-inline-start:1rem; }
#mj-main.mj-home .mj-start-notes li:before { content:counter(reading,decimal-leading-zero); display:block; color:var(--secondary); font-size:.8rem; margin-bottom:.65rem; }
#mj-main.mj-home .mj-start-notes li > a,#mj-main.mj-home .mj-start-notes li > span { color:var(--dark); line-height:2; }
.center #mj-main.mj-home .mj-home-columns { display:grid; grid-template-columns:minmax(0,2.4fr) minmax(0,1fr); gap:3rem; margin:3rem 0; }
.center #mj-main.mj-home .mj-home-columns-single { grid-template-columns:1fr; }
#mj-main.mj-home .mj-home-paths { border-inline-start:1px solid var(--lightgray); padding-inline-start:2rem; }
#mj-main.mj-home .mj-home-cards { display:block; margin:0; }
#mj-main.mj-home .mj-home-cards > a { display:grid; grid-template-columns:1fr auto; gap:.5rem 1rem; padding:1.4rem 0; border:0; border-top:1px solid var(--lightgray); border-radius:0; background:transparent; text-align:start; align-items:start; transform:none; }
#mj-main.mj-home .mj-topic-cards > a { grid-template-columns:2rem 1fr auto; }
#mj-main.mj-home .mj-topic-icon { width:23px; height:23px; margin-top:.35rem; color:var(--secondary); grid-row:1 / 3; }
#mj-main.mj-home .mj-topic-cards strong { font-size:1.35rem; }
#mj-main.mj-home .mj-topic-description { grid-column:2; color:var(--gray); font-size:.87rem; }
#mj-main.mj-home .mj-topic-button { grid-column:3; grid-row:1 / 3; align-self:center; font-size:.72rem; color:var(--secondary); }
#mj-main.mj-home .mj-home-paths .mj-home-cards > a { display:flex; gap:.4rem; }
#mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) { display:grid; grid-template-columns:1fr 3fr; gap:2rem; border-top:1px solid var(--dark); margin:3rem 0; padding-top:1.5rem; }
#mj-main.mj-home .mj-recent-notes ul { list-style:none; margin:0; padding:0; }
#mj-main.mj-home .mj-recent-notes ul li { border-bottom:1px solid var(--lightgray); padding:.9rem 0; }
#mj-main.mj-home a { background:transparent; text-decoration:none; }
#mj-main.mj-home a:hover { color:var(--secondary); }
#mj-main.mj-home a:hover strong { color:var(--secondary); }
@media(max-width:700px) {
 #mj-main.mj-home .mj-home-hero { grid-template-columns:1fr; gap:1.4rem; padding:2.5rem 0; }
 #mj-main.mj-home .mj-home-hero h1 { font-size:clamp(3rem,13vw,4.5rem); }
 #mj-main.mj-home .mj-home-hero p { font-size:.95rem; }
 #mj-main.mj-home .mj-start-notes,#mj-main.mj-home .mj-recent-notes:not(.mj-start-notes) { grid-template-columns:1fr; gap:1rem; }
 #mj-main.mj-home .mj-start-notes ol { grid-template-columns:1fr; gap:1rem; }
 #mj-main.mj-home .mj-start-notes li { display:flex; gap:1rem; border:0; padding:0 0 1rem; border-bottom:1px solid var(--lightgray); }
 .center #mj-main.mj-home .mj-home-columns { grid-template-columns:1fr; gap:2rem; }
 #mj-main.mj-home .mj-home-paths { border-inline-start:0; padding-inline-start:0; }
 #mj-main.mj-home .mj-topic-cards > a { grid-template-columns:1.6rem 1fr; }
 #mj-main.mj-home .mj-topic-button { grid-column:2; grid-row:auto; }
}
`
