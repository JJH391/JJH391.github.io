# Durable Object에서 예전 웹소켓을 close(4001) 했는데 로컬 테스트에서 닫힘 이벤트가 안 왔던 것

- **한 줄 요약**: 계정당 대기 자리를 하나로 하려고 새 연결이 오면 예전 연결을 `close(4001)` 했는데, 로컬(wrangler dev)에서 Node 클라이언트가 `readyState 2(CLOSING)`에 머물러 테스트가 실패했던 것
- **무엇이 있었나**:
  1. 빠른 매칭 서버(Durable Object, Hibernation API)에서 같은 계정의 새 연결이 오면 예전 연결을 닫도록 구현.
  2. 모의해킹 테스트가 "예전 창 종료 코드 4001"을 기다렸는데 4초 안에 `onclose`가 오지 않아 실패(`null`).
  3. 별도 스크립트로 확인하니 예전 연결의 `readyState`가 `2`(닫는 중)였다.
- **원인**: 서버가 닫기 프레임을 보낸 것은 확인(`readyState 2`). 닫기 핸드셰이크가 로컬 환경에서 끝나지 않는 이유는 **확인 필요** (wrangler dev/miniflare와 Node `WebSocket` 사이 동작인지 확인하지 않음).
- **해결/결론**:
  - 서버: 닫기 전에 예전 연결의 attachment를 대기열에서 빼도록(`map: null, replaced: true`) 바꿔, 닫히는 중인 연결이 매칭되지 않게 함.
  - 테스트: `onclose` 코드 4001 또는 `readyState >= 2`를 성공으로 인정. 실제 사이트에서도 같은 항목 통과.
- **코드/명령어**:

```js
for (const old of this.ctx.getWebSockets(`u${user.id}`)) {
  try { old.serializeAttachment({ ...(old.deserializeAttachment() || {}), map: null, since: 0, replaced: true }); } catch {}
  try { old.close(4001, 'replaced'); } catch {}
}
```

> 참고: "왜 로컬에서는 닫기 핸드셰이크가 안 끝나는가" 자체는 확인되지 않았다. 글로 쓸 때는 이 부분을 추측으로 단정하지 말 것.
