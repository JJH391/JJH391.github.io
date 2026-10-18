# 소재함

자동 초안 작업이 매번 읽는 파일입니다. 위에서부터 안 쓴 것을 골라 글로 만들고, 쓰고 나면 `쓴 것`으로 옮깁니다.

소재는 한 줄이면 충분합니다. **막혔던 것 / 찾아본 것 / 헷갈렸던 것**이면 뭐든 글이 됩니다. 정답까지 안 적어도 됩니다 — 막혔다는 사실 자체가 글감입니다.

## 안 쓴 것

- 이동 검증을 도착점만 하면 벽·함정을 뛰어넘을 수 있는 것 — 경로 전체가 아니라 좌표만 검사했던 것 (상세: `notes/소재/movement-path-validation-bypass.md`)
- 작업증명(PoW) 난이도를 토큰 서명에 넣어야 하는 이유 — 난이도별 토큰 바꿔치기·재사용을 막는 법 (상세: `notes/소재/pow-difficulty-in-token-signature.md`)
- D1 배치에서 `changes()`로 "새로 들어갔을 때만 지급" 만들기 — 멱등 정산 크론 (상세: `notes/소재/d1-batch-changes-idempotent-payout.md`)
- 한국 시간 기준 "이번 달"의 시작·끝을 UTC 타임스탬프로 구하기 (상세: `notes/소재/kst-month-boundary-utc.md`)
- wrangler가 갑자기 "non-interactive environment" 에러를 낸 이유 — logout 후 비대화형 실행 (상세: `notes/소재/wrangler-non-interactive-login-error.md`)
- 공개 관제실 숫자 대부분이 내 테스트 트래픽이었던 것 — 자체 점검 표시를 비밀 헤더로 분리한 것 (상세: `notes/소재/selftest-header-exclude-from-public-stats.md`)
- Durable Object에서 예전 웹소켓을 close(4001) 했는데 로컬 테스트에서 닫힘 이벤트가 안 왔던 것 (상세: `notes/소재/durable-object-close-4001-local-test.md`)
- 샌드박스에서 yt-dlp로 인스타 릴스가 안 받아질 때, 브라우저 안에서 원본 mp4 주소 뽑기 — DASH 조각 URL에서 bytestart/byteend 제거 (상세: `notes/소재/instagram-reels-dash-fragment-to-full-mp4.md`)
- 인스타 페이지의 video 요소를 다른 위치로 옮겼더니 화면이 검게 나온 이유 — MSE blob 버퍼 분리 (상세: `notes/소재/instagram-video-element-move-mse-black-screen.md`)
- 숨겨진 탭에서 video.play()가 AbortError로 실패하고 requestAnimationFrame이 멈춘 문제 (상세: `notes/소재/hidden-tab-video-play-abort-raf-stall.md`)
- Pillow에서 Noto Sans CJK .ttc로 한국어 글꼴 고르기 — index 파라미터 (상세: `notes/소재/pillow-noto-sans-cjk-ttc-index.md`)
- 무료 오프라인 한국어 TTS(sherpa-onnx + Supertonic 3)와 화자 번호 남녀 구분하기 — 기본 주파수 실측 (상세: `notes/소재/sherpa-onnx-supertonic-korean-tts-speaker-gender.md`)
- pip으로 Blender(bpy) 설치해 헤드리스 3D 렌더링 — CPU 렌더 시간 실측 (상세: `notes/소재/pip-bpy-blender-headless-render-cpu-time.md`)
- 인스타 릴스 자동 게시: Instagram Login 방식은 페이스북 페이지 없이 되지만 영상은 공개 URL이어야 하는 것 (상세: `notes/소재/instagram-reels-publish-login-without-facebook-page.md`)
- Meta 개발자 대시보드에서 토큰은 나오는데 인스타 숫자 ID가 안 보일 때 — /me 조회로 해결 (상세: `notes/소재/instagram-graph-me-lookup-account-id.md`)
- GitHub Actions에서 fine-grained PAT로 다른 저장소에 push할 때 "Invalid username or token" 났던 것 (상세: `notes/소재/github-actions-fine-grained-pat-push-invalid-token.md`)
- GitHub Actions cron으로 "3일마다" 실행하기, ubuntu-latest 환경 변경 공지 (상세: `notes/소재/github-actions-cron-every-3-days-ubuntu-migration.md`)

## 쓴 것

- 2026-09-28 — GitHub Pages로 0원 블로그 만들기 → `posts/2026-09-28-github-pages-blog.md`
- 2026-09-28 — 애드센스 연령 요건 알아본 것 → `posts/2026-09-28-adsense-age.md`
- 2026-09-28 — GitHub Actions로 Pages 배포할 때 Source를 "GitHub Actions"로 바꿔야 하는 것 → `posts/2026-09-28-github-actions-pages-source.md`
- 2026-09-30 — git push가 403으로 막혔던 것, 저장소 생성과 앱 권한은 별개인 것 → `posts/2026-09-30-git-push-403-app-permission.md`
- 2026-10-02 — 배포는 성공했는데 사이트는 옛날 내용이 보이던 것 (캐시, ?v=2로 확인) → `posts/2026-10-02-github-pages-cache-busting.md`
- 2026-10-04 — frontmatter의 draft 플래그로 글 숨기기 — 빌드 스크립트에서 어떻게 걸러내나 → `posts/2026-10-04-draft-flag-build-filter.md`
- 2026-10-05 — sitemap.xml을 빌드할 때 자동으로 만들기 — build.mjs 코드로 확인 → `posts/2026-10-05-sitemap-auto-generation.md`
- 2026-10-07 — RSS 피드를 직접 만들어보기 — 생각보다 형식이 단순함 → `posts/2026-10-07-rss-feed-format.md`
- 2026-10-09 — 마크다운 frontmatter를 라이브러리 없이 파싱하기 — 정규식 파서를 직접 테스트해서 되는/안 되는 경우 확인 → `posts/2026-10-09-frontmatter-regex-parser-edge-cases.md`
- 2026-10-11 — 태그별 페이지를 자동으로 만들기 — build.mjs에 이미 있던 tagPage()와 슬러그 인코딩/디코딩 확인 → `posts/2026-10-11-tag-page-auto-generation.md`
- 2026-10-14 — 캔버스 애니메이션이 첫 프레임에서 멈춰 단서 화면이 비었던 버그, open() 인자 평가 순서가 원인 → `posts/2026-10-14-canvas-animate-first-frame-stop.md`
- 2026-10-16 — element.append(null)이 화면에 "null" 글자를 찍는 것, ParentNode.append()의 문자열 변환 동작 → `posts/2026-10-16-append-null-renders-text.md`
- 2026-10-18 — 서버 권위 게임인데도 웹소켓 메시지에 정답이 실려 있던 문제, 화면 그릴 재료와 정답을 안 나눠서 생긴 것 → `posts/2026-10-18-websocket-answer-leak.md`

## 글이 되는 것 / 안 되는 것

| 대화에서 나온 말 | 글이 되나 |
| --- | --- |
| "이 에러 났는데 왜 이러지" | 된다 — 남도 똑같이 검색한다 |
| "이 개념이 헷갈려" | 된다 — 헷갈리는 지점이 곧 검색어다 |
| "이거 찾는 데 한참 걸렸어" | 된다 — 제일 좋은 글감 |
| "오늘 급식 맛있었다" | 안 된다 — 글의 톤으로만 |
| 친구 이야기, 남 이야기 | 안 쓴다 |
