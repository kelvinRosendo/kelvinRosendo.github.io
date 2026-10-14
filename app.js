const buttons = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
buttons.forEach(button => button.addEventListener('click', () => {
  buttons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  projects.forEach(project => {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
  });
  document.getElementById('filter-status').textContent = `${projects.filter(project => !project.hidden).length} projetos exibidos.`;
}));
document.getElementById('year').textContent = new Date().getFullYear();
