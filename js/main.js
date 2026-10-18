// ОБЛОЖКИ КНИГ: укажите путь к своему изображению для каждой книги.
const BOOK_COVER_IMAGES = {
  'kosmicheskaya-odisseya': 'images/cover-kosmicheskaya-odisseya.jpg',
  'zametki-o-zhizni': 'images/cover-zametki-o-zhizni.jpg',
  'novaya-istoriya': 'images/cover-novaya-istoriya.jpg'
};
document.querySelectorAll('.book-cover[data-cover-id]').forEach(cover => {
  const src = BOOK_COVER_IMAGES[cover.dataset.coverId];
  if (!src) return;
  const img = new Image(); img.className = 'book-cover-image'; img.alt = 'Обложка книги';
  img.onload = () => { cover.classList.add('has-image'); cover.prepend(img); };
  img.src = src;
});

// Разделы сайта
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.tab));
  window.scrollTo({ top: document.querySelector('.tabs-wrap').offsetTop, behavior: 'smooth' });
}));

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function parseMarkdownFile(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta = {};
  let body = markdown;
  if (match) {
    match[1].split(/\r?\n/).forEach(line => {
      const m = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
      if (!m) return;
      let value = m[2].trim();
      try { value = JSON.parse(value); } catch (_) { value = value.replace(/^['"]|['"]$/g, ''); }
      meta[m[1]] = value;
    });
    body = match[2];
  }
  return {...meta, body: markdownToHTML(body)};
}
function markdownToHTML(markdown) {
  // First escape all HTML so Markdown posts cannot inject arbitrary markup.
  const escaped = escapeHTML(markdown.replace(/\r/g, ''));
  const blocks = escaped.trim().split(/\n\s*\n/).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^\s*[-*+]\s+/.test(line))) return '<ul>' + lines.map(line => '<li>' + inlineMarkdown(line.replace(/^\s*[-*+]\s+/, '')) + '</li>').join('') + '</ul>';
    if (lines.every(line => /^\s*\d+\.\s+/.test(line))) return '<ol>' + lines.map(line => '<li>' + inlineMarkdown(line.replace(/^\s*\d+\.\s+/, '')) + '</li>').join('') + '</ol>';
    if (lines.every(line => /^\s*&gt;\s?/.test(line))) return '<blockquote><p>' + lines.map(line => inlineMarkdown(line.replace(/^\s*&gt;\s?/, ''))).join('<br>') + '</p></blockquote>';
    const heading = block.match(/^(#{1,4})\s+([\s\S]*)$/);
    if (heading) { const level = Math.min(4, heading[1].length); return '<h' + level + '>' + inlineMarkdown(heading[2]) + '</h' + level + '>'; }
    return '<p>' + inlineMarkdown(block.replace(/\n/g, ' ')) + '</p>';
  }).join('\n');
}
function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
async function loadPosts() {
  const grid = document.getElementById('blogGrid');
  const blogList = document.querySelector('.blog-list');
  const articleView = document.getElementById('articleView');
  try {
    const indexResponse = await fetch('content/posts/index.json');
    if (!indexResponse.ok) throw new Error('Не удалось загрузить список Markdown-записей');
    const index = await indexResponse.json();
    const files = Array.isArray(index.posts) ? index.posts : [];
    const loaded = await Promise.all(files.map(async file => {
      // Only allow simple file names from the local posts folder.
      if (typeof file !== 'string' || !/^[a-zA-Z0-9_-]+\.md$/.test(file)) return null;
      const response = await fetch('content/posts/' + file);
      if (!response.ok) return null;
      return parseMarkdownFile(await response.text());
    }));
    const posts = loaded.filter(Boolean);
    if (!posts.length) {
      grid.innerHTML = '<div class="blog-empty">Здесь пока нет записей. Добавь Markdown-файл в <code>content/posts</code> и внеси его имя в <code>index.json</code>.</div>';
      return;
    }
    grid.innerHTML = posts.map((post, index) => '<button class="blog-card" data-post="' + index + '"><div class="blog-card-top"><span>' + escapeHTML(post.category || 'Заметки') + '</span><span>' + escapeHTML(post.date || '') + '</span></div><h3>' + escapeHTML(post.title || 'Без названия') + '</h3><p>' + escapeHTML(post.lead || '') + '</p><div class="blog-card-bottom"><span>Читать запись</span><span class="blog-arrow">↗</span></div></button>').join('');
    function openPost(index) {
      const post = posts[index]; if (!post) return;
      document.getElementById('articleMeta').textContent = (post.category || 'Заметки') + ' · ' + (post.date || '');
      document.getElementById('articleTitle').textContent = post.title || '';
      const lead = document.getElementById('articleLead');
      lead.textContent = post.lead || ''; lead.hidden = !post.lead;
      document.getElementById('articleBody').innerHTML = post.body || '';
      blogList.classList.add('hidden'); articleView.classList.add('open');
    }
    grid.querySelectorAll('.blog-card').forEach(card => card.addEventListener('click', () => openPost(Number(card.dataset.post))));
    document.getElementById('articleBack').addEventListener('click', () => { articleView.classList.remove('open'); blogList.classList.remove('hidden'); });
  } catch (error) {
    console.warn('Не удалось загрузить Markdown-записи блога.', error);
    grid.innerHTML = '<div class="blog-empty">Не удалось загрузить записи. Проверь файлы в <code>content/posts</code> и список <code>index.json</code>.</div>';
  }
}
loadPosts();

// Фильтры и просмотр изображений галерей
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.photo-card')];
const photoCards = cards.filter(card => card.closest('#photos'));
const drawingCards = cards.filter(card => card.closest('#drawings'));
filters.forEach(filter => filter.addEventListener('click', () => {
  filters.forEach(item => item.classList.toggle('active', item === filter));
  photoCards.forEach(card => { card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter; });
}));
const lightbox = document.getElementById('lightbox');
const artTarget = document.getElementById('lightboxArt');
const caption = document.getElementById('lightboxCaption');
let currentPhotoIndex = 0, lightboxCards = photoCards;
function visibleCards() { return lightboxCards.filter(card => !card.hidden); }
function showPhoto(index) {
  const visible = visibleCards(); if (!visible.length) return;
  currentPhotoIndex = (index + visible.length) % visible.length;
  const card = visible[currentPhotoIndex];
  const art = card.querySelector('svg'); if (art) artTarget.innerHTML = art.outerHTML;
  caption.textContent = (card.dataset.title || 'Фотография') + ' · ' + (currentPhotoIndex + 1) + ' из ' + visible.length;
}
function openPhoto(card) {
  lightboxCards = card.closest('#drawings') ? drawingCards : photoCards;
  lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; showPhoto(visibleCards().indexOf(card));
}
cards.forEach(card => card.addEventListener('click', () => openPhoto(card)));
document.getElementById('prevPhoto').addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
document.getElementById('nextPhoto').addEventListener('click', () => showPhoto(currentPhotoIndex + 1));
function closeBox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; artTarget.innerHTML = ''; }
document.getElementById('closeLightbox').addEventListener('click', closeBox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeBox(); });
document.addEventListener('keydown', event => { if (!lightbox.classList.contains('open')) return; if (event.key === 'Escape') closeBox(); if (event.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1); if (event.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1); });

document.querySelectorAll('.book .download').forEach(link => link.addEventListener('click', event => {
  if (link.dataset.ready === 'true') { delete link.dataset.ready; return; }
  event.preventDefault(); const book = link.closest('.book'); book.classList.add('opening');
  window.setTimeout(() => { book.classList.remove('opening'); link.dataset.ready = 'true'; link.click(); }, 720);
}));
