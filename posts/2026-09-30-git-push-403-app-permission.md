---
title: git push가 403으로 막힐 때 — 저장소 생성과 앱 권한은 별개였다
date: 2026-09-30
description: 저장소는 분명히 있는데 git push가 403으로 거부되는 경우, GitHub App의 저장소 접근 권한이 계정 권한과 별도로 관리된다는 점을 공식 문서 기준으로 정리합니다.
tags: [GitHub, git, 트러블슈팅]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 실제로 403을 만난 상황을 서두에 추가 (어떤 작업 중이었는지, 어떤 도구/앱으로 push를 시도했는지)
- [ ] 그때 터미널/화면에 떴던 에러 메시지를 그대로 인용 (지금 본문의 예시 문구는 GitHub 공식 문서 기준 일반적인 형태이며, 실제로 본 메시지와 다를 수 있음)
- [ ] "저장소는 만들었는데 앱 권한이 따로였다"는 게 본인 경우 정확히 어떤 상황이었는지 서술 (어떤 앱이었는지, 저장소를 누가/어떻게 만들었는지)
- [ ] 권한을 추가한 뒤 실제로 해결됐는지, 추가로 헷갈렸던 부분이 있었는지
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

저장소가 이미 존재하고 로그인도 되어 있는데 `git push`가 거부되는 경우가 있습니다. 이럴 때 뜨는 에러는 보통 이런 형태입니다.

```
remote: Permission to owner/repo.git denied to app-name.
fatal: unable to access 'https://github.com/owner/repo.git/': The requested URL returned error: 403
```

403은 "이 사람이 누군지는 확인했지만, 이 자원에 대한 권한은 없다"는 뜻입니다. 인증(authentication)은 통과했는데 인가(authorization)에서 막힌 것이라, 아이디·비밀번호나 토큰이 틀린 것과는 원인이 다릅니다.

## 계정 권한과 앱 설치 권한은 별개다

push를 GitHub App(예: CI 도구, 봇, 각종 통합 앱)을 통해서 하는 경우, 그 앱이 접근할 수 있는 저장소 목록은 계정 전체 권한과 별도로 관리됩니다. GitHub 공식 문서([Reviewing and modifying installed GitHub Apps](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps))에 따르면 앱을 설치할 때 접근 범위를 두 가지 중에서 고르게 됩니다.

- **All repositories** — 계정(또는 조직)의 모든 저장소에 접근 가능
- **Only select repositories** — 드롭다운에서 직접 고른 저장소에만 접근 가능

"Only select repositories"로 설치되어 있으면, 그 목록에 없는 저장소는 앱이 존재 자체를 몰라서가 아니라 **권한이 없어서** 접근이 막힙니다. 저장소가 실제로 있고 정상적으로 만들어졌더라도 마찬가지입니다.

## 새로 만든 저장소가 자동으로 포함되지 않는 경우

같은 문서는 예외도 명시합니다. *"해당 GitHub App이 나중에 저장소를 직접 생성하면, 그 저장소에는 자동으로 접근 권한이 부여된다"*는 내용입니다. 즉 **앱이 직접 만든 저장소**는 자동으로 목록에 들어갑니다.

반대로 저장소를 웹 UI에서 직접 만들었거나, 다른 방법(로컬에서 `git init` 후 push, 다른 도구로 생성 등)으로 만든 경우에는 이 자동 포함 규칙이 적용되지 않습니다. 앱의 접근 범위가 "Only select repositories"로 설정되어 있다면, 새로 만든 저장소를 목록에 수동으로 추가해야 합니다.

## 확인·해결 방법

1. 개인 계정 설정: **Settings → Applications → Installed GitHub Apps**, 조직 저장소라면 **조직 Settings → Installed GitHub Apps**로 이동
2. 문제가 되는 앱 옆의 **Configure** 클릭
3. **Repository access** 항목에서 현재 범위 확인
   - "Only select repositories"라면 드롭다운에서 새 저장소를 찾아 추가
4. 저장, 이후 다시 push 시도

앱마다 설치 위치(개인 계정 vs 조직)와 Configure 화면 위치가 조금씩 다를 수 있어서, 어떤 앱을 통해 push하고 있는지부터 확인하는 것이 먼저입니다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
