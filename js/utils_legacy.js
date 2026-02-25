(function(){
  function uid(){ return 'sub_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16); }
  function setStudent(profile){ localStorage.setItem('student_profile', JSON.stringify(profile)); }
  window.AppUtils = window.AppUtils || {};
  window.AppUtils.uid = uid;
  window.AppUtils.setStudent = setStudent;
})();
