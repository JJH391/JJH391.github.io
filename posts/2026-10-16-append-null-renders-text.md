---
title: element.append(null)이 화면에 "null" 글자를 찍는다 — ParentNode.append()가 값을 텍스트로 바꾸는 동작
date: 2026-10-16
description: cond ? el : null 형태의 값을 그대로 append()에 넘겼을 때 화면에 "null" 텍스트가 찍히는 이유를, ParentNode.append()의 동작과 필터링 코드로 정리합니다.
tags: [버그, JavaScript, DOM, 디버깅]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 이 문제를 어떤 계기로 발견했는지 본인 입장에서 직접 작성 (어떤 작업을 하다가, 무엇을 보고 알게 됐는지 — "단서 화면 전수 점검 중"이라는 표현이 본인이 실제로 한 작업과 맞는지 확인하고 필요하면 더 구체적으로 고칠 것)
- [ ] "칠판 화면", "단서 화면" 등 어떤 프로젝트의 어떤 화면인지를 공개 가능한 범위에서 더 구체적으로 설명할지, 지금 수준으로 둘지 본인이 결정
- [ ] 코드 블록(open(), modal().append(), h() 도우미)이 실제 프로젝트 코드와 지금도 일치하는지 확인 — 이후에 더 고치지 않았는지
- [ ] h() 도우미는 null/false를 걸러내는데 open()은 걸러내지 않았던 이유(설계가 원래 그랬는지, 나중에 생긴 차이인지)를 본인이 아는 범위에서 보충
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

화면 하나를 점검하다가 특정 칠판 화면 아래에 "null"이라는 글자가 그대로 찍혀 있는 것을 발견했습니다. 해당 화면은 `open(title, boardCanvas(v), v.uv ? h(...) : null)` 형태로 호출되고 있었고, `open()` 내부에서는 이 값들을 `modal().append(..., ...body)`로 넘기고 있었습니다.

## 원인: ParentNode.append()는 Node가 아닌 값을 문자열로 바꾼다

[`ParentNode.append()`](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append) 는 인자로 Node가 아닌 값이 들어오면 문자열로 변환해 텍스트 노드로 추가합니다. `null`을 넘기면 `String(null)`인 `"null"`이 텍스트 노드가 되어 화면에 그대로 나타납니다.

같은 프로젝트에서 엘리먼트를 만들 때 쓰는 `h()` 도우미 함수는 자식 목록에서 `null`과 `false`를 걸러내고 있었습니다. 하지만 `open()` 함수는 전달받은 `body` 배열을 그대로 `append()`에 넘기고 있어서, `h()`가 걸러내는 조건과 같은 필터가 없었습니다. `v.uv ? h(...) : null`처럼 조건이 거짓일 때 `null`을 반환하는 코드가 `open()`을 거치면서 걸러지지 않은 채 `append()`에 도달한 것입니다.

## 해결

`open()`에서 `append()`에 넘기기 전에 `body` 배열을 필터링하도록 고쳤습니다.

```js
modal().append(
  h('header', { class: 'm-head' }, /* ... */),
  ...body.filter((b) => b != null && b !== false && b !== ''),
);
```

`!= null`로 `null`과 `undefined`를 함께 걸러내고, `false`와 빈 문자열도 같은 자리에서 제외합니다.

## 정리

- `ParentNode.append()`는 Node가 아닌 값을 문자열로 바꿔 텍스트 노드로 넣는다. `append(null)`은 `"null"` 텍스트가 된다
- 조건식이 `null`을 반환하는 패턴(`cond ? el : null`)을 쓸 때는, 그 값이 거치는 모든 경로에서 필터링이 되는지 확인해야 한다. 같은 프로젝트 안에서도 `h()`는 걸러내고 `open()`은 걸러내지 않는 식으로 경로별로 다를 수 있다
- 수정은 `append()`에 넘기기 직전에 `body.filter((b) => b != null && b !== false && b !== '')`를 추가하는 것

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
