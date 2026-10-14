# pip으로 Blender(bpy) 설치해 헤드리스 3D 렌더링 — CPU 시간 실측

- **한 줄 요약**: pip install bpy로 Blender 5.2를 파이썬 모듈로 깔아 Cycles CPU로 렌더하면 1080×1080 한 장에 약 2분 25초 걸렸다
- **무엇이 있었나**:
  1. `pip install bpy` → `bpy.app.version_string` = `5.2.2 LTS`.
  2. 박스·아이코스피어로 로우폴리 캐릭터를 코드로 만들고 Cycles CPU, 64샘플, 디노이즈로 렌더 → `real 2m25.567s`.
  3. 빛나는(emission) 재질이 하얗게 날아가 색이 안 보임 → emission 세기를 6/10에서 1.2/0.9로 낮추고 View Transform look을 `AgX - Punchy`로 바꾸니 색이 살아남.
- **원인**: 확인 필요 — 강한 emission이 AgX 톤 매핑에서 흰색 쪽으로 압축된 것으로 보이나, 공식 문서로 대조하지 않았음. "emission을 낮추고 look을 바꾸니 색이 돌아왔다"는 실측 결과만 확실함.
- **결론**: 1분 영상(약 1,800프레임)은 이 속도로는 불가능 → 픽셀아트(Pillow)로 결정. 픽셀아트 64초 영상은 렌더 약 4분.
