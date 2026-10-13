# 이동 검증을 "도착점"만 하면 벽·함정을 뛰어넘을 수 있다

- **한 줄 요약**: 서버가 속도와 도착 좌표만 검사해서, 허용 이동량 안에서 한 번에 멀리 보내면 책상·벽·함정 칸을 건너뛸 수 있었던 것
- **무엇이 있었나**:
  1. 치트엔진 공격 대비로 서버 이동 검사(`onMove`)를 다시 읽음.
  2. 이동 여유가 `speed * dt * 1.3`씩 쌓이고, 한 번에 최대 `speed * 0.9 + 12`(약 77px)까지 허용. 검사는 `blocked(area, x, y)` — 도착점 하나뿐.
  3. 타일 크기가 16px이라 한 번에 4~5칸을 건너뛸 수 있음.
  4. 길 검사를 넣고 나니, 벽 모서리를 따라 미끄러지는 정상 이동을 직선 경로로 검사하면 오탐이 날 수 있다는 점이 보여서, 세 경로(곧은 길 / 가로→세로 / 세로→가로) 중 하나라도 막히지 않으면 통과하도록 조정.
  5. 모의해킹 스크립트에 "책상 너머로 +40px 한 번에 보내기", "서버 속도 2배로 계속 이동" 항목을 추가해 둘 다 되돌려지는 것을 확인.
- **원인**: 경로를 보지 않는 검사 + 지속 속도 여유 30%.
- **해결/결론**: 4px 간격 경로 샘플링, 지속 여유 12%로 축소(순간 허용량은 통신 끊김 대비로 유지), 레이저·유령·함정 판정도 지나온 길 전체로.
- **코드/명령어**:

```js
function segment(ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay);
  const n = Math.max(1, Math.ceil(d / 4));
  const out = [];
  for (let i = 1; i <= n; i++) out.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
  return out;
}
const paths = [
  segment(r.x, r.y, x, y),
  [...segment(r.x, r.y, x, r.y), ...segment(x, r.y, x, y)],
  [...segment(r.x, r.y, r.x, y), ...segment(r.x, y, x, y)],
].filter((pts) => !pts.some(([px, py]) => blocked(p.area, px, py, w)));
if (dist > r.budget + 2 || !paths.length) { /* 거부하고 원래 위치로 */ }
```
