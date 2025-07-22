# OllReview Project

## 소개
OllReview Project는 광고주, 파트너, 관리자 등 다양한 사용자를 위한 리뷰 및 캠페인 관리 플랫폼입니다. 프론트엔드(React+Vite)와 백엔드(Node.js 기반)로 구성되어 있으며, 데이터베이스 스키마와 공통 타입을 공유합니다.

---

## 폴더 구조

```
ollreview-project/
├── client/           # 프론트엔드(React, TypeScript)
│   ├── src/
│   │   ├── components/   # UI 컴포넌트 및 대시보드, 폼 등
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── lib/          # 유틸리티, 쿼리 클라이언트
│   │   ├── pages/        # 주요 페이지(로그인, 대시보드 등)
│   │   └── types/        # 타입 정의
│   └── index.html, index.css 등
├── server/           # 백엔드(Node.js, Express 등)
│   ├── db.ts          # DB 연결
│   ├── index.ts       # 서버 진입점
│   ├── routes.ts      # API 라우팅
│   ├── storage.ts     # 파일/스토리지 관리
│   └── vite.ts        # 서버 빌드/실행 설정
├── shared/           # 프론트/백엔드 공통 타입 및 스키마
│   └── schema.ts
├── attached_assets/  # 첨부 이미지 및 파일
├── package.json      # 프로젝트 의존성 및 스크립트
├── tsconfig.json     # TypeScript 설정
├── tailwind.config.ts# TailwindCSS 설정
├── vite.config.ts    # Vite 설정
└── README.md         # 프로젝트 설명 파일
```

---

## 주요 기능
- **광고주/파트너/관리자 대시보드**: 역할별 맞춤 UI 제공
- **캠페인/리뷰/매칭/정산/배송 관리**
- **엑셀 업로드, 통계 차트, 알림 등 다양한 UI 컴포넌트**
- **공통 타입/스키마로 프론트-백엔드 일관성 유지**

---

## 기술 스택
- **프론트엔드**: React, TypeScript, Vite, TailwindCSS
- **백엔드**: Node.js, Express (추정), Drizzle ORM
- **DB**: (설정에 따라 다름, 예: PostgreSQL)
- **기타**: Replit, GitHub Actions 등

---

## 개발 및 실행 방법

1. **의존성 설치**
   ```bash
   npm install
   ```
2. **개발 서버 실행**
   - 프론트엔드:
     ```bash
     cd client
     npm install
     npm run dev
     ```
   - 백엔드:
     ```bash
     cd server
     npm install
     npm run dev
     ```
3. **환경 변수 및 DB 설정**
   - `.env` 파일을 각 디렉토리에 맞게 추가/설정하세요.

---

## 기여 방법
1. 이슈/PR 등록 후 협의
2. 커밋 메시지 컨벤션 준수

---

## 라이선스
- 별도 명시가 없으므로, 필요시 직접 추가하세요.

---

## 문의
- GitHub Issues 활용 