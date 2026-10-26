---
title: wrangler가 갑자기 "non-interactive environment" 에러를 낸 이유
date: 2026-10-26
description: wrangler logout 이후 비대화형(스크립트) 환경에서 wrangler 명령을 실행하면 로그인 창을 띄울 수 없어 CLOUDFLARE_API_TOKEN을 요구하는 에러가 나는 이유와, wrangler whoami로 로그인 상태를 먼저 확인하도록 바꾼 과정을 정리합니다.
tags: [Cloudflare, wrangler, CLI]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 어떤 프로젝트의 어떤 배포/백업 스크립트에서 일어난 일인지, 공개 가능한 범위를 본인이 정해서 구체화
- [ ] "학교에서 작업 후 logout 하라고 안내했다"는 부분이 맞는 맥락인지, 본인 상황에 맞게 다시 쓰거나 빼기
- [ ] 에러를 처음 봤을 때 뭘 의심하고 어떤 순서로 확인했는지 본인 입장에서 서술 (여기서는 과정을 일반화해서만 적어둠)
- [ ] CLOUDFLARE_API_TOKEN을 실제로 발급해서 썼는지, 아니면 매번 interactive login으로 처리하는지 — 지금 쓰는 방식에 맞게 "해결" 섹션 보강
- [ ] 코드/명령어 블록이 지금 쓰는 스크립트와 실제로 일치하는지 확인
- [ ] 이 작업을 하면서 들었던 생각, 결론 문단 작성 (현재는 비워둠)
-->

배포 전에 돌리던 백업 스크립트가 실패했습니다. 안에서 `wrangler d1 export`를 호출하는 스크립트였는데, 에러 메시지가 평소 보던 것과 달랐습니다.

## 에러

```
✘ [ERROR] In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work. Please go to https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ for instructions on how to create an api token, and assign its value to CLOUDFLARE_API_TOKEN.
```

`npx wrangler whoami`로 로그인 상태를 확인하니 다음과 같이 나왔습니다.

```
You are not authenticated. Please run `wrangler login`.
```

## 원인

wrangler는 로그인이 안 된 상태에서 명령을 실행하면 보통 브라우저를 열어 OAuth 로그인 화면을 띄웁니다. 그런데 스크립트로 실행되는 비대화형(non-interactive) 환경에서는 브라우저를 띄울 방법이 없습니다. 그래서 wrangler는 로그인 화면 대신 `CLOUDFLARE_API_TOKEN` 환경 변수를 요구하는 쪽으로 넘어갑니다.

즉 이 에러는 토큰 자체가 잘못됐다는 뜻이 아니라, "로그인이 안 되어 있고, 이 환경에서는 로그인 창을 띄울 수도 없다"는 상태를 알려주는 메시지입니다.

이번 경우에는 OAuth 로그인 정보가 비어 있는 상태였습니다(보안을 위해 작업 후 `wrangler logout`을 하도록 안내받은 환경이었습니다). 로그아웃된 채로 배포 스크립트를 실행했기 때문에 저 에러가 난 것입니다.

## 해결

대화형 터미널에서 다시 로그인하면 해결됩니다.

```bash
npx wrangler login
```

로그인 화면에서 인증을 완료하면 OAuth 토큰이 다시 저장되고, 이후 wrangler 명령이 정상적으로 실행됩니다.

재발을 막기 위해 배포 스크립트 앞에 상태 확인 단계를 추가했습니다.

```bash
npx wrangler whoami
npx wrangler login
```

배포 전에 `whoami`로 로그인 상태를 먼저 확인하는 순서로 바꿔서, 로그아웃된 상태로 스크립트를 돌리다가 중간에 실패하는 상황을 미리 걸러낼 수 있습니다.

## 정리

- `CLOUDFLARE_API_TOKEN` 환경 변수를 요구하는 에러는 토큰이 잘못됐다는 뜻이 아니라, 로그인이 안 되어 있는데 비대화형 환경이라 로그인 창을 띄울 수 없다는 뜻이다
- wrangler는 대화형 환경이면 브라우저로 OAuth 로그인을, 비대화형 환경이면 `CLOUDFLARE_API_TOKEN` 환경 변수를 요구하는 식으로 동작이 갈린다
- `wrangler logout`을 한 뒤 스크립트에서 wrangler를 호출하면 같은 에러가 재현된다
- 배포/백업 스크립트 앞에 `wrangler whoami`로 로그인 상태를 먼저 확인하면 이 문제를 미리 잡을 수 있다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
