---
title: RSS 피드도 이미 만들어지고 있었다 — rss() 함수와 RSS 2.0 스펙 비교
date: 2026-10-07
description: 이 블로그의 build.mjs에 있는 rss() 함수가 실제로 만드는 RSS 2.0 피드를 공식 스펙의 필수/선택 항목과 하나씩 대조합니다.
tags: [블로그, 빌드, RSS]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 글을 쓰게 된 구체적인 계기 추가 (RSS가 궁금해진 상황 — 예: 다른 블로그를 RSS 리더에 등록하다가 내 블로그도 피드가 있는지 궁금해진 건지, 아니면 이전 글의 소재 목록에 적어뒀던 걸 지금 와서 확인한 건지)
- [ ] 실제로 피드 리더(Feedly, 이노리더 등)나 온라인 RSS 밸리데이터(validator.w3.org/feed 등)에 `https://jjh391.github.io/rss.xml`을 등록해서 정상적으로 읽히는지 직접 확인
- [ ] 글을 21편 이상 썼을 때 `slice(0, 20)` 때문에 오래된 글이 피드에서 빠지는 걸 실제로 겪었는지 (아직이라면 그 사실도)
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

지난 소재 목록에 "RSS 피드를 직접 만들어보기"를 적어뒀는데, `build.mjs`를 열어보니 `sitemap.xml`과 마찬가지로 이미 `rss()` 함수가 있었습니다. 그래서 새로 만드는 대신 지금 코드가 RSS 2.0 스펙을 얼마나 지키고 있는지 확인했습니다.

## rss() 함수

`build.mjs`의 240번째 줄부터 있습니다.

```js
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
```

`sitemap.xml`을 쓰는 바로 다음 줄에서 `rss.xml`도 같이 쓰기 때문에, `node build.mjs`를 돌릴 때마다 자동으로 새로 생성됩니다.

## RSS 2.0 스펙의 필수 항목과 대조

[rssboard.org의 RSS 2.0 명세](https://www.rssboard.org/rss-2-0-7)에 따르면 `<channel>`에서 필수인 요소는 세 개뿐입니다: `title`, `link`, `description`.

이 세 개는 전부 `site.config.json`의 값으로 채워집니다.

```json
{
  "title": "기능사 공부 기록",
  "tagline": "프로그래밍기능사 실기를 준비하며 막힌 것과 푼 것을 그때그때 적습니다.",
  "baseUrl": "https://jjh391.github.io"
}
```

| channel 요소 | 스펙상 필수 여부 | 이 블로그의 값 |
| --- | --- | --- |
| title | 필수 | `config.title` ("기능사 공부 기록") |
| link | 필수 | `config.baseUrl` |
| description | 필수 | `config.tagline` |
| language | 선택 | `ko` 고정값 |

`<item>` 쪽은 스펙이 조금 다릅니다. 모든 item 요소가 선택이지만, **title 또는 description 중 적어도 하나는 있어야 한다**는 조건이 붙습니다. 이 블로그의 `rss()`는 title과 description을 둘 다 넣기 때문에 이 조건은 항상 만족합니다.

| item 요소 | 스펙상 필수 여부 | 이 블로그에서 쓰는지 |
| --- | --- | --- |
| title | 둘 중 하나 필수 | 사용 |
| description | 둘 중 하나 필수 | 사용 |
| link | 선택 | 사용 |
| guid | 선택 | 사용 (`isPermaLink="true"`) |
| pubDate | 선택 | 사용 |
| author, category, comments, enclosure, source | 선택 | 미사용 |

## pubDate 형식

스펙은 pubDate를 RFC 822 형식으로 요구합니다. 예시로 `Sat, 07 Sep 2002 00:00:01 GMT` 같은 형태를 듭니다.

코드는 `new Date(p.date + 'T09:00:00+09:00').toUTCString()`로 값을 만듭니다. frontmatter의 `date`는 `2026-10-07` 같은 날짜만 있는 값인데, 여기에 한국 시간 오전 9시(`+09:00`)를 붙인 다음 `toUTCString()`으로 변환합니다. 결과는 UTC 자정이 됩니다.

실제로 빌드해서 생성된 `docs/rss.xml`의 한 항목은 이렇게 나왔습니다.

```xml
<item>
  <title>GitHub Pages로 돈 안 쓰고 블로그 만들기</title>
  <link>https://jjh391.github.io/posts/github-pages-blog/</link>
  <guid isPermaLink="true">https://jjh391.github.io/posts/github-pages-blog/</guid>
  <pubDate>Mon, 28 Sep 2026 00:00:00 GMT</pubDate>
  <description>티스토리나 워드프레스 대신 GitHub Pages에 정적 블로그를 올리는 방법. 정적 사이트를 고른 이유와 실제로 드는 비용을 정리합니다.</description>
</item>
```

`toUTCString()`이 만드는 형식이 스펙이 요구하는 RFC 822 형식과 일치합니다.

## 20개로 자르는 이유

`posts.slice(0, 20)`이 있어서 피드에는 최신 글 20편까지만 들어갑니다. `posts` 배열이 날짜 내림차순으로 정렬돼 있으므로 21번째로 오래된 글부터는 피드에서 빠집니다. `sitemap.xml`과 달리 RSS 피드는 전체 글 목록이 아니라 "최근 글 구독"이 목적이라 이 제한 자체는 스펙 위반이 아닙니다. RSS 2.0 명세에도 item 개수 제한에 대한 규정은 없습니다.

draft 글은 `loadPosts()` 단계에서 이미 걸러지기 때문에 `rss()`에 넘어오는 `posts` 배열에는 애초에 포함되지 않습니다. 실제로 지금 draft가 아닌 글은 2편뿐이라, 빌드해보면 `docs/rss.xml`에도 항목이 2개만 들어 있습니다.

## 빠져 있는 것

- `author` — 글쓴이 정보를 담는 요소. `site.config.json`에 `author: "JJH391"` 값이 있지만 `rss()` 함수에서는 쓰이지 않습니다.
- `category` — 글의 태그를 RSS category로 넣는 요소. frontmatter의 `tags` 값이 있지만 역시 쓰이지 않습니다.
- `lastBuildDate`, `ttl` — channel 수준의 선택 요소로, 둘 다 없습니다.

전부 선택 요소라 스펙 위반은 아니지만, title·link·description만으로 최소 조건을 맞춘 형태입니다.

## 정리

- `rss.xml`은 `sitemap.xml`과 같은 지점에서, `node build.mjs`를 돌릴 때마다 자동으로 다시 만들어진다
- channel의 필수 요소(title, link, description) 세 개는 모두 채워져 있다
- item은 title과 description을 둘 다 넣어서 "둘 중 하나는 필수"라는 스펙 조건을 만족한다
- pubDate는 RFC 822 형식에 맞게 `toUTCString()`으로 생성된다
- 피드에는 최신 글 20편까지만 들어가고, draft 글은 애초에 제외된다
- author, category, lastBuildDate, ttl 같은 선택 요소는 쓰이지 않는다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
