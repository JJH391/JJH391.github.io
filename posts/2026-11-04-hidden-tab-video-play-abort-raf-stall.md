---
title: 숨겨진 탭에서 video.play()가 AbortError로 실패하고 requestAnimationFrame이 멈춘 문제
date: 2026-11-04
description: 브라우저 탭이 보이지 않는 상태에서 음소거된 video의 play()가 AbortError로 거절되고, canvas에 프레임을 그리는 requestAnimationFrame 루프도 멈추는 문제를 겪고 currentTime 이동 방식으로 우회한 과정을 정리합니다.
tags: [웹, 브라우저, 자동화, 디버깅]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 어떤 작업/프로젝트에서 숨겨진 탭으로 영상을 캡처하려 했는지 배경을 본인 말로 추가
- [ ] requestAnimationFrame이 멈춘 정확한 메커니즘을 공식 문서 등으로 그 뒤에 확인했는지 — 확인했다면 그 내용을 추가, 안 했다면 아래 "확인 필요" 문장을 그대로 둘지 결정
- [ ] 코드의 변수명(`nv`, `g` 등)과 격자 레이아웃 부분이 실제 코드와 일치하는지 확인하고, 필요하면 전체 코드나 더 자세한 설명 추가
- [ ] 이 문제를 겪으면서 들었던 생각, 결론 문단 작성 (현재는 비워둠)
-->

브라우저 자동화로 영상을 재생하면서 프레임을 캡처하려는 작업 중에, 탭이 화면에 보이지 않는 상태에서 음소거된 video의 `play()`가 거절되고 캡처 루프도 멈추는 문제가 있었습니다.

## 무엇이 있었나

영상을 캡처하는 과정은 이렇게 되어 있었습니다.

1. 자동화 브라우저로 영상을 재생하면서 프레임을 캡처하려 함.
2. `document.visibilityState`가 `"hidden"`인 상태에서 `muted = true`로 설정한 뒤 `play()`를 호출.
3. 프레임을 canvas에 그리는 루프에 `requestAnimationFrame`을 넣어 사용.

이 상태에서 `play()` 호출이 에러로 거절되었고, canvas에 그리는 스크립트는 45초 만에 타임아웃으로 종료되었습니다.

에러 메시지 원문은 다음과 같습니다.

```
AbortError: The play() request was interrupted because video-only background media was paused to save power. https://goo.gl/LdLk22
```

## 원인

에러 메시지에 원인이 그대로 나와 있습니다. 백그라운드에서 오디오가 없는(음소거된) 미디어는 절전을 위해 일시정지된다는 내용입니다.

`requestAnimationFrame` 콜백이 돌지 않은 것은 숨겨진 문서에서 렌더링 프레임 자체가 멈추기 때문으로 보이지만, 이 부분은 공식 문서로 따로 대조하지 않았습니다. **확인 필요** — 현상만 확인된 상태입니다.

## 해결

영상을 재생(`play()`)하지 않고, 일시정지된 상태에서 원하는 시점으로 `currentTime`만 이동시켜 프레임을 가져오는 방식으로 바꿨습니다.

순서는 다음과 같습니다.

1. `currentTime`을 원하는 시점으로 설정
2. `seeked` 이벤트를 기다리되, 오지 않을 경우를 대비해 `setTimeout`으로도 함께 대기
3. 추가로 짧게 한 번 더 대기 (`requestAnimationFrame` 대신)
4. canvas에 `drawImage`로 해당 시점의 프레임을 그림

```js
nv.currentTime = t;
await new Promise(r => { nv.onseeked = r; setTimeout(r, 4000) });
await new Promise(r => setTimeout(r, 300));   // rAF 대신
g.drawImage(nv, x, y, dw, dh);
```

이 과정을 여러 시점에 대해 반복하면서, 한 canvas에 격자로 그려 여러 장면을 한 장의 "컨택트 시트" 이미지로 묶어 캡처했습니다.

## 정리

- 숨겨진(비가시) 탭에서 음소거된 video는 절전을 위해 재생이 자동으로 일시정지될 수 있고, 이때 `play()`는 `AbortError`로 거절된다.
- 숨겨진 문서에서는 `requestAnimationFrame` 기반 루프도 멈출 수 있다 (정확한 메커니즘은 미확인).
- 재생과 `requestAnimationFrame`에 의존하는 캡처 방식이 숨겨진 탭에서 막힐 경우, 재생 없이 `currentTime`을 이동시키고 `seeked` 이벤트(와 타임아웃)로 대기한 뒤 `drawImage`로 프레임을 가져오는 방식이 대안이 될 수 있다.
- 여러 시점을 각각 캡처하는 대신 한 canvas에 격자로 모아 그리면, 여러 장면을 한 번의 캡처로 묶어 확인할 수 있다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
