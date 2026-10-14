# 인스타 페이지의 `<video>`를 다른 위치로 옮겼더니 화면이 검게 나온 이유 (MSE 분리)

- **한 줄 요약**: 인스타 플레이어의 video 요소를 document.body로 옮기면 MSE 버퍼가 비어 readyState 0, 검은 화면이 된다
- **무엇이 있었나**:
  1. 장면을 크게 보려고 페이지의 `<video>`를 `document.body.appendChild(v)`로 옮기고 전체 화면 크기로 스타일 지정.
  2. 첫 프레임은 보였지만 `currentTime`을 바꾼 뒤 캡처하니 전부 검은색.
  3. 상태를 찍어보니 `buffered` 비어 있음, `readyState: 0`, `currentSrc`는 `blob:https://www.instagram.com/...`.
- **에러/로그 원문**:

```json
{"buf": [], "connected": true, "err": null, "nvid": 2, "rs": 0, "src": "blob:https://www.instagram.com/80ce49ba-...", "t": 163}
```

- **원인**: 확인 필요 — `blob:` 주소는 Media Source Extensions로 플레이어가 조각을 직접 공급하는 방식이라, 요소를 옮긴 뒤 플레이어가 버퍼 공급을 멈춘 것으로 보임(페이지에 video가 2개로 늘어난 것까지는 확인). 공식 문서로 대조하지 않았으므로, 글에서는 이 인과관계를 단정하지 말 것 — "현상은 이랬고, 추정은 이렇다" 선까지만.
- **해결/결론**: 기존 요소는 건드리지 않고, 별도 소재(인스타 릴스 DASH 조각 → 전체 mp4 주소, `notes/소재/instagram-reels-dash-fragment-to-full-mp4.md`)의 전체 mp4 주소로 **새 `<video>`를 따로 만들어** 탐색.
