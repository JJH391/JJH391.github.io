import { readFile, writeFile, readdir, mkdir, rm, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'docs');
const SRC_DIR = path.join(ROOT, 'src');

const config = JSON.parse(await readFile(path.join(ROOT, 'site.config.json'), 'utf8'));

marked.setOptions({ mangle: false, headerIds: true, headerPrefix: '' });

// ---------- helpers ----------

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Minimal frontmatter reader: `key: value` lines, plus `tags: [a, b]`. */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let [, key, value] = kv;
    value = value.trim().replace(/^["'](.*)["']$/, '$1');
    if (/^\[.*\]$/.test(value)) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["'](.*)["']$/, '$1')).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
    } else {
      data[key] = value;
    }
  }
  return { data, body: raw.slice(m[0].length) };
}

/** First ~160 chars of prose, for meta description when none is given. */
function autoDescription(body) {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 157) + (text.length > 157 ? '…' : '');
}

const fmtDate = iso => {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

const tagSlug = t => encodeURIComponent(String(t).trim().toLowerCase().replace(/\s+/g, '-'));

// ---------- load posts ----------

async function loadPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = (await readdir(POSTS_DIR)).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of files) {
    const raw = await readFile(path.join(POSTS_DIR, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);

    const slugFromName = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const dateFromName = (file.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1];
    const date = data.date || dateFromName;

    if (!date) {
      console.warn(`  ! ${file}: 날짜가 없어 건너뜁니다 (파일명을 2026-09-28-제목.md 형태로 하거나 frontmatter에 date를 넣으세요)`);
      continue;
    }
    // DRAFTS=1 node build.mjs  → 초안까지 포함해서 미리보기
    const showDrafts = process.env.DRAFTS === '1';
    if (data.draft === true && !showDrafts) {
      console.log(`  - ${file} (draft, 건너뜀)`);
      continue;
    }

    posts.push({
      slug: data.slug || slugFromName,
      title: data.title || slugFromName,
      date,
      description: data.description || autoDescription(body),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      updated: data.updated || null,
      html: marked.parse(body),
      file,
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  return posts;
}

// ---------- templates ----------

function layout({ title, description, canonical, body, jsonLd, isHome = false }) {
  const fullTitle = isHome ? config.title : `${title} · ${config.title}`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="${esc(config.title)}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="application/rss+xml" title="${esc(config.title)}" href="${config.baseUrl}/rss.xml">
<link rel="stylesheet" href="/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="site-header">
  <a class="site-title" href="/">${esc(config.title)}</a>
  <p class="site-tagline">${esc(config.tagline)}</p>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <p>${esc(config.author)} · <a href="/rss.xml">RSS</a></p>
</footer>
</body>
</html>
`;
}

function postCard(p) {
  return `<article class="card">
  <h2><a href="/posts/${esc(p.slug)}/">${esc(p.title)}</a></h2>
  <p class="meta"><time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time>${
    p.tags.length ? ' · ' + p.tags.map(t => `<a class="tag" href="/tags/${tagSlug(t)}/">${esc(t)}</a>`).join(' ') : ''
  }</p>
  <p class="excerpt">${esc(p.description)}</p>
</article>`;
}

function homePage(posts) {
  const body = posts.length
    ? `<div class="list">${posts.map(postCard).join('\n')}</div>`
    : `<p class="empty">아직 올린 글이 없습니다.</p>`;
  return layout({
    title: config.title,
    description: config.tagline,
    canonical: config.baseUrl + '/',
    isHome: true,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: config.title,
      description: config.tagline,
      url: config.baseUrl + '/',
      inLanguage: 'ko-KR',
      author: { '@type': 'Person', name: config.author },
    },
  });
}

function postPage(p) {
  const url = `${config.baseUrl}/posts/${p.slug}/`;
  const body = `<article class="post">
  <h1>${esc(p.title)}</h1>
  <p class="meta"><time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time>${
    p.updated ? ` · ${esc(fmtDate(p.updated))} 고침` : ''
  }${p.tags.length ? ' · ' + p.tags.map(t => `<a class="tag" href="/tags/${tagSlug(t)}/">${esc(t)}</a>`).join(' ') : ''}</p>
  <div class="prose">
${p.html}
  </div>
  <p class="back"><a href="/">← 글 목록</a></p>
</article>`;
  return layout({
    title: p.title,
    description: p.description,
    canonical: url,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      inLanguage: 'ko-KR',
      mainEntityOfPage: url,
      author: { '@type': 'Person', name: config.author },
      keywords: p.tags.join(', '),
    },
  });
}

function tagPage(tag, posts) {
  return layout({
    title: `${tag} 글 모음`,
    description: `${tag} 태그가 붙은 글 ${posts.length}편.`,
    canonical: `${config.baseUrl}/tags/${tagSlug(tag)}/`,
    body: `<h1 class="page-title">${esc(tag)}</h1>
<div class="list">${posts.map(postCard).join('\n')}</div>
<p class="back"><a href="/">← 글 목록</a></p>`,
  });
}

function notFoundPage() {
  return layout({
    title: '없는 쪽입니다',
    description: '요청한 주소를 찾지 못했습니다.',
    canonical: config.baseUrl + '/404.html',
    body: `<h1 class="page-title">없는 쪽입니다</h1>
<p class="empty">주소가 바뀌었거나 지워진 글일 수 있습니다.</p>
<p class="back"><a href="/">← 글 목록</a></p>`,
  });
}

function sitemap(posts, tags) {
  const urls = [
    { loc: config.baseUrl + '/', lastmod: posts[0]?.date },
    ...posts.map(p => ({ loc: `${config.baseUrl}/posts/${p.slug}/`, lastmod: p.updated || p.date })),
    ...[...tags.keys()].map(t => ({ loc: `${config.baseUrl}/tags/${tagSlug(t)}/` })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

function rss(posts) {
  const items = posts.slice(0, 20).map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${config.baseUrl}/posts/${esc(p.slug)}/</link>
      <guid isPermaLink="true">${config.baseUrl}/posts/${esc(p.slug)}/</guid>
      <pubDate>${new Date(p.date + 'T09:00:00+09:00').toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
    <title>${esc(config.title)}</title>
    <link>${config.baseUrl}/</link>
    <description>${esc(config.tagline)}</description>
    <language>ko</language>
${items}
</channel></rss>
`;
}

// ---------- build ----------

async function build() {
  const posts = await loadPosts();

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  await writeFile(path.join(OUT_DIR, 'index.html'), homePage(posts));
  await writeFile(path.join(OUT_DIR, '404.html'), notFoundPage());

  for (const p of posts) {
    const dir = path.join(OUT_DIR, 'posts', p.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), postPage(p));
  }

  const tags = new Map();
  for (const p of posts) for (const t of p.tags) {
    if (!tags.has(t)) tags.set(t, []);
    tags.get(t).push(p);
  }
  for (const [tag, list] of tags) {
    const dir = path.join(OUT_DIR, 'tags', decodeURIComponent(tagSlug(tag)));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), tagPage(tag, list));
  }

  await writeFile(path.join(OUT_DIR, 'sitemap.xml'), sitemap(posts, tags));
  await writeFile(path.join(OUT_DIR, 'rss.xml'), rss(posts));
  await writeFile(path.join(OUT_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`);
  // Stops GitHub Pages from running the output through Jekyll.
  await writeFile(path.join(OUT_DIR, '.nojekyll'), '');
  await cp(path.join(SRC_DIR, 'style.css'), path.join(OUT_DIR, 'style.css'));

  console.log(`\n지은 것: 글 ${posts.length}편, 태그 ${tags.size}개 → docs/`);
  if (!posts.length) console.log('posts/ 에 마크다운 파일을 넣으면 여기 잡힙니다.');
}

await build();
