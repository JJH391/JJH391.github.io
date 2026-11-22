# HTML 발표자료를 Chrome headless로 슬라이드 크기 PDF 만들기

- **한 줄 요약**: 1920×1080 HTML 슬라이드를 페이지당 한 장, 글꼴·배경색·링크를 유지한 PDF로 뽑은 방법
- **무엇이 있었나**:
  1. 발표자료(HTML 섹션 11개)를 현장에서 열 PDF로 만들어야 했다.
  2. 한글 웹폰트(Noto Sans KR, Black Han Sans)와 어두운 배경을 그대로 유지해야 했다.
- **에러/로그 원문**: 없음. PDF 안의 글꼴 이름을 확인한 결과는 다음과 같다.
  ```
  [b'AAAAAA+NotoSansKR-Thin', ..., b'GAAAAA+BlackHanSans-Regular', ..., b'XBAAAA+CourierNewPSMT']
  ```
- **원인/확인한 것**:
  - 웹폰트가 실제로 PDF에 들어갔는지는 `/FontName`으로 확인했다(가변 글꼴이라 이름은 `NotoSansKR-Thin`으로 나왔지만 굵기는 정상 출력).
  - `<a href>`는 PDF 링크(`/URI`)로 그대로 남았다.
- **해결/결론**:
  - `@page { size: 1920px 1080px; margin: 0 }`, 섹션마다 `break-after: page`, `print-color-adjust: exact`를 넣었다.
  - 웹폰트가 늦게 로드되지 않게 `display=block`과 `--virtual-time-budget`을 썼다.
- **코드/명령어**:
  ```css
  @page { size: 1920px 1080px; margin: 0 }
  body > section { width:1920px; height:1080px; overflow:hidden; break-after:page }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact }
  ```
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --no-pdf-header-footer --virtual-time-budget=15000 --run-all-compositor-stages-before-draw \
    --print-to-pdf=deck.pdf "file://$PWD/deck_print.html"
  ```
  ```python
  import re; b = open('deck.pdf','rb').read()
  print(re.findall(rb'/URI\s*\(([^)]*)\)', b))   # [b'https://.../']
  ```
