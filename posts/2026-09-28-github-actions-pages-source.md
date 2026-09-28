---
title: GitHub Actions로 Pages 배포할 때 Source 설정을 꼭 바꿔야 하는 이유
date: 2026-09-28
description: GitHub Actions 워크플로로 Pages를 배포할 때, 저장소 Settings의 Pages Source를 "GitHub Actions"로 바꾸지 않으면 워크플로가 성공해도 사이트에 반영되지 않는 이유를 정리합니다.
tags: [GitHub, GitHub Pages, GitHub Actions, 정적사이트]
draft: true
---

<!--
올리기 전에 본인이 채워야 할 것 (체크하고 지우세요):
- [ ] 실제로 이 문제를 겪은 상황을 서두에 추가 (언제, 어떤 워크플로를 돌리다가 발견했는지)
- [ ] 워크플로가 성공 표시(초록 체크)였는데 사이트는 안 바뀌어서 헷갈렸던 부분을 본인 경험대로 서술
- [ ] Source 설정을 바꾸고 나서 실제로 해결됐는지, 해결 과정에서 추가로 겪은 문제가 있었는지
- [ ] 결론/느낀점 문단 작성 (현재는 비워둠)
- [ ] 아래 정보가 본인이 쓴 저장소 상황과 맞는지 확인 (workflow 파일 이름, actions 버전 등은 실제 값으로 교체)
-->

GitHub Pages는 사이트를 배포하는 방식을 두 가지 중에서 고를 수 있습니다. 저장소의 **Settings → Pages → Build and deployment → Source**에서 설정합니다.

## 두 가지 배포 방식

- **Deploy from a branch** — 지정한 브랜치(주로 `main`이나 `gh-pages`)의 특정 폴더 내용을 그대로 정적 파일로 서빙합니다. 별도 빌드 과정이 없습니다.
- **GitHub Actions** — 저장소에 정의한 워크플로(`.github/workflows/*.yml`)가 빌드와 배포를 담당합니다. 워크플로 안에서 `actions/deploy-pages` 같은 액션으로 결과물을 Pages에 올립니다.

이 설정은 저장소마다 하나만 선택되어 있고, 기본값은 "Deploy from a branch"입니다.

## 워크플로만 만들면 안 되는 이유

GitHub Actions로 빌드·배포하는 워크플로 파일을 저장소에 추가했다고 해서 Source 설정이 자동으로 바뀌지는 않습니다. Source가 여전히 "Deploy from a branch"로 남아 있으면 다음과 같은 상황이 됩니다.

- 워크플로는 정상적으로 실행되고, Actions 탭에는 초록색 체크(성공)로 표시됩니다.
- 하지만 Pages가 실제로 서빙하는 내용은 여전히 "Deploy from a branch"에서 지정한 브랜치/폴더의 내용입니다.
- 워크플로가 만든 산출물은 배포되지 않으므로, 사이트에는 반영되지 않습니다.

GitHub 공식 문서([Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site))에도 두 방식이 서로 다른 설정이며, GitHub Actions 워크플로를 사용하려면 Source를 "GitHub Actions"로 명시적으로 선택해야 한다고 나와 있습니다.

## 설정 위치

1. 저장소 페이지에서 **Settings** 탭으로 이동
2. 왼쪽 메뉴에서 **Pages** 선택
3. **Build and deployment** 항목의 **Source** 드롭다운에서 **GitHub Actions** 선택

이 드롭다운을 "GitHub Actions"로 바꾸고 나면, 이후 워크플로가 성공적으로 끝날 때마다 그 결과물이 실제로 Pages에 배포됩니다.

## 확인 방법

Source를 바꾼 뒤에는 저장소의 **Actions** 탭에서 워크플로 실행 기록을 보면 "deploy" 단계에 배포된 URL이 표시됩니다. Settings → Pages 화면 상단에도 "Your site is live at ..." 형태로 현재 배포된 주소가 뜹니다.

## 결론

<!-- 여기에 본인의 결론/느낀점을 작성하세요 -->
