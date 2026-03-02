# 2026 만다라트 플래너

회고 질문과 만다라트 9x9 프레임워크를 결합해 연간 목표를 실행 가능한 계획으로 전환하는 14일 가이드형 웹 앱입니다. 포트폴리오용으로 정리된 구성, 깔끔한 UX, 탄탄한 테스트 дисцип린, AI 요약 기능을 포함합니다.

## 요약

- 회고부터 액션플랜까지 이어지는 14일 가이드 플로우
- 만다라트 기반 목표 계층 구조(핵심 목표, 하위 목표, 액션플랜)
- AI 추천 및 최종 리포트 생성
- 리포트 및 그리드 PDF 내보내기
- Supabase 인증 및 Row Level Security 기반 보안

## 제품 흐름

- Day 1–2: 회고 질문(테마 기반 프롬프트)
- Day 3: 중심 목표 설정
- Day 4–5: 8개 하위 목표 설정
- Day 6–13: 하위 목표별 8개 액션플랜 작성(총 64개)
- Day 14: AI 리포트 및 만다라트 시각화 생성

## 핵심 기능

- 회고 단계 스킵 및 다음 단계 직접 진입
- 목표 계층 편집 및 자동 저장
- 추천 피드백 루프 및 커스텀 프롬프트 지원
- 프롬프트 튜닝 기반 AI 요약 생성
- 리포트 및 그리드 PDF 출력
- 진행 가이드 및 관리자 대시보드 기반
- AI 엔드포인트 보안 및 오류 처리 강화

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

## 문서

- `docs/PRD.md` 제품 요구사항
- `docs/TRD.md` 기술 요구사항
- `supabase/README.md` Supabase 설정

## 라이선스

MIT
