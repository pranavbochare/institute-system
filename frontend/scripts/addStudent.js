function getStudentInputFields() {
  const studentName = document.querySelector("#name").value;
  const studentClass = document.querySelector("#class").value;
  const studentMobile = document.querySelector("#mobile").value;
  if (!studentName || !studentClass || !studentMobile) {
    alert("Enter All Student Details , Then Proceed");
    return;
  }
  console.log({ studentName, studentClass, studentMobile });
  return { studentName, studentClass, studentMobile };
}

function resetStudentsFields() {
  document.querySelector("#name").value = "";
  document.querySelector("#class").value = "";
  document.querySelector("#mobile").value = "";
}

function addStudent() {
  const { studentName, studentClass, studentMobile } = getStudentInputFields();
  const institute_id = localStorage.getItem("institute_id");
  const token = localStorage.getItem("token");

  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  if (token) {
    myHeaders.append("Authorization", `Bearer ${token}`);
  } else {
    alert("Unauthorized: Admin not logged in");
    return;
  }

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      studentName,
      studentClass,
      studentMobile,
      institute_id,
    }),
    redirect: "follow",
  };

  fetch("http://localhost:8080/student", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log("Student add result", result);
      if (result.data) {
        alert("Student added successfully");
        window.location.reload();
        //resetStudentsFields();
      } else {
        let error = result.error.code;
        if (error == "ER_DUP_ENTRY") {
          alert("This student is already added");
        }
        //alert(result.error.sqlMessage);
        resetStudentsFields();
      }
    })
    .catch((error) => {
      console.error("Add student error", error);
    });
}

window.onload = () => {
  console.log("Student Add Page fully loaded");
  const addButton = document.querySelector("#addStudent");
  addButton.addEventListener("click", addStudent);
};
