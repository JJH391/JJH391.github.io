---
title: sitemap.xml은 어느 순간에 자동으로 만들어지는가 — build.mjs 코드로 확인한 것
date: 2026-10-05
description: 이 블로그의 build.mjs가 빌드할 때마다 sitemap.xml을 어떻게 만들어내는지, 어떤 URL이 포함되고 어떤 필드는 빠지는지 코드 기준으로 정리합니다.
tags: [블로그, 빌드, sitemap]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 글을 쓰게 된 계기를 서두에 추가 (sitemap.xml 자동 생성이 궁금해진 구체적인 상황 — 예: 검색엔진 등록 작업을 하다가 sitemap.xml을 실제로 열어봤는지, 아니면 이전 글에서 "sitemap.xml을 빌드할 때 자동으로 만들기"를 소재로 적어뒀다가 지금 와서 코드를 확인한 건지)
- [ ] 실제로 `node build.mjs`를 돌려서 `docs/sitemap.xml` 파일을 직접 열어봤는지, 그 안의 URL 목록이 본문 설명과 맞는지 확인
- [ ] Google Search Console이나 네이버 서치어드바이저에 이 sitemap.xml을 실제로 제출했는지, 제출했다면 어떻게 됐는지 (아직 안 했다면 그 사실도)
- [ ] `lastmod` 값이 실제로 바뀌는 걸 본 적이 있는지 (글에 `updated` 필드를 넣어서 날짜를 바꿔본 적이 있는지)
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

지난 글감 목록에 "sitemap.xml을 빌드할 때 자동으로 만들기"를 적어뒀는데, `build.mjs`를 열어보니 이미 만들어져 있었습니다. 그래서 새로 만드는 대신 지금 코드가 정확히 어떻게 동작하는지를 확인했습니다.

## 만들어지는 지점

`build()` 함수 안에서 각 글과 태그 페이지를 다 쓴 다음, 아래 줄에서 `sitemap.xml`을 씁니다.

```js
await writeFile(path.join(OUT_DIR, 'sitemap.xml'), sitemap(posts, tags));
await writeFile(path.join(OUT_DIR, 'rss.xml'), rss(posts));
await writeFile(path.join(OUT_DIR, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`);
```

별도 명령이나 스크립트가 있는 게 아니라, `node build.mjs`를 실행할 때마다(로컬이든 GitHub Actions 배포든) 매번 새로 생성됩니다. `docs/` 폴더를 지우고 다시 만드는 빌드 과정 안에 포함돼 있어서, sitemap만 따로 갱신하거나 깜빡 잊고 안 만드는 경우가 구조적으로 없습니다.

## sitemap() 함수가 포함하는 URL

```js
function sitemap(posts, tags) {
  const urls = [
    { loc: config.baseUrl + '/', lastmod: posts[0]?.date },
    ...posts.map(p => ({ loc: `${config.baseUrl}/posts/${p.slug}/`, lastmod: p.updated || p.date })),
    ...[...tags.keys()].map(t => ({ loc: `${config.baseUrl}/tags/${tagSlug(t)}/` })),
  ];
  ...
}
```

세 종류의 주소가 들어갑니다.

1. **홈 페이지** (`/`) — `lastmod`는 가장 최근 글의 날짜. `posts` 배열이 날짜 내림차순으로 정렬돼 있어서 `posts[0]`이 최신 글입니다.
2. **각 글 페이지** (`/posts/슬러그/`) — `lastmod`는 frontmatter의 `updated` 값이 있으면 그걸 쓰고, 없으면 `date`를 씁니다.
3. **태그 페이지** (`/tags/태그슬러그/`) — `lastmod` 없이 주소만 들어갑니다.

draft 글은 이 목록에 들어가지 않습니다. `loadPosts()` 단계에서 이미 걸러진 `posts` 배열을 받아서 쓰기 때문입니다.

## 빠져 있는 것들

sitemap 표준에는 `lastmod` 외에도 `changefreq`(갱신 빈도)와 `priority`(우선순위) 필드가 있지만, 이 코드는 둘 다 쓰지 않습니다. `<url>` 태그 안에 `<loc>`과, 있을 때만 `<lastmod>`만 들어갑니다.

```js
${urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
```

404 페이지는 sitemap 목록에 없습니다. `notFoundPage()`로 따로 만들어지지만 `urls` 배열에는 추가되지 않습니다.

## robots.txt와의 연결

sitemap.xml을 쓴 바로 다음 줄에서 `robots.txt`를 쓰는데, 그 안에 sitemap 위치를 적어둡니다.

```
User-agent: *
Allow: /

Sitemap: https://jjh391.github.io/sitemap.xml
```

검색엔진이 `robots.txt`를 먼저 읽고 거기 적힌 `Sitemap:` 줄을 따라가 sitemap.xml을 찾아가는 경로입니다. 두 파일이 같은 빌드 단계에서 연달아 만들어지기 때문에 주소가 어긋날 일은 없습니다.

## 정리

- `sitemap.xml`은 별도 작업이 아니라 `node build.mjs`를 돌릴 때마다 자동으로 다시 만들어진다
- 홈, 글 각각, 태그 페이지 주소가 들어가고, draft 글은 빠진다
- 글의 `lastmod`은 frontmatter의 `updated`가 있으면 그 값, 없으면 `date`를 쓴다
- `changefreq`, `priority` 필드는 쓰지 않는다
- `robots.txt`가 `Sitemap:` 줄로 `sitemap.xml` 위치를 가리킨다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
