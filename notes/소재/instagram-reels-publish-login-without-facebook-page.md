# 인스타 릴스 자동 게시: Instagram Login 방식은 페이스북 페이지 없이 되지만 영상은 공개 URL이어야 한다

- **한 줄 요약**: Instagram API(Instagram Login)로 릴스를 올리려면 프로페셔널 계정 + 공개 video_url이 필요하고, 페이스북 페이지는 필요 없다
- **무엇이 있었나**: 공식 문서 Content Publishing 확인.
  - Instagram Login: 페이지 연결 불필요, 권한 `instagram_business_basic`, `instagram_business_content_publish`, 호스트 `graph.instagram.com`.
  - 흐름: `POST /<IG_ID>/media`(media_type=REELS, video_url) → `GET /<컨테이너ID>?fields=status_code` (1분 간격, 5분 이내 권장) → `POST /<IG_ID>/media_publish`(creation_id).
  - 게시 한도: 문서에 24시간 100개라고 되어 있으나 같은 문서의 캐러셀 부분에는 50개로 적혀 있어 서로 다름.
  - 토큰 갱신: `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=...` — 발급 24시간 이후부터, 갱신 시 60일.
- **해결/결론**: 영상 공개 주소는 공개 GitHub 저장소 + GitHub Pages(`https://<user>.github.io/<repo>/v/epNN.mp4`)로 만들고, 게시 후 파일 삭제.
- **참고**: https://developers.facebook.com/docs/instagram-platform/content-publishing , https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token
