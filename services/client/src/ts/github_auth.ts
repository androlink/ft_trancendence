import { sendStatusMessage } from "./chat.js";
import { resetReconnectTimer } from "./utils.js";
import { main } from "./app.js";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";

async function githubLogin() {
  if (!localStorage.getItem("access_token")) {
    return;
  }
  try {
    const res = await fetch("/api/account/github/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });
    const userData = await res.json();
    console.log(userData);
    if (!userData) return;

    const response = await fetch("/api/account/github/connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: userData.login,
        githubId: userData.id,
        pdp: userData.avatar_url,
        bio: userData.bio,
      }),
    });

    const result: { success?: boolean; message?: string } =
      await response.json();
    if (!result.success) {
      console.log("not registered");
      return;
    }
    resetReconnectTimer(response.headers.get("x-authenticated"));
  } catch (err) {
    console.error("fetch error", err);
  }
  sendStatusMessage();
  // window.location.search = "";
  main();
}

window.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  try {
    if (code) {
      const res = await fetch(
        `/api/account/github/getAccessToken?code=${code}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
    }
    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, url.toString());
    githubLogin();
    localStorage.removeItem("access_token");
  } catch (err) {
    console.error("Error Github access token", err);
  }
});

export function logInWithGithub() {
  window.location.assign(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user%20user:email`
  );
}
self["logInWithGithub"] = logInWithGithub;
