# 학도병 탐구 웹앱 (GitHub Pages용)

## 1) 업로드 → 바로 실행
1. 이 폴더를 그대로 GitHub 저장소에 업로드합니다.
2. GitHub 저장소 Settings → Pages → Branch를 `main` / `/ (root)`로 설정합니다.
3. 발급된 URL로 접속하면 웹앱이 실행됩니다.

## 2) 학생 답안 모으기(권장): Google Sheets + Apps Script
GitHub Pages는 서버가 없는 정적 호스팅이므로, 학생 답안을 모으려면 외부 저장소가 필요합니다.

### (A) Google Sheet 만들기
- 새 스프레드시트를 만들고, 첫 시트 이름을 `log`로 하세요.

### (B) Apps Script 코드 붙여넣기
스프레드시트에서 **확장 프로그램 → Apps Script** 열고 아래 코드를 붙여넣고 저장하세요.

```javascript
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('log') || ss.insertSheet('log');
  const data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'submission_id','submitted_at','run_id','class','number','name','student_id',
      'scene','attempt_no','is_correct','skipped','confidence','require','keywords','answer'
    ]);
  }
  sheet.appendRow([
    data.submission_id || '',
    data.submitted_at || '',
    data.run_id || '',
    data.class || '',
    data.number || '',
    data.name || '',
    data.student_id || '',
    data.scene || '',
    data.attempt_no || '',
    data.is_correct || '',
    data.skipped || '',
    data.confidence || '',
    data.require || '',
    (data.keywords || []).join('|'),
    data.answer || ''
  ]);

  return ContentService.createTextOutput('ok')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### (C) 웹 앱으로 배포
- **배포 → 새 배포**
- 유형: **웹 앱**
- 실행 사용자: **나**
- 접근 권한: **링크가 있는 모든 사용자**
- 배포 후 나오는 URL(끝이 `/exec`)을 복사하세요.

### (D) 웹앱에 URL 붙여넣기
`js/config.js`의 `window.SUBMIT_ENDPOINT`에 (C) URL을 붙여넣고 커밋/푸시합니다.

```js
window.SUBMIT_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
```

## 3) 네트워크 문제 대비
- 제출은 항상 브라우저 로컬에도 저장됩니다.
- `teacher.html`에서 로컬 로그를 JSON/CSV로 다운로드할 수 있습니다.
- (단, 로컬 로그는 **같은 기기/같은 브라우저**에서만 보입니다.)

## 4) 채점 방식(키워드 포함)
- 각 Scene마다 핵심 키워드가 설정되어 있으며, 답안에 포함되면 정답 처리됩니다.
- 오답이어도 **넘어가기 가능**(학습 흐름 유지).


## 현재 설정
- Google Sheets 전송 URL이 `js/config.js`에 이미 설정되어 있습니다.
- 교사용 로컬 보기 페이지는 기본 잠금이며, `teacher.html?key=TEACHER-5026` 로 접속합니다.
- 키 문자열(TEACHER-5026)은 `teacher.html`에서 변경 가능합니다.


## (문제 해결) 시트에 기록이 안 찍힐 때
- Apps Script 웹앱 배포 설정이 **실행 사용자: 나 / 접근 권한: 링크가 있는 모든 사용자**인지 확인하세요.
- `/exec` 주소를 사용하고, 수정 후에는 배포에서 **새 버전**으로 업데이트하세요.
- 이 웹앱은 `text/plain`(JSON 문자열)로 전송합니다. Apps Script `doPost(e)`에서 `JSON.parse(e.postData.contents)`로 읽으면 됩니다.


## v5 변경사항
- is_correct / skipped 값이 항상 TRUE/FALSE로 저장됩니다.
- 동일 Scene 재시도 시 attempt_no가 1,2,3… 자동 증가합니다.
- 타이핑 속도/사운드는 v4와 동일합니다.



## (중요) 어제는 되는데 오늘 갑자기 기록이 안 찍힐 때
대부분 **웹앱 접근 권한이 '나만'으로 되어 있어 로그인/계정에 따라 작동이 달라지는 경우**입니다.
Apps Script에서 아래처럼 되어 있어야 학생 기기에서도 기록됩니다.
- 배포(웹 앱) → 실행 사용자: **나(Me)**
- 배포(웹 앱) → 접근 권한: **링크가 있는 모든 사용자(Anyone with the link)**
그리고 코드 수정 후에는 반드시 **배포 관리에서 '새 버전'으로 업데이트**해야 합니다.

참고: 학생이 로그인되지 않은 브라우저에서 전송하면, 권한이 좁을 경우 Google이 로그인 페이지로 리다이렉트합니다. 이때 no-cors/Beacon은 실패를 표시하지 않고 조용히 기록이 안 될 수 있습니다.



## Apps Script 권장 doPost (폼 전송 대응)
웹앱은 기본적으로 `application/x-www-form-urlencoded`로 전송합니다(가장 안정적).
아래처럼 doPost를 바꾸면 **폼 전송/JSON 전송 둘 다** 저장됩니다.

```js
function doGet(){
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('log') || ss.insertSheet('log');

  if(sheet.getLastRow()===0){
    sheet.appendRow(['submission_id','submitted_at','run_id','class','number','name','student_id','scene','attempt_no','is_correct','skipped','confidence','require','keywords','answer']);
  }

  // 1) 폼 전송 우선
  let data = (e && e.parameter) ? e.parameter : {};

  // 2) JSON 전송도 혹시 들어오면 처리
  const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  if(raw && (!data || Object.keys(data).length===0)){
    try{ data = JSON.parse(raw); }catch(err){}
  }

  sheet.appendRow([
    data.submission_id || '',
    data.submitted_at || '',
    data.run_id || '',
    data.class || '',
    data.number || '',
    data.name || '',
    data.student_id || '',
    data.scene || '',
    data.attempt_no || '',
    data.is_correct || '',
    data.skipped || '',
    data.confidence || '',
    data.require || '',
    data.keywords || '',
    data.answer || ''
  ]);

  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}
```

⚠️ 제출 URL은 `script.google.com/macros/s/.../exec` 를 사용하세요(브라우저가 보여주는 `script.googleusercontent.com` 주소는 매번 달라질 수 있어요).



## (v9) 전송이 아예 실행기록(Executions)에 안 뜰 때: doGet 로깅 방식(가장 강력)
학교/계정/브라우저에 따라 `POST`가 조용히 막히는 경우가 있어, v9부터는 **GET(이미지 비콘)** 으로도 기록되게 설계했습니다.
아래 코드로 Apps Script를 교체해 주세요.

```js
const SPREADSHEET_ID = '여기에_스프레드시트_ID'; // URL에서 /d/ 다음 문자열

function ensureHeader_(sheet){
  if(sheet.getLastRow()===0){
    sheet.appendRow(['submission_id','submitted_at','run_id','class','number','name','student_id','scene','attempt_no','is_correct','skipped','confidence','require','keywords','answer']);
  }
}

function writeRow_(data){
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('log') || ss.insertSheet('log');
  ensureHeader_(sheet);
  sheet.appendRow([
    data.submission_id || '',
    data.submitted_at || '',
    data.run_id || '',
    data.class || '',
    data.number || '',
    data.name || '',
    data.student_id || '',
    data.scene || '',
    data.attempt_no || '',
    data.is_correct || '',
    data.skipped || '',
    data.confidence || '',
    data.require || '',
    data.keywords || '',
    data.answer || ''
  ]);
}

function doGet(e){
  // 1) 단순 테스트: /exec 만 열면 OK
  const p = (e && e.parameter) ? e.parameter : {};
  // 2) 제출이면: submission_id가 있을 때 기록
  if(p && p.submission_id){
    writeRow_(p);
    return ContentService.createTextOutput('logged').setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e){
  // JSON/폼 전송도 받아줌(혹시 사용할 경우 대비)
  let data = (e && e.parameter) ? e.parameter : {};
  const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  if(raw && Object.keys(data).length===0){
    try{ data = JSON.parse(raw); }catch(err){}
  }
  if(data && data.submission_id) writeRow_(data);
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}
```

✅ 반드시 배포(웹 앱)에서
- 실행 사용자: 나(Me)
- 접근 권한: 모든 사용자
- **새 버전**으로 업데이트

그리고 config.js에는 `https://script.google.com/macros/s/.../exec` 를 그대로 넣어주세요.
