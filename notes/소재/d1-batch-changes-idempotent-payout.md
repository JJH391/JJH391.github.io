# D1 배치에서 changes()로 "새로 들어갔을 때만 지급" 만들기

- **한 줄 요약**: 월간 시즌 보상 정산을 두 번 돌려도 한 번만 지급되게 `INSERT ... ON CONFLICT DO NOTHING` 다음 문장에 `WHERE changes() = 1`을 붙여 원자적으로 처리한 것
- **무엇이 있었나**:
  1. 매일 새벽 크론에서 "지난달 정산 안 됐으면 정산"하도록 구현.
  2. 정산 중 실패하면 다음 날 재시도해야 하므로, 재시도해도 중복 지급이 없어야 했다.
  3. 로컬에서 `wrangler dev --test-scheduled`로 띄우고 `/__scheduled?cron=...`를 두 번 호출 → 지급 기록·지갑·장부가 한 번씩만 생긴 것을 확인.
- **원인/근거**: SQLite `changes()`는 바로 직전 문장이 바꾼 행 수를 돌려준다. D1 `batch()`는 문장들을 한 트랜잭션으로 순서대로 실행하므로, 지급 기록 INSERT가 실제로 들어갔을 때만 다음 UPDATE가 동작한다.
- **해결/결론**: (시즌, 맵, 회원) PRIMARY KEY + changes() 연쇄.
- **코드/명령어**:

```js
env.DB.prepare('INSERT INTO season_awards (season, map, user_id, rank, coins, ts) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING')
  .bind(S.key, map, uid, rank + 1, coins, now),
env.DB.prepare('UPDATE wallets SET coins = coins + ?2 WHERE user_id = ?1 AND changes() = 1').bind(uid, coins),
```

```bash
npx wrangler dev --port 8787 --test-scheduled
curl "http://127.0.0.1:8787/__scheduled?cron=0+19+*+*+*"
```
