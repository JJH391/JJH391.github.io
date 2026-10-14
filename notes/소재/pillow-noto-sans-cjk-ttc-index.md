# Pillow에서 Noto Sans CJK .ttc로 한국어 글꼴 고르기 (index)

- **한 줄 요약**: NotoSansCJK-Bold.ttc는 한 파일에 여러 언어 글꼴이 들어 있어서 ImageFont.truetype에 index=1을 줘야 한국어(KR)판이 쓰인다
- **무엇이 있었나**: `fc-list :lang=ko`로 확인하니 한국어를 지원하는 파일이 `NotoSansCJK-*.ttc`(JP/SC/TC 이름으로 표시)뿐이었음. ttc 안의 KR판을 고르기 위해 index 지정.
- **코드/명령어**:

```python
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
def font(sz): return ImageFont.truetype(FONT, sz, index=1)  # index 1 = KR
```

- **해결/결론**: index=1로 렌더한 한글 자막이 정상 출력되는 것을 이미지로 확인. ttc 내부 순서(JP, KR, SC, TC, HK)는 공식 문서로 대조하지 않았음 — **확인 필요**, 실측 결과만 확실함.
