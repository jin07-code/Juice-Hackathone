# Hackathon Platform (Scaffold)

Next.js(App Router) + TypeScript + Tailwind + localStorage(Mock DB) 기반 해커톤 플랫폼 초기 스캐폴딩입니다.

## Routes

- `/` 메인
- `/hackathons` 해커톤 목록
- `/hackathons/[slug]` 해커톤 상세(섹션 스켈레톤 7개)
- `/camp?hackathon=slug` 팀 찾기(Camp)
- `/rankings` 글로벌 랭킹

## Mock DB

앱 로드 시 `localStorage`를 확인하고, 비어 있으면 `public/`의 JSON 파일을 읽어서 아래 키로 시드합니다.

- `hackathons`
- `teams`
- `submissions`
- `leaderboards`

직접 `localStorage`에 접근하지 않고 `src/lib/mock-db/api/*`의 Mock API 함수만 사용합니다.

## Run locally

1) Node.js LTS 설치(= npm 포함)

2) 의존성 설치

```bash
npm install
```

3) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## Deploy to Vercel

- 이 프로젝트는 **Vercel 배포를 전제로** 구성되어 있습니다.
- Vercel에서 Framework는 자동으로 Next.js로 인식됩니다.

### Vercel 설정(기본값)

- **Build Command**: `next build`
- **Output**: Next.js 기본(설정 불필요)
- **Install Command**: `npm install`

### JSON 목업 데이터

`public/`에 아래 파일이 있어야 합니다(현재는 빈 데이터로 들어있음).

- `public/public_hackathons.json`
- `public/public_hackathon_detail.json`
- `public/public_teams.json`
- `public/public_leaderboard.json`

