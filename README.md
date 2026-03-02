# 2026 만다라트 플래너
<a href='https://github.com/KevinTheRainmaker/2026_mandalart_planner/blob/main/README.md'>Korean</a> | <a href='https://github.com/KevinTheRainmaker/2026_mandalart_planner/blob/main/README.eng.md'>English</a>

회고 질문과 만다라트 9x9 프레임워크를 결합해 연간 목표를 실행 가능한 계획으로 전환하는 만다라트 가이드입니다.

## 요약

- 회고부터 액션플랜까지 이어지는 가이드 플로우
- AI 채팅을 통한 2025년 회고
- 만다라트 기반 목표 계층 구조(핵심 목표, 하위 목표, 액션플랜)
- AI 추천 및 최종 리포트 생성
- 리포트 및 그리드 PDF 내보내기

## 제품 흐름

- Step 1–2: 회고 질문 및 중심 목표 설정
- Step 3-4:  8개 하위 목표 설정
- Step 5–12: 하위 목표별 8개 액션플랜 작성(총 64개)
- Step 13: AI 리포트 및 만다라트 시각화 생성

## 핵심 기능

- 채팅 UI 기반 2025년 회고 기능
- 목표 계층 편집 및 자동 저장
- 추천 피드백 루프 및 커스텀 프롬프트 지원
- AI 요약 및 평가 리포트 제공 (SMART 프레임워크 기반)
- 만다라트 그리드 시각화 및 PDF 출력
- 관리자 대시보드 (관리자 계정 접속 시 활성)

## 기술 스택

### 프론트엔드
- React 18.3 + TypeScript 5.3
- Vite 5, Tailwind CSS 3.4
- Zustand 상태 관리
- React Router 6 라우팅

### 백엔드
- Supabase (PostgreSQL, Auth, Edge Functions)
- Row Level Security

### AI 및 외부 서비스
- Google Generative AI API (Gemini)
- jsPDF + html2canvas (PDF)

### 테스트
- Vitest + Testing Library
- 핵심 컴포넌트 및 스토어 TDD

## 프로젝트 구조

```
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── days/
│   ├── mandala/
│   ├── timeline/
│   └── admin/
├── pages/
├── store/
├── hooks/
├── lib/
├── types/
├── constants/
├── utils/
└── styles/
```

## 시작하기

### 1) 클론

```bash
git clone https://github.com/KevinTheRainmaker/2026_mandalart_planner.git
cd 2026_mandalart_planner
```

### 2) 설치

```bash
npm install
```

### 3) 환경 변수

`.env` 파일에 아래 값을 설정하세요.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=http://localhost:5173
```

### 4) Supabase 설정

Supabase SQL 에디터에서 다음 마이그레이션을 실행합니다.

```
# supabase/migrations/20260101000000_init_schema.sql
```

자세한 내용은 `supabase/README.md`를 참고하세요.

### 5) 개발

```bash
npm run dev
```

### 6) 테스트

```bash
npm test
npm run test:coverage
```

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 미리보기
- `npm test`: 테스트 실행
- `npm run test:coverage`: 커버리지 포함 테스트
- `npm run lint`: 린트

## 보안

- Row Level Security로 사용자 데이터 분리
- 매직 링크 기반 비밀번호 없는 인증
- 환경 변수로 민감 정보 분리

## 라이선스

MIT
