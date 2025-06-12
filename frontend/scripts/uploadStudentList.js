document.querySelector("#uploadBtn").addEventListener("click", () => {
  const fileInput = document.querySelector("#fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Excel file.");
    return;
  }

  const instituteId = localStorage.getItem("institute_id");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in. Please log in first.");
    return;
  }

  const formdata = new FormData();
  formdata.append("file", file);
  formdata.append("instituteId", instituteId);

  fetch("http://localhost:8080/student/import", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formdata,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        console.log("result list : ", result.error);
        if (result.error === "Internal server error") {
          alert("incorrect excel format or duplicate entries");
        } else {
          alert("student file uploaded successfully");
        }
      } else {
        alert("incorrect excel format");
      }
      // console.error("students list result : ", result);
      // alert("student file uploaded successfully");
    })
    .catch((error) => {
      console.log("list error : ", error);
      console.error("Error:", error.message);
    });
});
