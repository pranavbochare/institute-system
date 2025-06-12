function loadMenubar() {
  fetch("../public/menubar.html")
    .then((response) => response.text())
    .then((html) => {
      document.body.insertAdjacentHTML("afterbegin", html);
      menubarEventListeners();
    });
}

function menubarEventListeners() {
  document.querySelector("#save").addEventListener("click", () => {
    window.location.href = "institute.html";
  });

  document.querySelector("#displayStudents").addEventListener("click", () => {
    window.location.href = "displayStudents.html";
  });

  document.querySelector("#addStudent").addEventListener("click", () => {
    window.location.href = "addStudent.html";
  });

  document.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("institute_id");
    window.location.href = "admin.html";
  });

  document.querySelector("#uploadBtn").addEventListener("click", () => {
    window.location.href = "uploadStudentList.html";
  });
}

loadMenubar();
