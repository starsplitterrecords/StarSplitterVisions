
const menu=document.querySelector('.menu-button');const nav=document.querySelector('.site-nav');if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}
const filters=document.querySelectorAll('[data-filter]');const cards=document.querySelectorAll('[data-categories]');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(card=>card.hidden=f!=='all'&&!card.dataset.categories.includes(f));}));
if(document.querySelector('main > .hero')){const style=document.createElement('style');style.textContent=`
.hero{min-height:72vh;padding-top:5rem;padding-bottom:4rem}
.hero-copy{max-width:900px}
.hero h1{font-size:clamp(3.2rem,6vw,6.6rem);line-height:.92;margin:.65rem 0 1.15rem}
.hero h1 em{display:block;max-width:27ch;margin-top:.35em;font-size:.43em;line-height:1.05;letter-spacing:-.035em;color:rgba(189,195,255,.94)}
.hero-deck{max-width:680px}
.actions{margin-top:1.4rem}
@media(max-width:700px){.hero{min-height:68vh;padding-top:4rem;padding-bottom:3rem}.hero h1{font-size:clamp(2.8rem,13vw,4.6rem)}.hero h1 em{max-width:22ch;font-size:.48em;line-height:1.08}.hero-deck{line-height:1.5}.actions{margin-top:1.2rem}}
`;document.head.appendChild(style);}
