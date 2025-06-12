let createButton;
let updateButton;

const token = localStorage.getItem("token");
const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

function getInstituteInputFields() {
  const name = document.querySelector("#name").value;
  const address = document.querySelector("#address").value;
  const mobile = document.querySelector("#mobile").value;
  if (!name || !address || !mobile) {
    alert("Enter institute details first , then proceed");
    return;
  }
  return { name, address, mobile };
}

function hideButton(button) {
  button.style.display = "none";
}

function showButton(button) {
  button.style.display = "block";
}

function displayInstituteDetails({ name, address, mobile, id, logo }) {
  document.querySelector("#name").value = name;
  document.querySelector("#address").value = address;
  document.querySelector("#mobile").value = mobile;

  localStorage.setItem("institute_id", id);
  hideButton(createButton);
  showButton(updateButton);
}

function fetchInstitute(adminId) {
  console.log("Fetching institute", adminId);
  fetch(`http://localhost:8080/institute/${adminId}`, {
    method: "GET",
    headers: authHeaders,
  })
    .then((res) => res.json())
    .then((result) => {
      console.log("result : ", result);
      if (result.error) {
        alert(result.error);
      } else {
        const institute = result.data[0];
        if (institute) {
          displayInstituteDetails(institute);
        } else {
          console.log("Institute not present");
          hideButton(updateButton);
          showButton(createButton);
        }
      }
    });
}

function createInstitute() {
  const admin_id = localStorage.getItem("admin_id");
  console.log(admin_id);
  const { name, address, mobile } = getInstituteInputFields();

  fetch("http://localhost:8080/institute", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name,
      address,
      mobile,
      admin_id: Number(admin_id),
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
      } else {
        alert("Institute created");
        const institute = result.data[0];
        console.log("institute result : ", result);
        displayInstituteDetails(institute);
      }
    });
}

function updateInstitute(e) {
  const institute_id = localStorage.getItem("institute_id");
  const { name, address, mobile } = getInstituteInputFields();

  fetch(`http://localhost:8080/institute/${institute_id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name,
      address,
      mobile,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
      } else {
        alert("Institute updated");
        const institute = result.data[0];
        displayInstituteDetails(institute);
      }
    });
}

function logout() {
  console.log("redirected to admin page");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("institute_id");
  localStorage.removeItem("token");
  window.location.href = "admin.html";
}

window.onload = () => {
  createButton = document.querySelector("#createInstitute");
  createButton.addEventListener("click", createInstitute);

  updateButton = document.querySelector("#updateInstitute");
  updateButton.addEventListener("click", updateInstitute);

  const admin_id = localStorage.getItem("admin_id");
  fetchInstitute(admin_id);
};

document.addEventListener("DOMContentLoaded", () => {
  waitForInstituteIdAndLoadLogo();

  document.querySelector("#uploadLogoBtn").addEventListener("click", () => {
    const hiddenFileInput = document.createElement("input");
    hiddenFileInput.type = "file";
    hiddenFileInput.accept = "image/*";

    hiddenFileInput.addEventListener("change", async () => {
      const instituteId = localStorage.getItem("institute_id");
      const file = hiddenFileInput.files[0];
      if (!file || !instituteId) {
        alert("No file or institute ID found.");
        return;
      }

      const formData = new FormData();
      formData.append("logo", file);
      formData.append("institute_id", instituteId);

      try {
        const response = await fetch("http://localhost:8080/institute/uploadLogo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();
        console.log("result 2 : ", result);
        if (response) {
          alert("Logo uploaded successfully!");
          loadInstituteLogo(instituteId);
        } else {
          alert("Upload failed: " + result.error);
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. Check console.");
      }
    });
    hiddenFileInput.click();
  });
});

function waitForInstituteIdAndLoadLogo() {
  const interval = setInterval(() => {
    const instituteId = localStorage.getItem("institute_id");
    if (instituteId) {
      clearInterval(interval);
      loadInstituteLogo(instituteId);
    }
  }, 100);
}

function loadInstituteLogo(instituteId) {
  fetch(`http://localhost:8080/institute/logo/${instituteId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response) throw new Error("Logo not found");
      return response.blob();
    })
    .then((blob) => {
      const imgURL = URL.createObjectURL(blob);
      const logoImg = document.querySelector("#instituteLogo");
      logoImg.src = imgURL;
      logoImg.style.display = "block";
    })
    .catch((error) => {
      console.error("Error loading logo:", error);
      document.querySelector("#instituteLogo").style.display = "none";
    });
}
