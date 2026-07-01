const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const query = (selector) => document.querySelector(selector);

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 }) : null;

function observeReveals(root = document) {
  root.querySelectorAll('.reveal:not(.visible)').forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('visible');
  });
}

observeReveals();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') { event.preventDefault(); return; }
    const target = query(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const currentPage = document.body.dataset.page;
if (currentPage) query(`[data-nav="${currentPage}"]`)?.classList.add('active');

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-category]').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  });
});

function tagHTML(tags = []) {
  return tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('');
}

function renderHomeProjects(projects) {
  const root = query('[data-project-featured]');
  if (!root) return;
  root.innerHTML = projects.filter((item) => item.featured !== false).slice(0, 4).map((project, index) => `
    <a class="quest reveal" href="project.html?id=${encodeURIComponent(project.id)}">
      <div class="quest-num">Q.0${index + 1}</div>
      <div class="quest-main"><div class="tag-row">${tagHTML(project.tags)}</div><h3>${escapeHTML(project.title)} <small>${escapeHTML(project.zh)}</small></h3><p>${escapeHTML(project.short || project.summary)}</p></div>
      <div class="quest-arrow">↗</div>
    </a>`).join('');
  observeReveals(root);
}

function renderProjectLibrary(projects) {
  const root = query('[data-project-library]');
  if (!root) return;
  root.innerHTML = projects.map((project, index) => `
    <a class="library-project tone-${escapeHTML(project.tone || 'lime')} reveal${index % 2 ? ' delay-1' : ''}" data-category="${escapeHTML(project.category)}" href="project.html?id=${encodeURIComponent(project.id)}">
      <span class="project-no">P.${String(index + 1).padStart(2, '0')}</span>
      <div class="project-art">${escapeHTML(project.mark || '↗')}<span>↗</span></div>
      <div class="tag-row">${tagHTML(project.tags)}</div>
      <h2>${escapeHTML(project.title)}<small>${escapeHTML(project.zh)}</small></h2>
      <p>${escapeHTML(project.short || project.summary)}</p>
    </a>`).join('');
  observeReveals(root);
}

function sortedArticles(articles) {
  return [...articles].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function renderHomeJournal(articles) {
  const root = query('[data-journal-featured]');
  if (!root) return;
  const visualClasses = ['visual-one', 'visual-two', 'visual-three'];
  root.innerHTML = sortedArticles(articles).filter((item) => item.featured !== false).slice(0, 3).map((article, index) => `
    <article class="log-card reveal${index ? ` delay-${Math.min(index, 2)}` : ' featured'}">
      <div class="log-visual ${visualClasses[index % visualClasses.length]}"><span>${escapeHTML(article.day)}</span><i></i><b>${escapeHTML(article.month)}</b></div>
      <div class="log-content"><p>${escapeHTML(article.type)} · ${escapeHTML(article.readTime)} <small>${escapeHTML(article.typeZh)}</small></p><h3>${escapeHTML(article.title)}<small>${escapeHTML(article.zh)}</small></h3><a href="article.html?post=${encodeURIComponent(article.id)}">Read entry <small>阅读文章</small> →</a></div>
    </article>`).join('');
  observeReveals(root);
}

function renderJournalArchive(articles) {
  const root = query('[data-journal-archive]');
  if (!root) return;
  root.innerHTML = sortedArticles(articles).map((article) => `
    <a class="archive-row reveal" href="article.html?post=${encodeURIComponent(article.id)}">
      <div class="archive-date"><strong>${escapeHTML(article.day)}</strong><span>${escapeHTML(article.month)}<br />${escapeHTML(String(article.date).slice(0, 4))}</span></div>
      <div class="archive-type">${escapeHTML(article.type)}<small>${escapeHTML(article.typeZh)} · ${escapeHTML(article.readTime)}</small></div>
      <div class="archive-title"><h2>${escapeHTML(article.title)}</h2><p>${escapeHTML(article.zh)}</p></div><span class="archive-arrow">↗</span>
    </a>`).join('');
  const count = query('[data-journal-count]');
  if (count) count.textContent = String(articles.length).padStart(2, '0');
  observeReveals(root);
}

function renderProjectDetail(projects) {
  const root = query('[data-project-detail]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const data = projects.find((item) => item.id === id) || projects[0];
  if (!data) return;
  document.title = `${data.title} — LEVEL UP LAB`;
  query('[data-project-title]').textContent = data.title;
  query('[data-project-zh]').textContent = data.zh;
  query('[data-project-summary]').textContent = data.summary;
  query('[data-project-type]').textContent = data.type;
  query('[data-project-track]').textContent = data.track;
  query('[data-project-mark]').textContent = data.mark || '↗';
  query('[data-project-one-line]').textContent = data.oneLine;
  query('[data-project-question]').textContent = data.question;
  query('[data-project-result]').textContent = data.result;
  query('[data-project-output]').textContent = data.output;
  query('[data-project-lessons]').textContent = data.lessons;
  query('[data-project-tags]').innerHTML = tagHTML(data.tags);
  query('[data-project-process]').innerHTML = (data.process || []).map((step, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHTML(step)}</p></div>`).join('');
  query('.project-cover').style.setProperty('--detail-accent', data.accent || '#c8ff48');
  const nextData = projects.find((item) => item.id === data.next) || projects[(projects.indexOf(data) + 1) % projects.length];
  const next = query('[data-next-project]');
  next.href = `project.html?id=${encodeURIComponent(nextData.id)}`;
  query('[data-next-title]').textContent = data.nextTitle || nextData.title;
}

function renderArticleDetail(articles) {
  const root = query('[data-article-detail]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('post');
  const data = articles.find((item) => item.id === id) || articles[0];
  if (!data) return;
  document.title = `${data.title} — LEVEL UP LAB`;
  query('[data-article-title]').textContent = data.title;
  query('[data-article-zh]').textContent = data.zh;
  query('[data-article-meta]').textContent = `${data.type} · ${data.day} ${data.month} ${String(data.date).slice(0, 4)} · ${data.readTime} READ`;
  query('[data-article-deck]').textContent = data.deck;
  const mark = query('[data-article-mark]');
  mark.textContent = data.day;
  mark.style.background = data.accent || '#c8ff48';
  query('[data-article-body]').innerHTML = (data.sections || []).map((section, index) => `<section><span>${String(index + 1).padStart(2, '0')}</span><h2>${escapeHTML(section.title)}</h2><p>${escapeHTML(section.en)}</p><p lang="zh-CN">${escapeHTML(section.zh)}</p></section>`).join('');
}

async function loadPublishedContent() {
  const [projectResponse, articleResponse] = await Promise.all([
    fetch('content/projects.json', { cache: 'no-store' }),
    fetch('content/articles.json', { cache: 'no-store' })
  ]);
  if (!projectResponse.ok || !articleResponse.ok) throw new Error('Published content could not be loaded.');
  const [{ projects }, { articles }] = await Promise.all([projectResponse.json(), articleResponse.json()]);
  renderHomeProjects(projects || []);
  renderProjectLibrary(projects || []);
  renderHomeJournal(articles || []);
  renderJournalArchive(articles || []);
  renderProjectDetail(projects || []);
  renderArticleDetail(articles || []);
}

loadPublishedContent().catch((error) => {
  console.error(error);
  document.documentElement.classList.add('content-load-error');
});
