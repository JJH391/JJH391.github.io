---
title: D1 배치에서 changes()로 "새로 들어갔을 때만 지급" 만들기
date: 2026-10-23
description: Cloudflare D1의 batch()에서 INSERT ... ON CONFLICT DO NOTHING 다음 문장에 changes() = 1 조건을 붙여, 정산 크론을 여러 번 실행해도 지급이 한 번만 되도록 만든 방법과 wrangler dev로 직접 확인한 과정을 정리합니다.
tags: [Cloudflare, D1, 백엔드]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 어떤 서비스/프로젝트의 어떤 시즌/이벤트 보상 정산인지, 공개 가능한 범위를 본인이 정해서 구체화
- [ ] 크론이 왜 재시도될 수 있는 구조였는지 (실패 상황을 실제로 겪었는지, 아니면 설계 단계에서 대비한 것인지)
- [ ] PRIMARY KEY를 (season, map, user_id)로 잡은 이유, 다른 방식(예: 별도 정산 기록 테이블 + UNIQUE 제약)을 검토했는지
- [ ] 코드 블록(INSERT/UPDATE, wrangler 명령어)이 실제 코드·스크립트와 지금도 일치하는지 확인
- [ ] 이 작업을 하면서 들었던 생각, 결론 문단 작성 (현재는 비워둠)
-->

월간 시즌 보상을 지급하는 크론을 만들면서, 같은 크론이 두 번 돌아도 지급이 한 번만 되도록 만들어야 했습니다.

## 무엇이 있었나

매일 새벽 크론에서 "지난달 정산이 아직 안 됐으면 정산한다"는 로직을 구현했습니다. 정산 중간에 실패하면 다음 날 다시 시도해야 하는데, 이때 재시도가 중복 지급으로 이어지면 안 됩니다.

지급 과정은 두 단계로 나뉩니다. 지급 기록을 `season_awards` 테이블에 남기는 단계와, 그 기록을 바탕으로 지갑(`wallets`) 잔액을 올려주는 단계입니다. 두 단계가 각각 따로 중복 실행을 막아야 하는 게 아니라, "기록이 실제로 새로 생겼을 때만 잔액도 올라간다"는 하나의 조건으로 묶여야 했습니다.

## 원인/근거

SQLite의 `changes()` 함수는 바로 직전에 실행된 문장이 바꾼 행 수를 돌려줍니다. Cloudflare D1의 `batch()`는 여러 SQL 문장을 하나의 트랜잭션으로, 작성한 순서대로 실행합니다.

이 둘을 합치면, `INSERT ... ON CONFLICT DO NOTHING`으로 지급 기록을 넣은 바로 다음 문장에서 `changes()`를 확인하면 "방금 그 INSERT가 실제로 새 행을 만들었는지"를 알 수 있습니다. 이미 존재하는 (season, map, user_id) 조합이라 `ON CONFLICT DO NOTHING`에 걸려 아무것도 바뀌지 않았다면 `changes()`는 0이고, 뒤따르는 UPDATE는 조건에 걸려 실행되지 않습니다.

## 해결

(season, map, user_id)에 PRIMARY KEY를 걸어 중복 INSERT 자체를 막고, 그 뒤에 `changes() = 1` 조건을 붙인 UPDATE를 이어 붙였습니다.

```js
env.DB.prepare('INSERT INTO season_awards (season, map, user_id, rank, coins, ts) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT DO NOTHING')
  .bind(S.key, map, uid, rank + 1, coins, now),
env.DB.prepare('UPDATE wallets SET coins = coins + ?2 WHERE user_id = ?1 AND changes() = 1').bind(uid, coins),
```

두 문장은 `batch()`로 한 트랜잭션에 묶여 순서대로 실행되므로, INSERT가 새 행을 만들지 못한 경우(이미 정산된 경우) UPDATE도 실행되지 않습니다.

## 확인한 방법

로컬에서 `wrangler dev --test-scheduled`로 띄우고, 크론이 호출하는 `/__scheduled` 엔드포인트를 같은 파라미터로 두 번 호출했습니다.

```bash
npx wrangler dev --port 8787 --test-scheduled
curl "http://127.0.0.1:8787/__scheduled?cron=0+19+*+*+*"
curl "http://127.0.0.1:8787/__scheduled?cron=0+19+*+*+*"
```

두 번 호출한 뒤 `season_awards`, 지갑, 장부 기록이 모두 한 번씩만 생긴 것을 확인했습니다.

## 정리

- SQLite `changes()`는 바로 앞 문장이 바꾼 행 수를 돌려준다. D1의 `batch()`는 문장들을 한 트랜잭션으로 순서대로 실행하므로, 이 둘을 같이 쓰면 "앞 문장이 실제로 뭔가를 바꿨을 때만 다음 문장을 실행"하는 조건을 만들 수 있다.
- 중복 실행을 막으려면 PRIMARY KEY/UNIQUE 제약으로 중복 INSERT 자체를 막는 것과, 그 결과에 따라 이어지는 문장의 실행 여부를 `changes()`로 연결하는 것 두 가지가 같이 필요하다.
- 말로만 따지지 않고 같은 크론 엔드포인트를 두 번 호출해서 실제로 한 번만 지급되는지 확인했다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
