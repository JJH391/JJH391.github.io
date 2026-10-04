---
title: frontmatter의 draft 플래그로 글 숨기기 — 빌드 스크립트가 정확히 거르는 지점
date: 2026-10-04
description: 이 블로그의 build.mjs가 frontmatter의 draft 값을 어떻게 읽고, 어느 지점에서 글을 걷어내는지, 그리고 draft인 글을 로컬에서 미리 보는 방법을 코드 기준으로 정리합니다.
tags: [블로그, 빌드, frontmatter]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 글을 쓰게 된 계기를 서두에 추가 (draft 플래그가 정확히 어떻게 동작하는지 궁금했던 구체적인 상황 — 예: 어떤 글을 쓰다가, 또는 지금까지 쓴 draft 글들을 보다가 궁금해졌는지)
- [ ] 본문에 나온 대로 실제로 `DRAFTS=1 node build.mjs`를 로컬에서 돌려봤는지, 돌려보니 설명한 대로 동작했는지 (화면에 뭐가 나왔는지, 콘솔 로그가 어떻게 보였는지)
- [ ] 지금까지 쌓인 draft 글 여러 개를 실제로 관리해보면서 헷갈렸거나 불편했던 점이 있었는지 (있다면 구체적으로)
- [ ] "draft 글도 git/GitHub 저장소 자체에는 그대로 보인다"는 부분에 대해 본인이 신경 쓰이는 부분이 있는지 (저장소가 공개되어 있다는 점과 관련해서)
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

이 블로그는 `posts/` 폴더에 쌓이는 마크다운 파일을 `node build.mjs`가 읽어서 `docs/` 폴더에 정적 HTML로 지어내는 구조입니다. 지금까지 쓴 글 중 여러 편이 frontmatter에 `draft: true`를 달고 있는데, 이 값이 정확히 어느 코드에서 어떻게 처리되는지를 `build.mjs`를 직접 읽어서 확인했습니다.

## frontmatter는 어떻게 읽히는가

이 프로젝트는 별도 라이브러리 없이 `build.mjs` 안의 `parseFrontmatter` 함수로 frontmatter를 직접 파싱합니다. `---`로 둘러싸인 블록에서 `key: value` 형태의 줄을 하나씩 읽는데, 값이 문자열 그대로 `"true"` 또는 `"false"`면 불리언으로 바꿔줍니다.

```js
} else if (value === 'true' || value === 'false') {
  data[key] = value === 'true';
}
```

그래서 frontmatter에 `draft: true`라고 적으면 `data.draft`는 문자열 `"true"`가 아니라 실제 불리언 `true`로 들어갑니다. `draft: TRUE`나 `draft: "true"`처럼 대소문자가 다르거나 따옴표가 붙은 경우는 이 조건에 안 걸려서 불리언으로 변환되지 않을 수 있다는 점도 코드를 보면 알 수 있습니다.

## 걸러내는 지점

글 목록을 만드는 `loadPosts` 함수 안에 실제 필터링 코드가 있습니다.

```js
// DRAFTS=1 node build.mjs  → 초안까지 포함해서 미리보기
const showDrafts = process.env.DRAFTS === '1';
if (data.draft === true && !showDrafts) {
  console.log(`  - ${file} (draft, 건너뜀)`);
  continue;
}
```

조건은 두 가지가 동시에 맞을 때만 글을 건너뜁니다.

1. frontmatter의 `draft`가 정확히 불리언 `true`일 것
2. 환경변수 `DRAFTS`가 `'1'`이 아닐 것

`continue`로 건너뛰기 때문에, 이 글은 `posts` 배열에 들어가지 않습니다. 이후 홈 페이지 목록, 개별 글 페이지, 태그 페이지, `sitemap.xml`, `rss.xml`을 만드는 코드는 전부 이 `posts` 배열을 기준으로 동작하므로, 한 번 걸러진 글은 빌드 결과물 어디에도 나타나지 않습니다.

## 로컬에서 draft를 미리 보는 방법

코드에 적힌 주석 그대로, 환경변수 `DRAFTS`를 `1`로 주고 빌드하면 draft 글도 포함해서 `docs/`를 만듭니다.

```
DRAFTS=1 node build.mjs
```

`package.json`에는 이 환경변수를 자동으로 붙여주는 전용 스크립트(예: `npm run preview`)가 따로 정의되어 있지 않습니다. 현재 등록된 스크립트는 `build`, `serve`, `serve:only` 세 가지뿐이고, 이 중 `DRAFTS=1`을 붙여 쓰려면 위 명령을 직접 입력하거나 `DRAFTS=1 npm run build`처럼 앞에 붙여서 실행해야 합니다.

## 실제 배포(GitHub Actions)에는 draft가 절대 안 들어간다

`.github/workflows/deploy.yml`을 보면 빌드 단계는 다음 한 줄입니다.

```yaml
- run: node build.mjs
```

`DRAFTS` 환경변수를 설정하는 부분이 없습니다. 즉 `main` 브랜치에 push될 때마다 돌아가는 배포 빌드는 항상 `showDrafts`가 `false`인 상태로 실행되고, `draft: true`가 붙은 글은 실제 사이트(`jjh391.github.io`)에는 절대 나타나지 않습니다.

## 다만 저장소 자체에는 그대로 보인다

`draft` 플래그가 막는 것은 **빌드 결과물에 포함되는 것**뿐입니다. 마크다운 파일 자체는 `posts/` 폴더에 git으로 커밋되고 push되기 때문에, 저장소가 공개 저장소라면 GitHub 웹에서 그 파일을 그대로 열어볼 수 있습니다. 빌드된 사이트에는 안 보이지만, 저장소 커밋 내역이나 `posts/` 폴더를 직접 들어가서 보면 draft 글의 전체 내용과 작성 시점이 그대로 드러난다는 뜻입니다.

## 정리

- `draft: true`는 frontmatter 파서가 불리언 `true`로 변환했을 때만 걸러지는 조건으로 인식된다
- `build.mjs`의 `loadPosts` 함수가 `posts` 배열을 만드는 단계에서 걸러내므로, 홈 목록·개별 페이지·태그 페이지·sitemap·RSS 전부에서 한 번에 빠진다
- 로컬에서 draft까지 보고 싶으면 `DRAFTS=1 node build.mjs`로 직접 실행해야 한다 (전용 npm 스크립트는 없음)
- GitHub Actions 배포 워크플로는 `DRAFTS`를 설정하지 않으므로 실제 사이트에는 draft 글이 올라가지 않는다
- 단, 저장소가 공개라면 draft 마크다운 파일 자체는 GitHub 저장소에서 그대로 보인다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
