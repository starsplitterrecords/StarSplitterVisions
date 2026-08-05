
const menu=document.querySelector('.menu-button');const nav=document.querySelector('.site-nav');if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}
const filters=document.querySelectorAll('[data-filter]');const cards=document.querySelectorAll('[data-categories]');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(card=>card.hidden=f!=='all'&&!card.dataset.categories.includes(f));}));
if(document.querySelector('main > .hero')){
  const style=document.createElement('style');style.textContent=`
.hero{min-height:72vh;padding-top:5rem;padding-bottom:4rem}
.hero-copy{max-width:900px}
.hero h1{font-size:clamp(3.2rem,6vw,6.6rem);line-height:.92;margin:.65rem 0 1.15rem}
.hero h1 em{display:block;max-width:27ch;margin-top:.35em;font-size:.43em;line-height:1.05;letter-spacing:-.035em;color:rgba(189,195,255,.94)}
.hero-deck{max-width:680px}
.actions{margin-top:1.4rem}
@media(max-width:700px){.hero{min-height:68vh;padding-top:4rem;padding-bottom:3rem}.hero h1{font-size:clamp(2.8rem,13vw,4.6rem)}.hero h1 em{max-width:22ch;font-size:.48em;line-height:1.08}.hero-deck{line-height:1.5}.actions{margin-top:1.2rem}}
`;document.head.appendChild(style);

  document.querySelectorAll('.world h2').forEach((heading)=>{
    if(heading.textContent.trim()==='The orchestra never stopped evolving.') heading.textContent='What happens when the orchestra plugs in?';
    if(heading.textContent.trim()==='Rock survives when the song is stronger than the costume.') heading.textContent='Big riffs. Real hooks. No interest in standing still.';
  });

  const credit=document.querySelector('.credit-note');
  if(credit){
    const eyebrow=credit.querySelector('.eyebrow');
    const title=credit.querySelector('h2');
    const body=credit.querySelector('p:not(.eyebrow)');
    const link=credit.querySelector('a');
    if(eyebrow) eyebrow.textContent='How the music was made';
    if(title) title.textContent='Some songs come back differently.';
    if(body) body.textContent='Some releases preserve the original recording. Others rebuild the same composition with different instruments, performers, or production methods. The release notes explain the details when they matter.';
    if(link){link.textContent='Explore release notes';link.setAttribute('href','/#releases');}
  }

  document.querySelector('.authorship')?.remove();
}

const footer=document.querySelector('.footer');
if(footer){
  footer.innerHTML=`
    <div class="footer-credit">
      <strong>Star Splitter Records</strong>
      <p>Original music by Jeff Hines (BMI), released through distinct artist projects. Human composition, lyrics, and creative direction, with AI-assisted production where appropriate.</p>
      <p>Part of the Star Splitter Records catalog—original music for tomorrow’s soundtracks, playlists, and sonic futures.</p>
      <a href="mailto:starsplitterrecords@outlook.com">starsplitterrecords@outlook.com</a>
    </div>
    <div class="footer-bottom"><span>© 2026 Star Splitter Records</span></div>`;
  const footerStyle=document.createElement('style');
  footerStyle.textContent=`
.footer{display:block;padding:3.5rem max(1.5rem,5vw) 2rem}
.footer-credit{max-width:760px}
.footer-credit strong{display:block;margin-bottom:1rem;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase}
.footer-credit p{margin:.45rem 0;max-width:70ch;line-height:1.65}
.footer-credit a{display:inline-block;margin-top:.8rem;color:inherit;text-underline-offset:.22em}
.footer-bottom{margin-top:2.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.12);font-size:.78rem;opacity:.72}
@media(max-width:700px){.footer{padding-top:2.75rem}.footer-credit p{line-height:1.55}}
`;
  document.head.appendChild(footerStyle);
}
