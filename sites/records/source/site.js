
const menu=document.querySelector('.menu-button');const nav=document.querySelector('.site-nav');if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}
const filters=document.querySelectorAll('[data-filter]');const cards=document.querySelectorAll('[data-categories]');filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(card=>card.hidden=f!=='all'&&!card.dataset.categories.includes(f));}));
