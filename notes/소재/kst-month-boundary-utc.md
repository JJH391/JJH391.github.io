# 한국 시간 기준 "이번 달"의 시작·끝을 UTC 타임스탬프로 구하기

- **한 줄 요약**: 서버(Workers)는 UTC라서, 한국 시간 월 경계를 `Date.UTC(y, m, 1) - 9시간`으로 계산하고 경계값을 단위 테스트로 확인한 것
- **무엇이 있었나**: 명예의 전당을 한국 시간 매달 1일 0시 기준으로 바꾸면서 시즌 계산 함수를 만들고, 10월 31일 23:59(한국) / 11월 1일 00:00(한국) / 1월 초의 "지난 시즌"이 12월로 넘어가는지 테스트.
- **원인/근거**: 한국 시간 = UTC+9. `new Date(ts + 9시간)`의 UTC 연·월을 읽으면 한국 날짜가 된다.
- **해결/결론**:

```js
const KST = 9 * 3600_000;
export function seasonOf(ts = Date.now()) {
  const d = new Date(ts + KST);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  return { key: `${y}-${String(m + 1).padStart(2, '0')}`, start: Date.UTC(y, m, 1) - KST, end: Date.UTC(y, m + 1, 1) - KST };
}
// 테스트
assert.equal(seasonOf(Date.UTC(2026, 9, 31, 14, 59)).key, '2026-10'); // 한국 10/31 23:59
assert.equal(seasonOf(Date.UTC(2026, 9, 31, 15, 0)).key, '2026-11');  // 한국 11/1 00:00
```
