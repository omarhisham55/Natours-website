import axios from "axios";
import { showAlert } from "./alerts";

//? type is either 'password' or 'data'
export const updateSettings = async (data, type, userHeaderName) => {
  try {
    const endpoint = type === "password" ? "updatePassword" : "updateMe";
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/${endpoint}`,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
      if (
        userHeaderName !== res.data.data.user.name.split(" ")[0] ||
        data.get("photo")
      ) {
        location.reload(true);
      }
    } else {
      showAlert("error", res.data.message);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
