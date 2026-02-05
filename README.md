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
