# 무료 오프라인 한국어 TTS: sherpa-onnx + Supertonic 3, 그리고 목소리 번호 남녀 구분하기

- **한 줄 요약**: Supertonic 3(sherpa-onnx)는 한국어를 지원하는 오프라인 TTS이고, 화자 번호 0~9의 남녀는 목소리 높이(F0)를 재서 구분했다
- **무엇이 있었나**:
  1. 비용 0원 조건으로 한국어 TTS를 찾음. Hugging Face와 Edge TTS 서버는 샌드박스에서 접속 불가(응답 코드 000), GitHub 릴리스 다운로드는 가능.
  2. sherpa-onnx 저장소 예제에서 `sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2`(GitHub 릴리스) 발견. 예제 주석에 "31 languages, e.g., en, ko" 및 "10 speakers, sid 0-9".
  3. 화자별 남녀 정보가 없어, 같은 문장을 0~9번으로 합성하고 자기상관으로 기본 주파수(F0)를 측정.
- **측정 결과**: sid 0~4 → 165~228Hz, sid 5~9 → 94~128Hz (같은 문장 기준). 합성 시간은 약 2.7초 분량에 2.7~3.7초(CPU).
- **원인/라이선스**: 모델 폴더 README — 코드 MIT, 모델 OpenRAIL-M.
- **코드/명령어**:

```python
g = sherpa_onnx.GenerationConfig()
g.sid, g.num_steps, g.speed = sid, 10, 1.0
g.extra["lang"] = "ko"
audio = tts.generate(text, g)
```

```bash
# 속도는 유지하고 음높이만 올리기
ffmpeg -i in.wav -af "asetrate=44100*1.12,aresample=44100,atempo=0.89286" out.wav
```
