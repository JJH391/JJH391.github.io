# 같은 블록에서 `const`를 두 번 선언하면 스크립트 전체가 실행되지 않는다 (headless `--dump-dom` 결과가 비는 이유)

- **한 줄 요약**: 페이지에 넣은 측정 스크립트에 `const pb`를 두 번 선언했더니, 스크립트가 통째로 안 돌아서 결과가 비고 파이썬에서 NoneType 에러가 난 것
- **무엇이 있었나**:
  1. Chrome headless `--dump-dom`으로 페이지를 열면, 측정 스크립트가 결과 JSON을 `<pre id="OUT">`에 넣게 했다.
  2. 스크립트를 고친 뒤 파이썬이 `<pre>`를 찾지 못했다.
- **에러/로그 원문**:
  ```
  Traceback (most recent call last):
    File "<stdin>", line 2, in <module>
  AttributeError: 'NoneType' object has no attribute 'group'
  ```
- **원인**: 같은 블록에 `const pl=..., pr=..., pt=..., pb=...`가 이미 있었는데 `const ... pb=par.getBoundingClientRect()`를 또 선언했다. 같은 블록의 `const` 재선언은 문법 오류라서 `<script>` 전체가 실행되지 않았다. 그래서 `<pre>`가 생기지 않았다. 이름을 `prc`로 바꾸자 바로 정상 동작했다.
- **해결/결론**:
  - 변수 이름을 바꿨다.
  - `--dump-dom`은 스크립트 오류를 출력하지 않는다. 결과가 비면 먼저 문법 오류를 의심한다.
- **코드/명령어**:
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --window-size=1920,1080 --virtual-time-budget=20000 --dump-dom "file://$PWD/extract.html" > dom.html
  ```
