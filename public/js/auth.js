import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: { email, password },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      location.assign("/");
    } else {
      showAlert("error", res.data.message);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });
    if (res.data.status === "success") {
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};

exports.signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: { name, email, password, passwordConfirm },
    });
    if (res.data.status === "success") {
      showAlert("success", "Account created successfully!");
      location.assign("/");
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
