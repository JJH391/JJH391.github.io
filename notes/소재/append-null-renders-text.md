# element.append(null)이 화면에 "null" 글자를 찍는다

- **한 줄 요약**: `cond ? el : null`을 그대로 `append()`에 넘겼더니 칠판 아래에 "null" 텍스트가 보였던 것
- **무엇이 있었나**: 단서 화면 전수 점검 중 칠판 화면 아래에 `null`이라는 글자가 찍혀 있었다. 해당 코드는 `open(title, boardCanvas(v), v.uv ? h(...) : null)` 형태였고, `open()` 안에서 `modal().append(..., ...body)`로 넘기고 있었다.
- **원인**: `ParentNode.append()`는 Node가 아닌 값을 문자열로 바꿔 텍스트 노드로 넣는다. 그래서 `null`이 `"null"` 텍스트가 됐다. (같은 프로젝트의 `h()` 도우미는 자식에서 `null`/`false`를 거르고 있었지만, `open()`은 걸러 내지 않았음)
- **해결/결론**: `open()`에서 `body.filter((b) => b != null && b !== false && b !== '')`로 거른 뒤 append.
- **코드/명령어**:

```js
modal().append(
  h('header', { class: 'm-head' }, /* ... */),
  ...body.filter((b) => b != null && b !== false && b !== ''),
);
```
