---
title: Pillow에서 Noto Sans CJK .ttc 안의 한국어 글꼴 고르기 — index 파라미터
date: 2026-11-06
description: 한 TTC 파일에 여러 언어판 글꼴이 들어 있는 Noto Sans CJK를 Pillow로 렌더링할 때, ImageFont.truetype의 index 파라미터로 한국어(KR)판을 선택한 과정을 정리합니다.
tags: [Python, Pillow, 폰트, 디버깅]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 어떤 작업/프로젝트에서 한글 텍스트를 이미지로 렌더링해야 했는지 배경을 본인 말로 추가
- [ ] ttc 내부 글꼴 순서(JP, KR, SC, TC, HK)를 공식 문서 등으로 확인했는지 — 확인했다면 그 내용 추가, 안 했다면 아래 "확인 필요" 문장을 그대로 둘지 결정
- [ ] 실제로 쓴 폰트 파일 경로가 코드와 일치하는지 확인하고, 다르면 고칠 것
- [ ] 이 문제를 겪으면서 들었던 생각, 결론 문단 작성 (현재는 비워둠)
-->

Pillow(PIL)로 이미지에 한글 텍스트를 렌더링하려는 작업 중에, 시스템에 설치된 한국어 지원 폰트를 확인하는 과정이 있었습니다.

## 무엇이 있었나

`fc-list :lang=ko` 명령으로 확인한 결과, 한국어를 지원하는 폰트 파일은 `NotoSansCJK-*.ttc` 뿐이었고, 파일 이름 표기에는 JP/SC/TC만 보였습니다. Noto Sans CJK는 하나의 `.ttc`(TrueType Collection) 파일 안에 여러 언어판 글꼴이 같이 들어 있는 형식입니다.

## 원인

`.ttc` 파일은 여러 개의 글꼴을 한 파일에 묶어 담는 포맷입니다. Pillow의 `ImageFont.truetype()`은 기본값(index=0)으로 ttc 안의 첫 번째 글꼴만 불러오는데, 이 첫 번째 글꼴이 한국어(KR)판이 아닐 수 있습니다.

## 해결

`ImageFont.truetype()`에 `index` 파라미터를 지정해서 ttc 안의 한국어(KR)판을 선택했습니다.

```python
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
def font(sz): return ImageFont.truetype(FONT, sz, index=1)  # index 1 = KR
```

index=1로 렌더링한 한글 자막이 정상적으로 출력되는 것을 이미지로 확인했습니다.

## 정리

- Noto Sans CJK는 하나의 `.ttc` 파일 안에 여러 언어판 글꼴이 들어 있는 형식이다.
- Pillow의 `ImageFont.truetype()`은 index를 지정하지 않으면 ttc의 첫 번째 글꼴을 쓰므로, 원하는 언어판이 아닐 수 있다.
- 이번 경우에는 index=1을 지정했을 때 한국어(KR)판 글꼴이 렌더링되는 것을 실측으로 확인했다.
- ttc 내부 글꼴의 정확한 순서(JP, KR, SC, TC, HK 등)는 공식 문서로 대조하지 않았다 — **확인 필요**, 실측 결과만 확실하다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
