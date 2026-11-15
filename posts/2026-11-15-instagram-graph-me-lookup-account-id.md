---
title: Meta 개발자 대시보드에서 토큰은 나오는데 인스타 숫자 ID가 안 보일 때
date: 2026-11-15
description: Instagram API 액세스 토큰을 발급받았는데 대시보드에 계정의 숫자 ID가 표시되지 않던 문제를, /me 엔드포인트 조회로 해결한 과정을 정리했습니다.
tags: [Instagram, API, 자동화]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 작업이 릴스 자동 게시 프로젝트의 어느 단계였는지 배경을 본인 말로 추가 (토큰은 있는데 IG_ID를 못 구해서 막혔던 상황인지 등)
- [ ] "앱에 사람을 추가하세요" 창에서 실제로 어떤 화면/버튼 순서였는지 본인이 본 그대로 다시 확인해서 설명 보강 (스크린샷 캡처 없이 기억으로 정리한 부분이라 재확인 권장)
- [ ] user_id / account_type이 Meta 공식 User 노드 레퍼런스 문서에 정식 필드로 나열되어 있는지 직접 한 번 더 확인 — 이 글은 "/me 엔드포인트가 fields 파라미터로 User 노드를 조회한다"는 문서 사실과, 실제로 요청해서 로그로 확인한 응답값을 근거로 썼습니다. 공식 필드 목록 페이지를 못 찾아서 교차 확인이 안 된 부분입니다
- [ ] 이 과정에서 들었던 생각과 결론 작성 (현재는 비워둠)
-->

Instagram 콘텐츠 게시 API를 쓰려면 계정의 숫자 ID(`IG_ID`)가 필요합니다. 그런데 Meta 개발자 대시보드에서 액세스 토큰을 발급받는 화면에는 토큰 문자열만 보이고, 계정의 숫자 ID는 따로 표시되지 않았습니다. 확인한 과정을 정리합니다.

## 토큰을 받기까지

개발 모드로 등록된 앱이라, 토큰을 받기 전에 계정을 테스터로 추가하는 절차가 먼저 필요했습니다.

1. 대시보드의 "액세스 토큰 생성" 화면에서 "계정 추가"를 누름
2. "앱에 사람을 추가하세요" 창이 뜸 → **Instagram 테스터** 역할로 계정을 추가
3. Instagram 쪽에서 초대를 수락 (웹의 `accounts/manage_access` → 테스터 초대 수락)
4. 수락 후 대시보드에서 토큰 생성

## 토큰만 보이고 숫자 ID가 없음

토큰 생성이 끝나면 화면에는 토큰 문자열만 표시됩니다. 게시 API 호출에 필요한 계정의 숫자 ID는 이 화면에 따로 나오지 않았습니다.

## /me 엔드포인트로 조회

Instagram Platform API의 `/me` 엔드포인트는 요청에 담긴 액세스 토큰을 보고 그 토큰을 발급한 사용자가 누구인지 찾아서, 해당 사용자 ID로 User 노드를 조회해 줍니다. 읽기만 지원하고 생성/수정/삭제는 지원하지 않습니다. 요청 형식은 다음과 같습니다.

```
GET https://graph.instagram.com/v26.0/me?fields={fields}&access_token={access-token}
```

이 토큰으로 `fields=user_id,username,account_type`을 담아 호출하도록 게시 스크립트를 수정했습니다.

```python
_, me = http("GET", "https://graph.instagram.com/me", dict(fields="user_id,username,account_type", access_token=token))
ig_id = me.get("user_id") or me.get("id")
```

응답을 로그로 찍어 확인한 결과, `username`, `user_id`, `account_type`(값은 `MEDIA_CREATOR`)이 모두 담겨 있었습니다. `user_id` 값을 게시 API가 요구하는 `IG_ID`로 그대로 사용했습니다.

## 정리

- 개발 모드 앱에서는 토큰 생성 전에 계정을 Instagram 테스터로 추가하고 초대를 수락하는 절차가 먼저 필요하다.
- 대시보드의 토큰 생성 화면은 토큰만 보여주고, 계정의 숫자 ID는 표시하지 않는다.
- `/me` 엔드포인트에 `fields=user_id,username,account_type`을 담아 호출하면, 토큰을 발급한 계정의 `user_id`를 직접 구할 수 있다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
