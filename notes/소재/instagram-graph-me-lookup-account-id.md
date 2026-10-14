# Meta 개발자 대시보드에서 토큰은 나오는데 인스타 숫자 ID가 안 보일 때

- **한 줄 요약**: Instagram 토큰만 있으면 /me?fields=user_id,username으로 계정 ID를 조회할 수 있다
- **무엇이 있었나**:
  1. 대시보드 "액세스 토큰 생성"에서 "계정 추가"를 누르니 "앱에 사람을 추가하세요" 창 → 개발 모드 앱이라 **Instagram 테스터** 역할로 계정 추가, 인스타 쪽(웹 `accounts/manage_access` → 테스터 초대)에서 수락.
  2. 토큰 생성 후 화면에 토큰만 보이고 계정 숫자 ID는 표시되지 않음.
  3. 게시 스크립트에서 토큰으로 `/me`를 조회하도록 바꿈 → 로그에 username, user_id, account_type(`MEDIA_CREATOR`) 출력 확인.
- **코드/명령어**:

```python
_, me = http("GET", "https://graph.instagram.com/me", dict(fields="user_id,username,account_type", access_token=token))
ig_id = me.get("user_id") or me.get("id")
```
