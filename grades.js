(function(){
  // Externalized grades loader (fetch + XHR) using corsproxy.io.
  // This script updates the existing elements in index.html:
  // - #g-id, #g-ln, #g-mid, #g-fin
  // Adjust STUDENT_ID if you need a different student.

  const STUDENT_ID = '2340108';
  const API_BASE = 'http://class-grades-cs.mywebcommunity.org/grades_api.php';
  const apiUrl = `${API_BASE}?surname=baylosis&id_number=${STUDENT_ID}`;
  const proxy = (u) => 'https://corsproxy.io/?' + encodeURIComponent(u);

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Fetch Midterm (uses Fetch API + corsproxy.io)
  fetch(proxy(apiUrl))
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');

      const students = xmlDoc.getElementsByTagName('student');
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const studentId = student.getElementsByTagName('student_id')[0]?.textContent;
        if (studentId === STUDENT_ID) {
          const midtermGrade = student.getElementsByTagName('midterm_grade')[0]?.textContent || 'N/A';
          const lastName = student.getElementsByTagName('student_lastname')[0]?.textContent || '';
          setText('g-id', studentId);
          setText('g-ln', lastName);
          setText('g-mid', midtermGrade);
          break;
        }
      }
    })
    .catch(error => {
      console.error('Error fetching midterm grade:', error);
      setText('g-mid', 'Error');
    });

  // Fetch Final (uses XMLHttpRequest + corsproxy.io)
  (function(){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', proxy(apiUrl), true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');

          const students = xmlDoc.getElementsByTagName('student');
          for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const studentId = student.getElementsByTagName('student_id')[0]?.textContent;
            if (studentId === STUDENT_ID) {
              const finalGrade = student.getElementsByTagName('final_grade')[0]?.textContent || 'N/A';
              setText('g-fin', finalGrade);
              break;
            }
          }
        } catch (error) {
          console.error('Error parsing final grade:', error);
          setText('g-fin', 'Error');
        }
      } else {
        console.error('XHR Status:', xhr.status);
        setText('g-fin', 'Error');
      }
    };

    xhr.onerror = function() {
      console.error('XHR Request failed');
      setText('g-fin', 'Error');
    };

    xhr.send();
  })();

})();
