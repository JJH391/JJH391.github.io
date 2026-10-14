# GitHub Actions에서 fine-grained PAT로 다른 저장소에 push할 때 "Invalid username or token"

- **한 줄 요약**: Actions에서 PAT로 다른 저장소에 git push하다 "Invalid username or token"이 났고, 토큰 재발급 + 공백 제거 후 해결
- **무엇이 있었나**:
  1. 비공개 저장소의 워크플로에서 공개 저장소로 영상을 push하기 위해 `https://x-access-token:<PAT>@github.com/<owner>/<repo>.git`으로 clone/push.
  2. clone(공개 저장소라 읽기)은 성공, push에서 실패.
  3. 스크립트를 수정: 토큰 앞뒤 공백 `.strip()`, URL 사용자명을 저장소 소유자 이름으로 변경. 동시에 fine-grained PAT를 새로 발급(두 저장소 선택, Contents: Read and write, Secrets: Read and write)해 Secret 교체 → 성공.
- **에러/로그 원문**:

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/JJH391/night-horror-media.git/'
```

- **원인**: 확인 필요 — 스크립트 수정과 토큰 재발급을 동시에 해서 어느 쪽이 원인이었는지 분리하지 못함. (후보: Secret 값에 공백/줄바꿈 포함, 기존 토큰 값 자체 문제) 글에서는 "무엇을 바꿨더니 됐다"까지만 쓰고, 어느 조치가 결정적이었는지는 확정하지 말 것.
- **해결/결론**: 재발급 토큰 + strip 적용 후 push, Pages 확인, `gh secret list` 권한 확인까지 전부 통과.
