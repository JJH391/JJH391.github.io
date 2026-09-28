# 기능사 공부 기록

프로그래밍기능사 실기를 준비하며 막힌 것과 푼 것을 적는 블로그. 전부 무료로 굴러갑니다.

## 이게 어떻게 돌아가나

```
posts/2026-09-28-제목.md   ← 글은 여기에만 쓴다
        ↓  git push
GitHub Actions 가 build.mjs 실행
        ↓
docs/ 에 HTML 생성 → GitHub Pages 가 서빙
```

`posts/` 안의 마크다운만 건드리면 됩니다. `docs/`는 자동 생성물이라 직접 고칠 일이 없습니다.

## 글 쓰는 법

`posts/` 에 `YYYY-MM-DD-슬러그.md` 로 파일을 만들고 맨 위에 이렇게 씁니다.

```markdown
---
title: 글 제목
date: 2026-09-28
description: 검색 결과에 뜰 한 줄 요약. 비워두면 본문 앞부분을 자동으로 씁니다.
tags: [기능사, C언어]
draft: false
---

본문을 여기서부터.
```

- `draft: true` 면 빌드에서 빠집니다. 다 쓸 때까지 올려두기 좋습니다.
- `date` 를 빼면 파일 이름 앞의 날짜를 씁니다.
- 글을 고쳤으면 `updated: 2026-10-05` 를 넣으면 "고침" 표시가 붙습니다.

**휴대폰에서 고치기**: GitHub 앱이나 웹에서 `posts/` 의 md 파일을 열어 연필 아이콘으로 고치고 커밋하면, 1~2분 뒤 사이트에 반영됩니다. 이게 주간 검수 동선입니다.

## 처음 한 번만 하는 설정

1. 이 저장소를 GitHub에 올립니다.
2. **Settings → Pages → Source** 를 `GitHub Actions` 로 바꿉니다.
3. **Actions** 탭에서 워크플로가 초록불인지 확인합니다.
4. 주소가 `https://<아이디>.github.io/` 로 열리면 끝. `site.config.json` 의 `baseUrl` 이 그 주소와 같은지 확인하세요.

그 다음 [Google Search Console](https://search.google.com/search-console)과 [네이버 서치어드바이저](https://searchadvisor.naver.com/)에 사이트를 등록하고 `sitemap.xml` 을 제출합니다. 이걸 해야 검색에 잡히기 시작합니다.

## 로컬에서 미리 보기

```bash
npm install
npm run build     # docs/ 생성
npm run serve     # http://localhost:8080
```

## 글에 쓰지 않는 것

공개 웹에 남고, 지워도 검색 캐시에는 한동안 남습니다. 그래서 처음부터 안 씁니다.

- 친구·선생님의 실명, 그리고 특정 가능한 별칭
- 학교 이름, 반, 사는 동네
- 남이 한 말이나 남의 사생활
- 몇 년 뒤 면접에서 보여도 곤란하지 않을 것만

## AI 도움을 밝히는 문제

초안은 AI가 쓰고 사람이 고치는 구조입니다. 구글이 벌점을 주는 건 *AI를 썼다는 사실*이 아니라 *사람 손을 안 탄 대량 생산물*입니다. 그러니 초안을 그대로 올리지 말고, 실제로 겪은 것과 틀린 부분을 반드시 손보세요. 그 손질이 이 블로그가 살아남는 유일한 이유입니다.

푸터나 소개 글에 한 줄로 밝혀두면 읽는 사람에게도 정직하고 본인에게도 안전합니다.
