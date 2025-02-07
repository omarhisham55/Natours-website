import "@babel/polyfill";
import { login, logout, signup } from "./auth";
import { displayMap } from "./mapbox";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

//? DOM ELEMENTS
const leafletMap = document.getElementById("map");
const userHeaderName = document.getElementById("userHeaderName");
const signupForm = document.querySelector(".form--signup");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userSettingsForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

//? DELEGATION
if (leafletMap) {
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    signup(name, email, password, passwordConfirm);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (userDataForm && userHeaderName) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data", userHeaderName.innerHTML);
  });
}

if (userSettingsForm) {
  userSettingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    document.querySelector(".btn--save-password").textContent = "Save Password";
  });
}

if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (bookBtn) {
  bookBtn.addEventListener("click", async (e) => {
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}
