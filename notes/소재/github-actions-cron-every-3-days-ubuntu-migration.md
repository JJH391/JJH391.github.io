# GitHub Actions cron으로 "3일마다" 실행하기, 그리고 ubuntu-latest 변경 공지

- **한 줄 요약**: cron 문법으로 3일 간격을 정확히 못 만들어서, 매일 실행 + 스크립트에서 마지막 게시 시각을 비교하는 방식으로 처리
- **무엇이 있었나**:
  1. `*/3` 같은 일(day) 단위 표현은 월이 바뀔 때 간격이 어긋나므로 사용하지 않음.
  2. 워크플로는 매일 `40 11 * * *`(UTC, 한국 20:40)에 실행, `posted.json`의 마지막 게시 시각과 비교해 3일(−2시간 여유)이 안 지났으면 건너뜀.
  3. 실행 로그 공지: "The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026." → 폰트 경로 등 환경 변화를 피하려고 `runs-on: ubuntu-24.04`로 고정. 경고 "Node.js 20 is deprecated..."도 함께 표시됨(동작에는 영향 없음 확인).
- **코드/명령어**:

```python
last = dt.datetime.fromisoformat(state["posted"][-1]["at"])
if now - last < dt.timedelta(days=3, hours=-2):
    return  # skip
```

```yaml
on:
  schedule:
    - cron: "40 11 * * *"
jobs:
  publish:
    runs-on: ubuntu-24.04
```
