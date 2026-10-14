---
title: 캔버스 애니메이션이 첫 프레임에서 멈춰 단서 화면이 비어 있었던 버그 — open()의 인자 평가 순서가 원인
date: 2026-10-14
description: requestAnimationFrame 기반 캔버스 애니메이션이 창이 열리자마자 첫 프레임에서 스스로 멈춰서 7세그먼트 계기판·모스 전등 화면이 빈 캔버스로만 나왔던 문제를, open() 함수 인자의 평가 순서로 원인을 추적하고 코드로 고친 과정을 정리합니다.
tags: [버그, JavaScript, canvas, 디버깅]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 문제를 알게 된 계기를 본인 입장에서 직접 작성 (다른 사람 이야기는 쓰지 않는 게 이 블로그 원칙이므로, "누가 제보해서"가 아니라 본인이 직접 겪거나 확인한 과정으로 서술)
- [ ] 어떤 프로젝트의 어떤 화면인지("단서 화면", "7세그먼트 계기판", "모스 전등" 등)를 공개 가능한 범위에서 더 구체적으로 설명할지, 아니면 지금 수준으로 둘지 본인이 결정
- [ ] 본문의 "7개 맵 129개 화면을 전부 확인했다"는 과정을 — 수동으로 하나씩 열어봤는지, 스크립트로 자동화했는지 — 본인이 실제로 한 방법에 맞게 구체화
- [ ] 코드 블록이 실제 프로젝트 코드와 지금도 일치하는지(이후에 더 수정하지 않았는지) 확인
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

`requestAnimationFrame`으로 그리는 캔버스 화면 하나가 열리자마자 빈 화면으로 멈춰 있는 문제가 있었습니다. 브라우저에서 해당 화면(`kind: 'seg'`인 7세그먼트 계기판 화면)을 직접 띄우고 `canvas.toDataURL()`로 내용을 뽑아보니 배경만 그려져 있고 숫자는 없었습니다. 같은 `animate()` 도우미 함수를 쓰는 모스 전등 화면도 확인해보니 마찬가지로 깜빡이지 않는 상태였습니다. 즉 특정 화면 하나만의 문제가 아니라 `animate()` 자체의 문제였습니다.

## 원래 코드

애니메이션을 담당하는 도우미 함수는 다음과 같았습니다.

```js
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
```

`openSeq`는 창(모달)이 새로 열릴 때마다 증가하는 전역 카운터였고, `seq !== openSeq`로 "이 캔버스가 열려 있던 창이 아직 최신 창인지"를 확인해서, 창이 닫히거나 다른 창으로 바뀌면 루프가 스스로 멈추도록 만든 장치였습니다.

## 원인: 인자가 함수 호출보다 먼저 평가된다

이 화면은 `open(title, segCanvas(v))`처럼 호출되는 구조였습니다. JavaScript에서 함수 호출의 인자는 함수 본문이 실행되기 전에 먼저 평가됩니다. 즉 `segCanvas(v)`(캔버스를 만들고 `animate()`를 호출하는 부분)가 먼저 실행되고, 그 안에서 `open()`이 `openSeq`를 1 증가시키기 전의 값을 `seq`로 기억해버립니다.

그 결과 `animate()`의 첫 프레임에서 `seq !== openSeq`가 참이 되어 루프가 `draw()`를 한 번도 호출하지 않고 바로 `return`됩니다. 캔버스가 배경만 그려진 채로 멈춰 보인 이유입니다.

## 고친 코드

첫 장면은 `requestAnimationFrame`을 기다리지 않고 즉시 한 번 그리고, 창 번호는 캔버스가 실제로 화면(DOM)에 붙은 뒤 첫 프레임에서 정하도록 바꿨습니다.

```js
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

핵심 변화는 두 가지입니다.

- `seq`를 함수 시작 시점이 아니라 `null`로 두었다가, 캔버스가 `isConnected`가 된 뒤 첫 프레임에서 확정한다. 이렇게 하면 `open()`의 인자 평가 순서와 상관없이 항상 "DOM에 실제로 붙은 뒤"의 `openSeq` 값을 기준으로 삼는다.
- `draw(0)`을 동기적으로 먼저 호출해서, `requestAnimationFrame` 콜백이 아직 한 번도 안 불린 상태에서도 화면에 초기 프레임이 보이도록 한다.

## 수정 후 확인

코드를 고친 뒤 전체 범위에서 다시 확인했습니다. 이 프로젝트에는 맵 7개에 걸쳐 단서·자물쇠 화면이 총 129개 있는데, 이 화면들을 전부 실제로 띄워서 캔버스에 내용이 그려지는지 확인했습니다.

## 정리

- 같은 `animate()` 도우미를 공유하는 화면 두 개(7세그먼트 계기판, 모스 전등)가 동시에 멈춰 있었던 것으로 보아 화면별 버그가 아니라 공통 도우미 함수의 버그임을 좁힐 수 있었다
- 원인은 `open(title, segCanvas(v))` 호출에서 인자가 함수 본문보다 먼저 평가되어, `animate()`가 `openSeq`를 증가 전 값으로 기억해버린 것
- 수정은 창 번호 확정 시점을 "캔버스가 DOM에 붙은 뒤 첫 프레임"으로 미루고, 첫 장면은 `requestAnimationFrame`을 기다리지 않고 즉시 그리는 것
- 수정 후 7개 맵, 129개 화면 전체를 실제로 띄워 확인했다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
