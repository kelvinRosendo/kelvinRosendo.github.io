const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.site-header').classList.toggle('menu-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.click(); menu.focus();
  }
});
const progress = document.querySelector('.reading-progress');
let scheduled = false;
addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    scheduled = false;
  });
}, {passive:true});
const copy = document.querySelector('[data-copy-email]');
copy?.addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(copy.dataset.copyEmail);
    status.textContent = 'E-mail copiado.';
  } catch {
    status.textContent = 'Copie o endereço exibido acima.';
  }
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:0.08});
  document.querySelectorAll('.work-card,.selected-work,.capability,.case-section,.stack-item').forEach(element => {
    element.classList.add('will-reveal'); observer.observe(element);
  });
}
if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.case-toc a')];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) links.forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), {rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('.case-section').forEach(section => observer.observe(section));
}

const archiveList = document.getElementById('archive-list');
if (archiveList) {
  const items = [...archiveList.querySelectorAll('.archive-item')];
  const form = document.querySelector('.explorer-controls');
  const search = document.getElementById('project-search');
  const kind = document.getElementById('project-kind');
  const sort = document.getElementById('project-sort');
  const status = document.querySelector('.explorer-status');
  const pager = document.getElementById('archive-pagination');
  const previous = pager.querySelector('[data-previous]');
  const next = pager.querySelector('[data-next]');
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  if ([...kind.options].some(option => option.value === params.get('kind'))) kind.value = params.get('kind');
  if ([...sort.options].some(option => option.value === params.get('sort'))) sort.value = params.get('sort');
  let page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  function render(updateUrl = true) {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    const matches = items.filter(item => terms.every(term => normalize(item.dataset.search).includes(term)) &&
      (kind.value === 'all' || (kind.value === 'fork' ? item.dataset.fork === 'true' : item.dataset.kind === kind.value)));
    matches.sort((a,b) => sort.value === 'default' ? Number(a.dataset.index)-Number(b.dataset.index) :
      a.dataset.name.localeCompare(b.dataset.name,'pt-BR') * (sort.value === 'za' ? -1 : 1));
    const pageCount = Math.max(1, Math.ceil(matches.length / 6));
    page = Math.min(page, pageCount);
    const visible = matches.slice((page-1)*6,page*6);
    items.forEach(item => {item.hidden = !visible.includes(item);});
    matches.forEach(item => archiveList.appendChild(item));
    status.textContent = matches.length ? `${matches.length} repositórios encontrados · exibindo ${(page-1)*6+1} a ${Math.min(page*6,matches.length)}.` : 'Nenhum repositório encontrado.';
    document.getElementById('empty-state').hidden = matches.length > 0;
    pager.hidden = pageCount <= 1;
    previous.disabled = page === 1;
    next.disabled = page === pageCount;
    pager.querySelector('[data-page-status]').textContent = `Página ${page} de ${pageCount}`;
    if (updateUrl) {
      const query = new URLSearchParams();
      if (search.value.trim()) query.set('q',search.value.trim());
      if (kind.value !== 'all') query.set('kind',kind.value);
      if (sort.value !== 'default') query.set('sort',sort.value);
      if (page > 1) query.set('page',String(page));
      history.replaceState(null,'',location.pathname+(query.size?'?'+query:''));
    }
  }
  search.addEventListener('input',()=>{page=1;render();});
  [kind,sort].forEach(control=>control.addEventListener('change',()=>{page=1;render();}));
  form.addEventListener('submit',event=>{event.preventDefault();page=1;render();});
  form.addEventListener('reset',()=>{setTimeout(()=>{page=1;render();search.focus();},0);});
  previous.addEventListener('click',()=>{page--;render();archiveList.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});});
  next.addEventListener('click',()=>{page++;render();archiveList.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});});
  render(false);
}
