function getUpdatedStudentInputFields() {
  const studentName = document.querySelector("#studentName").value;
  const studentClass = document.querySelector("#studentClass").value;
  const studentMobile = document.querySelector("#studentMobile").value;
  if (!studentName || !studentClass || !studentMobile) {
    alert("Enter All Details Of Students , Then Update Student");
    return;
  }
  return { studentName, studentClass, studentMobile };
}

function submitUpdate() {
  const { studentName, studentClass, studentMobile } = getUpdatedStudentInputFields();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("student_id");

  console.log("until working correctly");
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in. Please login again.");
    // window.location.href = "adminLogin.html";
    return;
  }
  fetch(`http://localhost:8080/student/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentName, studentClass, studentMobile }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.data) {
        alert("Student updated successfully.");
        window.location.href = "displayStudents.html";
      } else {
        console.log("updated student :", result);
        alert(result.error);
        window.location.href = "displayStudents.html";
      }
    })
    .catch((error) => {
      console.error("Update error:", error);
    });
}
