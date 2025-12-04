import { sendStatusMessage } from "./chat.js";
import { resetReconnectTimer } from "./utils.js";
import { main } from "./app.js";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";

async function githubLogin() {
  if (!localStorage.getItem("access_token")) {
    return;
  }
  try {
    const res = await fetch("/github/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });
    const userData = await res.json();
    if (!userData) return;

    const response1 = await fetch("/github/connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: new URLSearchParams({
        username: userData.login,
        githubUser: userData.id,
        pdp: userData.avatar_url,
      }),
    });

    const result1: { success?: boolean; message?: string } =
      await response1.json();
    if (!result1.success) {
      console.log("not registered");
      return;
    }
  } catch (err) {
    console.error("fetch error", err);
  }
  // const pdpResponse = await fetch(userData.avatar_url);
  // if (!pdpResponse.ok) return console.log("po reussi");

  // const pdp = Buffer.from(await pdpResponse.arrayBuffer());
  // const response2 = await fetch("/pfp", {
  //   headers: {
  //     Authorization: `Bearer ${response1.headers.get("x-authenticated")}`,
  //   },
  //   method: "PUT",
  //   body: pdp,
  // });

  // resetReconnectTimer(response2.headers.get("x-authenticated"));
  // const result2: { success?: boolean; message?: string } =
  //   await response2.json();
  // if (!result1.success && result2.success) {
  //   console.log(`ca n'a pas marcher`); // j'ai pas de form ou renvoyer une erreur :c
  //   return;
  // }
  sendStatusMessage();
  main();
}

window.addEventListener("DOMContentLoaded", async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const codeParam = urlParams.get("code");
  console.log("code truc:", codeParam);

  try {
    if (codeParam && localStorage.getItem("access_token") === null) {
      const res = await fetch(`/github/getAccessToken?code=${codeParam}`, {
        method: "GET",
      });
      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
    }
    // localStorage.removeItem("access_token");
    githubLogin();
  } catch (err) {
    console.error("Error Github access token", err);
  }
});

export function loginWithGithub() {
  window.location.assign(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user%20user:email`
  );
}
