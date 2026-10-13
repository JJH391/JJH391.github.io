# 캔버스 애니메이션이 첫 프레임에서 멈춰 단서 화면이 텅 비었던 버그

- **한 줄 요약**: 모달이 열리기 전에 "창 번호"를 기억한 requestAnimationFrame 루프가 첫 프레임에서 스스로 멈춰서, 7세그먼트 계기판·모스 전등 화면이 빈 화면으로 나왔던 것
- **무엇이 있었나**:
  1. 친구가 "우주 정거장 산소 발생기 스위치 문제는 못 푼다"고 제보.
  2. 브라우저에서 해당 단서 화면(`kind: 'seg'`)을 직접 띄우고 `canvas.toDataURL()`로 뽑아 보니 배경만 있고 숫자가 없음.
  3. 같은 `animate()` 도우미를 쓰는 폐병원 모스 전등 화면도 깜빡이지 않음 → 그 문제도 풀 수 없는 상태였음.
  4. 원인을 고친 뒤 7개 맵의 단서·자물쇠 화면 129개를 전부 실제로 그려서 확인.
- **원인**: 캔버스를 만드는 코드가 `open(title, segCanvas(v))`처럼 **인자로 먼저 평가**되기 때문에, `animate()` 안에서 `const seq = openSeq`를 기억하는 시점이 `open()`이 `openSeq += 1` 하기 **전**이었다. 첫 프레임에서 `seq !== openSeq`가 참이 되어 루프가 바로 `return` → `draw()`가 한 번도 안 불림.
- **해결/결론**: 첫 장면은 즉시 한 번 그리고(`draw(0)`), 창 번호는 캔버스가 화면에 붙은 뒤 첫 프레임에서 정하도록 변경.
- **코드/명령어**:

```js
// 고치기 전
function animate(c, draw) {
  const seq = openSeq;            // open()보다 먼저 실행됨 → 옛 번호
  const t0 = performance.now();
  const loop = (now) => {
    if (!c.isConnected || seq !== openSeq) return;   // 첫 프레임에서 바로 종료
    draw(now - t0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// 고친 뒤
function animate(c, draw) {
  const t0 = performance.now();
  let seq = null;
  draw(0); // 첫 장면은 바로 그린다
  const loop = (now) => {
    if (!c.isConnected) {
      if (seq === null && now - t0 < 2000) requestAnimationFrame(loop);
      return;
    }
    if (seq === null) seq = openSeq;   // 화면에 붙은 뒤 창 번호를 정한다
    if (seq !== openSeq) return;
    draw(now - t0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
```
