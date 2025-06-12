function getAdminInputFields() {
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  if (!email || !password) {
    alert("Enter Email/Password Then Proceed");
    return;
  }
  console.log({ email, password });
  return { email, password };
}

function resetAdminFields() {
  document.querySelector("#email").value = "";
  document.querySelector("#password").value = "";
}

function onLoginSuccess(adminData) {
  localStorage.setItem("token", adminData.token);
  localStorage.setItem("admin_id", adminData.id);
  window.location.href = "institute.html";
}

function login(event) {
  const { email, password } = getAdminInputFields();

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      email,
      password,
    }),
    redirect: "follow",
  };

  fetch("http://localhost:8080/admin/login", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log("Login result", result);
      if (result.data) {
        resetAdminFields();
        onLoginSuccess(result.data);
      } else {
        alert(result.error);
      }
    })
    .catch((error) => {
      console.error("Login error", error);
    });
}

function register(event) {
  const { email, password } = getAdminInputFields();

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      email,
      password,
    }),
    redirect: "follow",
  };

  fetch("http://localhost:8080/admin/register", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log("Register result", result);
      if (result.error) {
        alert(result.error);
      } else {
        alert("registration completed , do login!");
      }
    })
    .catch((error) => {
      console.error("Register error", error);
    });
}

window.onload = () => {
  console.log("Admin Page fully loaded");
  const loginButton = document.querySelector("#login");
  const registerButton = document.querySelector("#register");

  loginButton.addEventListener("click", login);
  registerButton.addEventListener("click", register);
};
