---
title: 태그 페이지는 이미 자동으로 만들어지고 있었다 — tagPage()와 슬러그 인코딩 확인
date: 2026-10-11
description: 이 블로그의 build.mjs가 처음부터 태그별 페이지를 자동으로 생성하고 있었다는 것을, tagPage() 함수와 실제 빌드 결과물로 확인합니다. 한글 태그가 URL과 폴더명에서 각각 다르게 처리되는 지점도 같이 봤습니다.
tags: [블로그, 빌드, 태그]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 글을 쓰게 된 계기 추가 (소재 목록에 "태그별 페이지를 자동으로 만들기"를 적어뒀던 게 언제였는지, 그리고 지금 와서 코드를 열어본 이유)
- [ ] 본문의 `node build.mjs` 실행 결과(태그 5개, docs/tags/ 폴더 구조)를 본인 컴퓨터에서도 직접 돌려서 같은지 확인
- [ ] 실제 배포된 사이트(jjh391.github.io/tags/블로그/ 같은 한글 주소)에 접속해서 한글 태그 페이지가 실제로 뜨는지 확인 — 로컬 빌드 결과만으로는 GitHub Pages에서도 똑같이 동작하는지 알 수 없음
- [ ] "태그를 전부 모아 보여주는 /tags/ 색인 페이지가 없다"는 부분에 대해 — 이걸 다음 소재로 남길지, 아니면 지금 바로 만들지 본인이 결정
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

소재 목록에 "태그별 페이지를 자동으로 만들기"를 적어뒀는데, `build.mjs`를 열어보니 이미 만들어져 있었습니다. `git log`로 확인해보니 이 기능은 블로그를 처음 세운 2026-09-28 커밋(`블로그 틀 세우기`)에 처음 글 두 편과 같이 들어가 있었고, 그 뒤로 한 번도 수정되지 않았습니다. 그래서 새로 만드는 대신 지금 코드가 정확히 어떻게 동작하는지 확인했습니다.

## 태그 페이지를 만드는 부분

`build()` 함수 안에서 모든 글을 쓴 다음, 글들의 `tags` 배열을 모아 태그별로 묶습니다.

```js
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
```

별도 명령이 있는 게 아니라 글 목록을 순회하면서 태그를 모으고, 태그마다 `docs/tags/슬러그/index.html`을 씁니다. 글이 draft면 `loadPosts()` 단계에서 이미 걸러지기 때문에, draft 글에만 달린 태그는 태그 페이지 자체가 생기지 않습니다.

## 태그 페이지의 내용

```js
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
```

제목은 "태그명 글 모음", 본문은 해당 태그가 붙은 글들의 카드 목록입니다. `postCard()`를 그대로 재사용하기 때문에 홈 화면의 글 카드와 모양이 똑같습니다.

지금(draft 글 제외) 실제로 `node build.mjs`를 돌려보면 공개된 글이 2편이라 태그는 5개(`블로그`, `GitHub`, `정적사이트`, `애드센스`, `수익화`)가 생기고, `docs/tags/` 아래 폴더 5개가 각각 생성됩니다.

```
docs/tags/github/
docs/tags/블로그/
docs/tags/수익화/
docs/tags/애드센스/
docs/tags/정적사이트/
```

## 슬러그 처리: URL에서는 인코딩, 폴더명에서는 디코딩

`tagSlug` 함수는 이렇게 생겼습니다.

```js
const tagSlug = t => encodeURIComponent(String(t).trim().toLowerCase().replace(/\s+/g, '-'));
```

소문자로 바꾸고 공백을 하이픈으로 바꾼 다음 `encodeURIComponent`를 적용합니다. 그런데 폴더를 만들 때는 이 결과를 다시 `decodeURIComponent`로 되돌립니다.

```js
const dir = path.join(OUT_DIR, 'tags', decodeURIComponent(tagSlug(tag)));
```

인코딩하고 바로 디코딩하면 결과적으로 원래 문자열(소문자·하이픈 처리만 된 상태)로 돌아오기 때문에, 실제 폴더 이름은 한글이면 한글 그대로입니다. 반면 글 카드의 태그 링크(`postCard()`, `tagPage()`)와 `sitemap.xml`은 인코딩된 상태를 그대로 씁니다.

```js
p.tags.map(t => `<a class="tag" href="/tags/${tagSlug(t)}/">${esc(t)}</a>`)
```

직접 빌드해서 비교해보면 차이가 보입니다.

- 폴더명: `docs/tags/블로그/` (한글 그대로)
- 링크 주소: `/tags/%EB%B8%94%EB%A1%9C%EA%B7%B8/` (퍼센트 인코딩)
- `sitemap.xml`에 들어가는 주소도 동일하게 `https://jjh391.github.io/tags/%EB%B8%94%EB%A1%9C%EA%B7%B8/`

영문 태그(`GitHub`)는 인코딩해도 바뀌는 문자가 없어서 폴더명과 링크 주소가 둘 다 `github`로 같게 보입니다. 한글 태그에서만 폴더명과 링크 주소의 표기가 달라지는 셈입니다. 폴더명과 URL 경로가 겉보기엔 다른 문자열이지만, 웹 서버가 요청 경로의 퍼센트 인코딩을 디코딩해서 파일 시스템 경로와 맞춰주는 걸 전제로 동작하는 구조입니다.

## 모든 태그를 모아 보는 색인 페이지는 없다

개별 태그 페이지(`/tags/블로그/`)는 만들어지지만, 태그 전체 목록을 보여주는 `/tags/index.html` 같은 페이지는 없습니다. 실제로 빌드해봐도 `docs/tags/` 바로 아래에는 `index.html`이 없고, 태그별 하위 폴더만 있습니다.

지금 태그 페이지에 들어가는 유일한 경로는 글 카드에 붙은 태그 링크를 클릭하는 것입니다. 태그 이름을 모르는 상태에서 "이 블로그에 어떤 태그들이 있는지" 둘러볼 방법은 없습니다.

## 정리

- 태그별 페이지(`/tags/태그명/`)는 블로그를 세운 첫 커밋부터 이미 자동으로 만들어지고 있었다
- `build()`가 공개된 글들의 `tags`를 모아 태그마다 `tagPage()`로 페이지를 쓴다
- draft 글에만 붙은 태그는 페이지가 생기지 않는다
- `tagSlug`는 인코딩하지만 폴더를 만들 때는 디코딩해서 되돌리기 때문에, 폴더명은 한글 그대로고 링크·sitemap 주소는 퍼센트 인코딩된 형태다 — 영문 태그는 둘이 같아 보이지만 한글 태그는 겉보기 표기가 다르다
- 태그 전체를 모아 보여주는 색인 페이지(`/tags/index.html`)는 없고, 개별 태그 페이지로 가는 경로는 글 카드의 태그 링크뿐이다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
