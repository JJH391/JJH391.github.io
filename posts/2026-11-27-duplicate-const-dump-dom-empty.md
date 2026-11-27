---
title: 같은 블록에서 const를 두 번 선언하면 스크립트 전체가 멈추는 것 — headless --dump-dom 결과가 비었던 이유
date: 2026-11-27
description: Chrome headless --dump-dom으로 측정 스크립트 결과를 뽑으려 했는데 결과가 비어 파이썬에서 NoneType 에러가 났던 원인을 정리합니다. 같은 블록에서 const를 두 번 선언하면 스크립트 전체가 실행되지 않는다는 점이 원인이었습니다.
tags: [버그, JavaScript, 디버깅, Chrome]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] "측정 스크립트"가 정확히 무엇을 재려던 스크립트였는지, 어떤 작업을 하다가 이 페이지를 headless로 열게 됐는지 본인 입장에서 구체적으로 작성 (글 초반 "무슨 일이 있었나" 문단이 실제 작업 흐름과 맞는지 확인하고 필요하면 고칠 것)
- [ ] 이 작업이 어떤 프로젝트의 일부였는지 공개 가능한 범위에서 더 구체적으로 설명할지, 지금 수준("페이지에 넣은 측정 스크립트")으로 둘지 본인이 결정
- [ ] 코드 블록·에러 로그가 실제와 지금도 일치하는지 확인 — 이후에 변수 이름이나 구조를 더 고치지 않았는지
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
-->

Chrome headless의 `--dump-dom`으로 페이지를 열어 측정 스크립트가 계산한 결과를 뽑으려 했습니다. 페이지에 넣은 스크립트가 결과 JSON을 `<pre id="OUT">`에 써넣게 해 두고, 파이썬에서 그 태그를 찾아 읽는 방식이었습니다. 스크립트를 한 군데 고친 뒤 다시 돌렸더니 파이썬이 `<pre>` 태그를 찾지 못했습니다.

에러 메시지는 다음과 같았습니다.

```
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
AttributeError: 'NoneType' object has no attribute 'group'
```

`<pre id="OUT">`가 아예 생기지 않았다는 뜻입니다.

## 원인: 같은 블록에서의 `const` 재선언은 문법 오류

스크립트 안 같은 블록에 이미 `const pl=..., pr=..., pt=..., pb=...`가 선언돼 있었는데, 고치는 과정에서 `const ... pb=par.getBoundingClientRect()`를 추가로 선언했습니다. 같은 스코프에서 `const` 변수명을 두 번 선언하는 것은 자바스크립트 문법 오류(`SyntaxError`)입니다.

문법 오류가 나면 그 `<script>` 블록 전체가 실행되지 않습니다. 그래서 `<pre id="OUT">`를 만드는 코드까지 통째로 돌지 않았고, 결과적으로 해당 태그 자체가 생기지 않았습니다. 변수 이름을 `pb`에서 `prc`로 바꾸자 바로 정상 동작했습니다.

## `--dump-dom`은 스크립트 오류를 알려주지 않는다

Chrome headless의 `--dump-dom`은 렌더링이 끝난 DOM을 그대로 출력할 뿐, 페이지 안 스크립트에서 난 콘솔 에러나 문법 오류를 별도로 알려주지 않습니다. 그래서 겉으로는 "그냥 결과가 비어 있는" 상태로만 보입니다.

실행에 쓴 명령은 다음과 같습니다.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --window-size=1920,1080 --virtual-time-budget=20000 --dump-dom "file://$PWD/extract.html" > dom.html
```

## 정리

- 같은 블록에서 `const`로 같은 이름을 두 번 선언하면 자바스크립트 문법 오류가 나고, 그 블록의 `<script>` 전체가 실행되지 않는다
- `--dump-dom`은 그 오류를 콘솔 로그로 보여주지 않기 때문에, 기대한 DOM 요소가 아예 안 보이는 "결과가 빈" 상태로만 드러난다
- `--dump-dom` 결과가 비어 있을 때는 먼저 페이지 안 스크립트의 문법 오류부터 의심하는 편이 빠르다
- 파이썬 쪽에서는 태그를 못 찾았을 때 `None`이 반환되므로, 그 뒤 `.group()` 등을 바로 호출하면 `AttributeError: 'NoneType' object has no attribute 'group'`로 나타난다

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
