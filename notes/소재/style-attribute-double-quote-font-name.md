# `style="..."` 안에 큰따옴표 글꼴 이름을 넣으면 속성이 끊긴다

- **한 줄 요약**: 미리보기 HTML을 만들 때 `font-family:"Apple SD Gothic Neo"`를 `style="..."` 안에 넣었더니, 글자 크기·색이 다 빠져 작고 검게 나온 것
- **무엇이 있었나**:
  1. PPTX를 다시 읽어 HTML로 그려 보는 확인용 스크립트를 만들었다.
  2. 모든 글자가 아주 작고 검게 나왔다.
  3. PPTX의 XML을 열어 보니 크기(`sz`)와 색(`srgbClr`)은 정상이었다.
- **에러/로그 원문**: 없음(화면만 깨짐)
- **원인**: `style="font-family:"Apple SD Gothic Neo";font-size:..."`에서 안쪽 큰따옴표가 속성 값을 끝내 버렸다. 그래서 뒤의 `font-size`, `color`가 무시됐다.
- **해결/결론**: 속성 안의 글꼴 이름은 작은따옴표(`'Apple SD Gothic Neo'`)로 바꿨다.
- **코드/명령어**:
  ```python
  # 전
  fam = '"Courier New"' if ... else '"Apple SD Gothic Neo"'
  # 후
  fam = "'Courier New'" if ... else "'Apple SD Gothic Neo'"
  ```
