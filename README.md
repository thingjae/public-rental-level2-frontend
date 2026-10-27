# 한빛구 공공 생활물품 대여소 · 프론트엔드 (Level 2)

한빛구(가상) 거점 4곳의 공구, 캠핑, 생활, 행사 물품을 **한곳에서 찾고, 예약하고, 반납하는** 웹앱의 화면입니다.
기획 내용은 [기획서.md](기획서.md)에 있습니다. 모든 기관, 인물, 연락처는 **가상**이며 실제 개인정보를 다루지 않습니다.

- 배포 주소: https://public-rental-level2-frontend.vercel.app
- 백엔드 주소: https://public-rental-level2-backend.onrender.com (DB 연결 확인: [/health](https://public-rental-level2-backend.onrender.com/health))
- 백엔드 저장소: https://github.com/thingjae/public-rental-level2-backend

> ⏳ 백엔드가 Render 무료 서버라, 한동안 아무도 쓰지 않았다면 첫 화면에 "서버를 깨우는 중" 안내가 뜨고 1분 가까이 걸릴 수 있어요. 고장이 아니에요.

## 화면

| 화면 | 주소 | 하는 일 |
| --- | --- | --- |
| 물품 목록 | `/items` | 이름 검색, 거점·분류 필터, "지금 빌릴 수 있는 것만" |
| 물품 상세 | `/items/[id]` | 7일 예약 현황표(이름은 숨김), 예약 신청, 고장 신고 |
| 내 예약 | `/my` | 이름·연락처로 조회, 취소, 반납 |
| QR 반납 | `/return?location=거점코드` | 거점 QR을 찍으면 열리는 반납 화면 (추가 기능) |
| 직원: 대여 현황 | `/admin/dashboard` | 대여 중 / 예약 / 대여 가능 숫자, 반납 지연·점검 필요, 거점별 보기 |
| 직원 홈 | `/admin` | 물품 상태 관리, **가상 데이터 다시 채우기**, 거점 QR 코드 |
| 물품 등록 | `/admin/items/new` | 새 물품 등록, 잘못된 입력은 쉬운 말로 안내 |
| 예약 관리 | `/admin/reservations` | 전체 예약과 이름·연락처, 반납 지연 목록, 반납 처리 |
| 고장 신고 관리 | `/admin/reports` | 수리 시작, 처리 완료 |

> 현황은 운영 정보라 주민 메뉴가 아니라 직원 화면 안에 있어요. Level 2에는 로그인이 없어서 직원 화면을 막지는 않아요(기획서에 적은 한계).

## 직접 확인해 보기 (가상 주민)

| 이름 / 연락처 | 확인할 수 있는 것 |
| --- | --- |
| 박민수 / 010-3333-3333 | 내 예약에서 **취소**와 **반납** |
| 김하늘 / 010-1111-1111 | 새로 예약하면 **규칙 R3** 거절 (이미 3건) |
| 이지연 / 010-2222-2222 | 새로 예약하면 **규칙 R7** 거절 (반납 지연 중) |
| 새 이름 아무거나 | 무선 전동드릴 상세에서 "예약됨" 시간을 고르면 **규칙 R1** 거절 |

확인이 끝나면 **직원 → 가상 데이터 다시 채우기**로 처음 상태로 되돌릴 수 있어요.

## 기술

Next.js 16 (App Router), React 19, Tailwind CSS 4. 데이터는 브라우저에서 백엔드 API를 직접 불러옵니다.

## 설정값

| 이름 | 뜻 | 예시 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 (끝에 `/` 없이) | `https://public-rental-level2-backend.onrender.com` |

Vercel에서는 **Settings → Environment Variables**에 넣고 다시 배포합니다. 이 값은 빌드할 때 화면 코드에 들어가므로, 바꾼 뒤에는 꼭 다시 배포해야 해요.

## 내 컴퓨터에서 실행

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                  # http://localhost:3000
```
