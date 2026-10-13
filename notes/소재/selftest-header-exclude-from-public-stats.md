# 공개 관제실 숫자 대부분이 내 테스트 트래픽이었다 — 자체 점검 표시 분리

- **한 줄 요약**: 공격 탐지 통계를 공개했는데 대부분이 모의해킹 스크립트·자동 완주 봇이 만든 기록이라, 비밀 토큰 헤더로 자체 점검을 구분해 집계에서 뺀 것
- **무엇이 있었나**:
  1. 관제실 로그가 "보여주기 같다"는 지적.
  2. 이벤트 기록 코드를 보니 출처 구분 없이 탐지 유형·시각만 저장, 셀프 모의해킹(회당 약 100건)과 봇 플레이도 같이 쌓이고 있었음.
  3. 테스트 스크립트에만 있는 비밀 토큰을 `X-Fortress-Selftest` 헤더로 보내고, 서버에는 그 SHA-256 해시만 비밀 저장소(`SELFTEST_HASH`)에 저장. 해시가 맞으면 기록하지 않음. 게임 서버(Durable Object)로는 워커가 확인한 결과만 `X-FX-Self` 헤더로 넘김(브라우저가 보낸 같은 이름 헤더는 삭제).
  4. 모의해킹 스크립트에 "실행 전후 공개 집계가 거의 그대로인지" 항목 추가 → 실제 사이트에서 0 → 0, 이후 21 → 21, 28 → 28로 확인.
- **해결/결론**: 로그 한 줄에 `시각 · 방문자 번호(HMAC(비밀키, 날짜+IP) 앞 6글자) · 요청 틀 · 유형 · 실제 처리 결과`를 남기고, 입력 원문·IP·쿠키는 저장하지 않음.
- **코드/명령어**:

```js
export async function isSelfTest(request, env) {
  const t = request.headers.get('X-Fortress-Selftest');
  if (!t || typeof env.SELFTEST_HASH !== 'string' || env.SELFTEST_HASH.length < 43 || t.length > 100) return false;
  return safeEqual(b64u(await sha256(t)), env.SELFTEST_HASH);
}
```
