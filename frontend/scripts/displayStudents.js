function deleteStudent(studentId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized: Admin not logged in");
    return;
  }
  fetch(`http://localhost:8080/student/${studentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.data) {
        alert("Student deleted successfully.");
        window.location.reload();
      } else {
        alert(result.error);
      }
    })
    .catch((error) => {
      console.error("Delete student error:", error);
    });
}

function redirectToUpdatePage(studentId) {
  window.location.href = `studentUpdate.html?student_id=${studentId}`;
}

async function getStudents(institute_id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized: Admin not logged in");
    return;
  }
  try {
    const response = await fetch(`http://localhost:8080/students/${institute_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (result) {
      console.log("display student result : ", result);
      console.log("result : ", result);
      const students = result.data.data;
      const table = document.getElementById("studentTableBody");

      students.forEach((student) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.mobile}</td>
            <td><button onclick="redirectToUpdatePage(${student.id})"  id="updateStudentButton">Update</button></td>
            <td><button onclick="deleteStudent(${student.id})" id="deleteStudentButton">Delete</button></td>
          `;
        table.appendChild(row);
      });
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Fetch students error:", error);
  }
}

window.onload = function () {
  const institute_id = localStorage.getItem("institute_id");
  if (institute_id) {
    getStudents(institute_id);
  }
};
