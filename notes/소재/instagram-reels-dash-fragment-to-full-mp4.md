# 샌드박스에서 yt-dlp로 인스타 릴스가 안 받아질 때, 브라우저 안에서 원본 mp4 주소 뽑기

- **한 줄 요약**: 인스타 릴스를 yt-dlp로 못 받을 때, 페이지가 불러온 DASH 조각 URL에서 bytestart/byteend를 지우면 화질별 전체 mp4 주소가 된다
- **무엇이 있었나**:
  1. 작업 환경(네트워크 허용 목록이 있는 클라우드 샌드박스)에서 `yt-dlp`로 릴스를 받으려 했더니 프록시 단계에서 막힘.
  2. 데스크톱 앱 브라우저로 릴스 페이지를 열고, `performance.getEntriesByType('resource')`로 페이지가 불러온 리소스 목록을 확인.
  3. `cdninstagram.com/...mp4` 주소들이 있었고, 쿼리에 `bytestart`, `byteend`가 붙은 조각 요청이었음.
  4. 두 파라미터를 지운 주소를 `<video src>`로 열면 전체 길이(예: 167.7초) 영상이 재생·탐색 가능.
  5. 같은 영상의 화질별 주소는 `efg` 파라미터(URL 인코딩된 base64 JSON)의 `vencode_tag` 값으로 구분됨: `..._360p`, `_540p`, `_720p`, `_1080p`, `dash_ln_heaac_vbr3_audio`(오디오만).
- **에러/로그 원문**:

```
ERROR: [Instagram] DeYZviSCVFV: Unable to download webpage: ('Unable to connect to proxy', OSError('Tunnel connection failed: 403 Forbidden'))
```

- **원인**: 샌드박스의 외부 접속 허용 목록에 instagram이 없어 프록시가 403으로 차단 (yt-dlp 문제 아님).
- **해결/결론**: 영상은 브라우저(로그인 안 한 상태로도 열림) 안에서 처리. 조각 URL → 전체 mp4 URL로 바꿔 새 video 요소로 재생.
- **코드/명령어**:

```js
const ef = u => { try { return atob(decodeURIComponent(new URL(u).searchParams.get('efg'))) } catch (e) { return '' } };
const urls = [...new Set(performance.getEntriesByType('resource').map(e => e.name)
  .filter(n => /cdninstagram.*\.mp4/.test(n))
  .map(n => { const x = new URL(n); x.searchParams.delete('bytestart'); x.searchParams.delete('byteend'); return x.toString() }))];
const pick = urls.find(u => ef(u).includes('540p'));
```
