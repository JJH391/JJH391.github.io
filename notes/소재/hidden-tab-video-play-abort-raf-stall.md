# 숨겨진 탭에서 video.play()가 실패하고 requestAnimationFrame이 멈춘 문제

- **한 줄 요약**: 브라우저 창이 안 보일 때 음소거 video의 play()가 AbortError로 거절되고 requestAnimationFrame 콜백도 안 돈다
- **무엇이 있었나**:
  1. 자동화 브라우저로 영상을 재생하며 캡처하려 함.
  2. `document.visibilityState`가 `"hidden"`인 상태에서 `muted=true` 후 `play()` 호출 시 에러.
  3. 프레임을 canvas에 그리는 루프에 `requestAnimationFrame`을 넣었더니 스크립트가 45초 타임아웃.
- **에러/로그 원문**:

```
AbortError: The play() request was interrupted because video-only background media was paused to save power. https://goo.gl/LdLk22
Claude_Browser__javascript_tool timed out after 45s.
```

- **원인**: 에러 메시지 그대로 — 백그라운드에서 오디오 없는(음소거) 미디어는 절전을 위해 일시정지됨. rAF가 안 돈 것은 숨겨진 문서에서 렌더링 프레임이 멈추기 때문으로 보이나, 공식 문서 대조는 하지 않았음 — **확인 필요**, 현상만 확인된 상태.
- **해결/결론**: 재생하지 않고 **일시정지 상태에서 `currentTime` 이동 → `seeked` 이벤트 대기 → `setTimeout`으로 잠깐 대기 → canvas에 `drawImage`**. 여러 시점을 한 canvas에 격자로 그려 "컨택트 시트" 한 장으로 캡처.
- **코드/명령어**:

```js
nv.currentTime = t;
await new Promise(r => { nv.onseeked = r; setTimeout(r, 4000) });
await new Promise(r => setTimeout(r, 300));   // rAF 대신
g.drawImage(nv, x, y, dw, dh);
```
