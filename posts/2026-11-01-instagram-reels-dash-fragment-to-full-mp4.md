---
title: 샌드박스에서 인스타 릴스가 yt-dlp로 안 받아질 때 — 브라우저 안에서 DASH 조각 URL을 전체 mp4로 바꾸기
date: 2026-11-01
description: 클라우드 샌드박스에서 yt-dlp로 인스타그램 릴스를 받으려다 네트워크 차단에 걸렸을 때, 브라우저가 이미 불러온 DASH 조각 영상 주소에서 bytestart/byteend 파라미터를 지워 화질별 전체 mp4 주소로 바꾸는 방법을 정리합니다.
tags: [웹, 디버깅, 인스타그램]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 어떤 작업을 하다가 인스타 릴스를 받아야 했는지 배경 설명 추가 (무슨 프로젝트/용도였는지, 공개해도 되는 수준으로)
- [ ] "클라우드 샌드박스"로 지칭한 작업 환경을 더 구체적으로 적을지, 이 수준으로 둘지 결정
- [ ] 이 방법이 인스타그램 이용약관(저작권 포함)상 허용되는 범위인지 직접 확인하고, 필요하면 주의 문구를 본문에 추가
- [ ] efg 파라미터의 화질 태그(`_360p`, `_540p` 등) 표기가 지금도 그대로인지 재확인 — 인스타 쪽 구현이 바뀌면 깨질 수 있음
- [ ] 이 문제를 겪으면서 들었던 생각, 결론 문단 작성 (현재는 비워둠)
-->

인스타그램 릴스 영상을 `yt-dlp`로 받으려다 작업 환경의 네트워크 제한에 걸려 실패했습니다. 대신 브라우저로 릴스 페이지를 열어 페이지가 이미 내려받은 영상 조각 주소를 가공해서 전체 영상 파일을 얻는 방법을 썼습니다.

## 무엇이 있었나

작업 환경(네트워크 접속에 허용 목록이 있는 클라우드 샌드박스)에서 `yt-dlp`로 릴스 영상을 받으려 했더니 다음과 같은 에러가 났습니다.

```
ERROR: [Instagram] DeYZviSCVFV: Unable to download webpage: ('Unable to connect to proxy', OSError('Tunnel connection failed: 403 Forbidden'))
```

데스크톱 앱 안의 브라우저로 같은 릴스 페이지를 열어보니(로그인하지 않은 상태에서도 페이지는 열렸습니다) 영상 자체는 정상적으로 재생됐습니다. 브라우저 콘솔에서 `performance.getEntriesByType('resource')`로 페이지가 불러온 리소스 목록을 확인하자 `cdninstagram.com` 도메인의 `.mp4` 주소들이 여러 개 잡혔고, 각 주소의 쿼리 문자열에 `bytestart`와 `byteend` 파라미터가 붙어 있었습니다. 즉 영상 전체가 아니라 특정 구간만 요청하는 조각(fragment) 주소였습니다.

이 두 파라미터를 지운 주소를 새 `<video>` 요소의 `src`로 열어보니 영상 전체 길이(해당 영상 기준 167.7초)가 재생되고 탐색(seek)도 가능했습니다.

같은 영상이라도 화질별로 별도의 주소가 있었는데, 어느 화질인지는 쿼리의 `efg` 파라미터(URL 인코딩된 base64 JSON)를 디코드하면 `vencode_tag` 값으로 구분됐습니다. `_360p`, `_540p`, `_720p`, `_1080p`, 그리고 영상 없이 오디오만 있는 `dash_ln_heaac_vbr3_audio` 태그가 확인됐습니다.

## 원인

작업 환경의 외부 접속 허용 목록에 인스타그램 관련 도메인이 없어 프록시 단계에서 403으로 막힌 것이었습니다. `yt-dlp` 자체의 문제가 아니라 네트워크 접근 권한 문제였습니다.

## 어떻게 전체 주소로 바꿨는지

브라우저 콘솔에서 아래 코드로 조각 주소 목록을 모으고, 원하는 화질의 주소를 골랐습니다.

```js
const ef = u => { try { return atob(decodeURIComponent(new URL(u).searchParams.get('efg'))) } catch (e) { return '' } };
const urls = [...new Set(performance.getEntriesByType('resource').map(e => e.name)
  .filter(n => /cdninstagram.*\.mp4/.test(n))
  .map(n => { const x = new URL(n); x.searchParams.delete('bytestart'); x.searchParams.delete('byteend'); return x.toString() }))];
const pick = urls.find(u => ef(u).includes('540p'));
```

`performance.getEntriesByType('resource')`로 모은 주소에서 `bytestart`, `byteend`를 지운 뒤, `efg` 값을 디코드해서 원하는 화질 태그가 포함된 주소를 골라내는 순서입니다. 고른 주소를 새 `<video src>`에 넣으면 전체 영상이 재생됩니다.

## 정리

- `yt-dlp`가 실패한 원인이 작업 환경의 네트워크 허용 목록 때문인지, 도구 자체의 문제인지 먼저 구분해야 한다.
- 영상 페이지가 브라우저에서 정상적으로 재생된다면, 페이지가 이미 받아온 리소스 목록(`performance.getEntriesByType('resource')`)에 필요한 주소가 있을 수 있다.
- DASH로 스트리밍되는 영상은 조각(fragment) 단위 주소에 `bytestart`/`byteend` 같은 구간 파라미터가 붙어 있을 수 있고, 이를 지우면 전체 파일 주소가 되는 경우가 있다.
- 화질별 주소를 구분하는 파라미터(이 경우 `efg`에 인코딩된 `vencode_tag`)는 서비스마다 다르므로, 필요한 화질을 코드로 거르기 전에 실제 값을 먼저 찍어보고 확인해야 한다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
