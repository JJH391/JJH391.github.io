---
title: GitHub Actions에서 fine-grained PAT로 다른 저장소에 push했더니 "Invalid username or token"
date: 2026-11-16
description: GitHub Actions 워크플로에서 fine-grained PAT로 다른 저장소에 git push하다 "Invalid username or token"을 만난 과정과, 토큰 문자열 공백 제거·토큰 재발급으로 해결한 조치를 정리했습니다.
tags: [GitHub, GitHub Actions, git]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 작업이 어느 프로젝트의 어느 단계였는지 배경을 본인 말로 추가 (비공개 저장소 워크플로에서 공개 저장소로 영상을 push하려던 상황이라고 메모에 있었는데, 정확한 맥락을 본인이 다시 설명)
- [ ] clone은 되고 push만 실패했던 순간 실제로 어떤 코드/스크립트였는지, 어디서 PAT를 읽어오고 있었는지 본인이 다시 확인해서 보강
- [ ] 아래 "원인이 둘 중 뭐였는지 못 갈랐다"는 부분 — 본인이 나중에라도 둘 중 하나로 원인을 좁힐 수 있었는지, 아니면 계속 모르는 채로 남았는지 추가
- [ ] fine-grained PAT 재발급할 때 실제 화면에서 선택한 옵션(저장소 2개 선택, Contents/Secrets 권한)을 본인이 본 그대로 다시 확인
- [ ] 이 과정에서 들었던 생각과 결론 작성 (현재는 비워둠)
-->

GitHub Actions 워크플로 안에서 fine-grained PAT(personal access token)로 다른 저장소에 git push를 하다가 다음 에러를 만났습니다.

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/JJH391/night-horror-media.git/'
```

같은 토큰으로 저장소를 `clone`하는 것(읽기)은 성공했는데, `push`(쓰기)에서만 실패했습니다. clone과 push가 같은 URL, 같은 토큰을 쓰는데 한쪽만 실패한다는 점이 원인을 좁히기 어렵게 만들었습니다.

## 에러 메시지가 가리키는 것

메시지에 있는 "Password authentication is not supported for Git operations"는 GitHub가 2021년 8월 13일부터 Git 작업 인증에 계정 비밀번호를 받지 않기로 한 것과 같은 문구입니다. [GitHub 공식 changelog](https://github.blog/changelog/2021-08-12-git-password-authentication-is-shutting-down/)에 따르면 이후로는 개인 액세스 토큰, OAuth, SSH 키, GitHub App 설치 토큰 같은 **토큰 기반 인증**만 허용됩니다.

그런데 이미 토큰(PAT)을 쓰고 있었기 때문에, 이 메시지가 뜬다고 해서 "비밀번호를 써서" 생긴 문제는 아니었습니다. git이 토큰을 비밀번호 자리에 넣어 보냈는데 그 토큰 자체가 거부당했다는 뜻으로 읽는 게 맞았습니다.

## 바꾼 것

원인을 하나씩 분리해서 확인하지 못한 채로, 다음 두 가지를 동시에 바꿨습니다.

1. **스크립트 수정**
   - 토큰 문자열 앞뒤의 공백을 `.strip()`으로 제거
   - push에 쓰는 URL의 사용자명 부분을 저장소 소유자 이름으로 변경
2. **토큰 재발급**
   - fine-grained PAT를 새로 발급: 대상 저장소 2개를 직접 선택
   - 권한: Contents를 Read and write, Secrets를 Read and write로 설정
   - 재발급한 토큰으로 저장소 Secret 값을 교체

이 중 어느 조치가 실제로 문제를 해결했는지는 확인하지 못했습니다. 두 가지를 같은 시점에 바꿨기 때문입니다.

## fine-grained PAT의 저장소별 권한

재발급 과정에서 다시 확인한 부분인데, [GitHub 공식 블로그](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/)는 fine-grained PAT의 접근 범위를 이렇게 설명합니다.

> "they only have access to the repositories or organizations that they explicitly are granted access to"

즉 fine-grained PAT는 계정이 접근할 수 있는 모든 저장소가 아니라, **토큰을 만들 때 명시적으로 선택한 저장소나 조직**에만 접근합니다. 각 권한도 저장소/조직 단위로 "접근 없음 / 읽기 / 읽기 및 쓰기" 중에서 개별적으로 부여됩니다. classic PAT처럼 계정 범위 전체에 한 번에 권한이 걸리는 방식과는 다릅니다.

## 조치 후 상태

재발급한 토큰으로 Secret을 교체한 뒤 다시 push했고, 성공했습니다. 이어서 GitHub Pages 배포 결과를 확인했고, `gh secret list`로 Secret이 정상적으로 등록되어 있는지도 확인했습니다. 여기까지는 전부 통과했습니다.

## 정리

- "Password authentication is not supported" 메시지는 비밀번호를 썼다는 뜻이 아니라, 토큰 기반 인증 자체가 거부됐을 때도 뜬다.
- fine-grained PAT는 발급 시 선택한 저장소에만, 선택한 권한 수준으로만 접근한다.
- 이번 경우 토큰 문자열의 공백 제거, URL 사용자명 수정, 토큰 재발급을 동시에 적용했고 그 이후 push가 성공했다. 다만 이 중 어느 조치가 결정적이었는지는 분리해서 확인하지 못했다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
