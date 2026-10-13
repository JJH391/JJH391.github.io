# wrangler가 갑자기 "non-interactive environment" 에러를 낸 이유

- **한 줄 요약**: `npx wrangler logout` 이후 스크립트에서 wrangler를 부르면 로그인 창을 띄울 수 없어서 `CLOUDFLARE_API_TOKEN`을 요구하는 에러가 났던 것
- **무엇이 있었나**: 배포 전 백업 스크립트(`wrangler d1 export`를 내부에서 실행)를 돌렸더니 실패. `npx wrangler whoami`로 확인하니 로그인이 풀려 있었다(보안을 위해 학교에서 작업 후 logout 하라고 안내했던 상태). 사용자가 직접 `npx wrangler login` 후 다시 실행해 성공.
- **에러/로그 원문**:

```
✘ [ERROR] In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work. Please go to https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ for instructions on how to create an api token, and assign its value to CLOUDFLARE_API_TOKEN.
```

```
You are not authenticated. Please run `wrangler login`.
```

- **원인**: OAuth 로그인 정보가 없는 상태에서 비대화형(스크립트) 실행 → wrangler가 브라우저 로그인을 할 수 없어 API 토큰을 요구.
- **해결/결론**: 대화형 터미널에서 `npx wrangler login`. 배포 전에 `npx wrangler whoami`로 먼저 확인하는 순서로 바꿈.
- **코드/명령어**:

```bash
npx wrangler whoami
npx wrangler login
```
