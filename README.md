<div align='center'>

# 📝 TODOPL

### 개인 맞춤형 ToDo List & 일정 관리 웹 애플리케이션

<p>
  <strong>Django + PostgreSQL(Supabase) + JavaScript + PWA</strong>
</p>

<p>
  내가 직접 사용하기 위해 만들고 있는 개인 일정 관리 서비스
</p>

</div>

---

## 📌 프로젝트 소개

**TODOPL(투두플)**은 내가 직접 사용하기 위해 개발하고 있는
개인 맞춤형 ToDo List 웹 애플리케이션

단순한 CRUD 프로젝트에 그치지 않고 실제 서비스 출시까지 고려하여

- 사용자 인증
- 사용자별 데이터 분리
- 반응형 Web
- PWA
- PostgreSQL
- 비동기 UI
- 확장 가능한 Django Architecture

를 단계적으로 적용하는 것을 목표

---

## 🎯 개발 목표

<table>
<tr>
<td align='center'>📱</td>
<td><strong>Responsive Web</strong><br>PC / Mobile 환경 지원</td>
</tr>

<tr>
<td align='center'>🔐</td>
<td><strong>Authentication</strong><br>회원가입 / 로그인 / 사용자별 데이터 관리</td>
</tr>

<tr>
<td align='center'>☁️</td>
<td><strong>Cloud Database</strong><br>Supabase PostgreSQL 기반 데이터 관리</td>
</tr>

<tr>
<td align='center'>⚡</td>
<td><strong>Async UI</strong><br>페이지 새로고침 없이 Todo 상태 변경</td>
</tr>

<tr>
<td align='center'>📲</td>
<td><strong>PWA</strong><br>모바일 앱 형태의 설치 및 사용 지원</td>
</tr>
</table>

---

# 🛠 Tech Stack

<table>
<thead>
<tr>
<th>분류</th>
<th>기술</th>
<th>용도</th>
</tr>
</thead>

<tbody>

<tr>
<td>Design</td>
<td><strong>Figma</strong></td>
<td>UI / UX 설계 및 Dev Mode 활용</td>
</tr>

<tr>
<td>Backend</td>
<td><strong>Python 3.11+</strong></td>
<td>Backend 개발</td>
</tr>

<tr>
<td>Framework</td>
<td><strong>Django 5.0+</strong></td>
<td>Web Framework / ORM / Authentication</td>
</tr>

<tr>
<td>Frontend</td>
<td><strong>HTML5 / CSS3 / JavaScript</strong></td>
<td>Web UI</td>
</tr>

<tr>
<td>CSS</td>
<td><strong>Tailwind CSS</strong></td>
<td>반응형 UI 및 Mobile First</td>
</tr>

<tr>
<td>Database</td>
<td><strong>Supabase PostgreSQL</strong></td>
<td>Cloud Database</td>
</tr>

<tr>
<td>DB Driver</td>
<td><strong>psycopg</strong></td>
<td>Django ↔ PostgreSQL 연결</td>
</tr>

<tr>
<td>Environment</td>
<td><strong>.env</strong></td>
<td>Secret / Database 환경변수 관리</td>
</tr>

<tr>
<td>Version Control</td>
<td><strong>Git / GitHub</strong></td>
<td>소스 코드 및 개발 이력 관리</td>
</tr>

<tr>
<td>PWA</td>
<td><strong>Manifest / Service Worker</strong></td>
<td>모바일 설치 환경</td>
</tr>

<tr>
<td>Social Login</td>
<td><strong>django-allauth</strong></td>
<td>향후 네이버 OAuth 연동</td>
</tr>

</tbody>
</table>

---

# 🗄 Database

## Database Migration

초기 개발 단계에서는 SQLite를 사용했지만,
로그인 및 사용자별 데이터 관리와 향후 배포를 고려하여
**Supabase PostgreSQL로 전환**

### 이전

```text
Django
   ↓
SQLite
   ↓
db.sqlite3