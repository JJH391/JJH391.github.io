# HTML 슬라이드를 "고칠 수 있는" PPTX로 옮기기: 브라우저에서 위치를 재서 EMU로

- **한 줄 요약**: 슬라이드를 그림으로 통째로 넣지 않고, `getBoundingClientRect()`로 잰 위치·크기를 EMU로 바꿔 python-pptx로 글상자·도형·표를 다시 만든 방법
- **무엇이 있었나**:
  1. 처음에는 슬라이드마다 PNG 한 장을 넣은 PPTX를 만들었다. 글꼴은 안 깨지지만 글자를 고칠 수 없었다.
  2. 글자·카드·표를 하나하나 넣어 달라는 요청이 있었다.
  3. pptxgenjs가 설치돼 있지 않아서 python-pptx(가상환경)로 만들었다.
- **에러/로그 원문**: 없음
- **원인/확인한 것**:
  - 16:9 슬라이드 너비 12,192,000 EMU ÷ 1920px = **1px당 6350 EMU**.
  - 글자 크기는 px × 0.5 = pt (예: 28px → 14pt).
  - 줄 간격은 CSS line-height(px) × 0.5를 "고정 간격(pt)"으로 넣었다(`lnSpc/spcPts`).
  - 카드 둥근 모서리는 `adjustments[0] = radius / min(w,h)`.
  - 한글이 지정 글꼴로 나오게 `a:latin`, `a:ea`를 둘 다 넣었다.
- **해결/결론**:
  - Chrome headless에서 측정 스크립트로 요소별 위치·스타일을 JSON으로 뽑았다(`--dump-dom`).
  - 그 JSON을 python-pptx로 변환했다.
  - SVG 그림과 CSS 그라데이션 띠는 고화질 PNG에서 그 영역만 잘라 그림으로 넣었다.
  - 하이퍼링크는 `run.hyperlink.address`로 넣었다. 링크 글자색은 테마의 `a:hlink` 색을 바꿨다. **확인 필요**: 파워포인트에서 링크가 열리는 건 확인했지만, 바꾼 색이 실제로 적용됐는지는 확인하지 않았다.
- **코드/명령어**:
  ```python
  E = lambda px: Emu(int(round(px * 6350)))
  p.line_spacing = Pt(line_height_px * 0.5)        # 고정 줄 간격
  run.font.size = Pt(font_px * 0.5)
  rPr = run._r.get_or_add_rPr()
  for tag in ('a:latin', 'a:ea', 'a:cs'):
      el = rPr.find(qn(tag)) or etree.SubElement(rPr, qn(tag)); el.set('typeface', 'Malgun Gothic')
  ```
