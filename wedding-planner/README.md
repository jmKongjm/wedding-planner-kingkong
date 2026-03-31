# 🌿 Wedding Planner

결혼 준비 대시보드 — D-day, 체크리스트, 예산 관리, 업체 관리, 이메일 알림

## 로컬 실행

```bash
# 1. Node.js 설치 필요 (https://nodejs.org)

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 http://localhost:5173 접속
```

## Vercel 배포 (무료)

### 방법 A: GitHub 연동 (추천)

1. https://github.com 에서 새 저장소(repository) 만들기
2. 이 폴더를 GitHub에 올리기:
   ```bash
   git init
   git add .
   git commit -m "wedding planner"
   git branch -M main
   git remote add origin https://github.com/내아이디/wedding-planner.git
   git push -u origin main
   ```
3. https://vercel.com 가입 (GitHub 계정으로)
4. "New Project" → GitHub 저장소 선택 → "Deploy"
5. 끝! 자동으로 URL이 생성됩니다

### 방법 B: Vercel CLI 직접 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 빌드
npm run build

# 배포
vercel --prod
```

## 이메일 알림 서버

이메일 발송은 별도 Python 서버가 필요합니다.

```bash
pip install flask flask-cors apscheduler
python wedding_email_server.py
```

배포 후에는 이메일 탭에서 서버 주소를 Python 서버의 실제 주소로 변경하세요.

## 기술 스택

- React 18 + Vite
- MaruBuri 폰트
- localStorage (데이터 저장)
- Flask + smtplib (이메일 서버)
