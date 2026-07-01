const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const query = (selector) => document.querySelector(selector);

const trackMeta = {
  english: { label: 'English', zh: '英语', category: 'english', accent: '#c8ff48' },
  ai: { label: 'Artificial Intelligence', zh: '人工智能', category: 'ai', accent: '#7657ff' },
  media: { label: 'Digital Media', zh: '数字媒体', category: 'media', accent: '#ff623e' },
  business: { label: 'Business', zh: '商业', category: 'business', accent: '#67d7ff' }
};

const colorAccents = { lime: '#c8ff48', purple: '#7657ff', blue: '#67d7ff', orange: '#ff623e' };

function slugify(value = '') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'entry';
}

function cleanMarkdown(value = '') {
  return String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function sectionsFromMarkdown(body = '', reflection = '', nextStep = '') {
  const chunks = String(body).trim().split(/\n(?=##?\s+)/).filter(Boolean);
  const sections = chunks.map((chunk, index) => {
    const lines = chunk.trim().split('\n');
    const heading = lines[0].match(/^##?\s+(.+)/);
    return {
      title: heading ? heading[1].trim() : index === 0 ? 'Journal note' : `Part ${index + 1}`,
      en: cleanMarkdown((heading ? lines.slice(1) : lines).join('\n')),
      zh: ''
    };
  }).filter((section) => section.en);
  if (reflection) sections.push({ title: 'Reflection / 复盘反思', en: cleanMarkdown(reflection), zh: '' });
  if (nextStep) sections.push({ title: 'Next Step / 下一步', en: cleanMarkdown(nextStep), zh: '' });
  return sections.length ? sections : [{ title: 'Journal note', en: 'This entry is being updated.', zh: '这篇日志正在更新中。' }];
}

function normalizeProject(project) {
  if (!project.basic) return project;
  const basic = project.basic || {};
  const card = project.card || {};
  const content = project.content || {};
  const meta = trackMeta[basic.track] || trackMeta.english;
  const tools = Array.isArray(content.tools) ? content.tools : [];
  return {
    id: basic.slug || slugify(basic.title),
    title: basic.title || 'Untitled Project',
    zh: basic.zh || '',
    summary: card.summary || '',
    short: card.summary || '',
    type: `${meta.label} Project`,
    track: meta.label,
    category: meta.category,
    mark: card.mark || '↗',
    accent: colorAccents[card.color] || meta.accent,
    tone: card.color || 'lime',
    oneLine: content.objective || card.summary || '',
    question: content.objective || '',
    process: content.process || [],
    result: content.result || '',
    output: tools.join(' · ') || 'Project notes',
    lessons: [content.learned, content.nextStep ? `Next: ${content.nextStep}` : ''].filter(Boolean).join(' '),
    tags: basic.tags || [],
    featured: basic.featured !== false,
    body: project.body || ''
  };
}

function normalizeArticle(article) {
  if (article.sections) return article;
  const date = String(article.date || '');
  const [, month = '01', day = '01'] = date.split('-');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const meta = trackMeta[article.track] || trackMeta.english;
  const wordCount = String(article.body || '').trim().split(/\s+/).filter(Boolean).length;
  return {
    id: slugify(article.title),
    title: article.title || 'Untitled Entry',
    zh: article.zh || '',
    date,
    day,
    month: months[Math.max(0, Number(month) - 1)],
    type: meta.label.toUpperCase(),
    typeZh: meta.zh,
    readTime: `${Math.max(1, Math.ceil(wordCount / 180))} MIN`,
    deck: article.summary || '',
    accent: meta.accent,
    featured: true,
    tags: article.tags || [],
    sections: sectionsFromMarkdown(article.body, article.reflection, article.nextStep)
  };
}

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


document.querySelectorAll('.nav-toggle').forEach((button) => {
  const header = button.closest('.nav');
  const nav = header?.querySelector('nav');
  if (!header || !nav) return;

  const closeMenu = () => {
    header.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
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

function publicationOrder(articles) {
  return [...articles];
}

function renderHomeJournal(articles) {
  const root = query('[data-journal-featured]');
  if (!root) return;
  const visualClasses = ['visual-one', 'visual-two', 'visual-three'];
  root.innerHTML = publicationOrder(articles).filter((item) => item.featured !== false).slice(0, 3).map((article, index) => `
    <article class="log-card reveal${index ? ` delay-${Math.min(index, 2)}` : ' featured'}">
      <div class="log-visual ${visualClasses[index % visualClasses.length]}"><span>${escapeHTML(article.day)}</span><i></i><b>${escapeHTML(article.month)}</b></div>
      <div class="log-content"><p>${escapeHTML(article.type)} · ${escapeHTML(article.readTime)} <small>${escapeHTML(article.typeZh)}</small></p><h3>${escapeHTML(article.title)}<small>${escapeHTML(article.zh)}</small></h3><a href="article.html?post=${encodeURIComponent(article.id)}">Read entry <small>阅读文章</small> →</a></div>
    </article>`).join('');
  observeReveals(root);
}

function renderJournalArchive(articles) {
  const root = query('[data-journal-archive]');
  if (!root) return;
  root.innerHTML = publicationOrder(articles).map((article) => `
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
  const normalizedProjects = (projects || []).map(normalizeProject);
  const normalizedArticles = (articles || []).map(normalizeArticle);
  renderHomeProjects(normalizedProjects);
  renderProjectLibrary(normalizedProjects);
  renderHomeJournal(normalizedArticles);
  renderJournalArchive(normalizedArticles);
  renderProjectDetail(normalizedProjects);
  renderArticleDetail(normalizedArticles);
}

loadPublishedContent().catch((error) => {
  console.error(error);
  document.documentElement.classList.add('content-load-error');
});
