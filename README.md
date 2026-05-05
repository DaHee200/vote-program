<div align=center><h1>🗳️ Voting Service</h1></div>

<br>

익명 사용자가 투표 포스트를 생성하고, 다른 사용자들이 찬반 투표를 할 수 있는 서비스입니다.

개발 학습 및 시스템 설계 연습을 목적으로 합니다.

---

<div align=center><h1> 목표 </h1></div>

### 개발 기간 :

    2026.05.04 ~ 2026.05.09

### 동시 접속자수 :

     100명

### 정책

    동일 IP는 하나의 투표에 1회만 참여 가능

### 필터

| 구분   | 값                  | 기준      |
|------|--------------------|---------|
| 카테고리 | 문화, 라이프스타일, 정치, 기타 | 내용 기준   |
| 필터   | 인기순                | 투표 수    |
|      | 최신순                | 생성 일자 순 |

### 기능

| 기능        | 설명                         |
|-----------|----------------------------|
| 투표 포스트 생성 | 제목, 내용, 카테고리, 마감 기간        |
| 투표 조회하기   | 상세 조회                      |
| 투표하기      | 찬성 / 반대 선택                 |
| 투표 취소     | 기존 투표 취소 (같은 IP에서 재클릭시 취소) |

---
<div align=center><h1>📚 STACKS</h1></div>

<div> 
  <img src="https://img.shields.io/badge/kotlin-7F52FF?style=for-the-badge&logo=java&logoColor=white">

[//]: # (<img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=java&logoColor=white">)

[//]: # (<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=java&logoColor=white">)
</div>

- 무료 DB 사용

---

<div align=center><h1>📌 일정</h1></div>

| 기간    | 작업          | 설명                  |
|-------|-------------|---------------------|
| 05.04 | 서비스 기획 및 세팅 | 기능 정하기, swagger 세팅  |
| 05.05 | 서비스 세팅 (2)  | DB 및 기타 기능 세팅       |
| 05.07 | 투표 포스트 생성   | 제목, 내용, 카테고리, 마감 기간 |
| 05.07 | 투표하기        | 찬성 / 반대 선택          |
| 05.07 | 투표 취소       | 기존 투표 취소            |
| 05.07 | 투표 조회       | 상세 조회               |
