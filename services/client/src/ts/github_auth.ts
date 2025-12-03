import { sendStatusMessage } from "./chat.js";
import { resetReconnectTimer } from "./utils.js";
import { main } from "./app.js";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";

//leurs simple existant fait planter la page sans me dire d'erreur alors que je l'ai utilise po

async function registerGithubAccount(userData) {
  const response1 = await fetch("github/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: new URLSearchParams({
      username: userData.login,
      githubUser: userData.id,
    }),
  });

  const result1: { success?: boolean; message?: string } =
    await response1.json();
  if (!result1.success) {
    console.log("not registered");
    return;
  }
  // const response2 = await fetch("/pfp", {
  //   headers: {
  //     Authorization: `Bearer ${response1.headers.get("x-authenticated")}`,
  //   },
  //   method: "PUT",
  //   body: userData.avatar_url,
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
      const res = await fetch(`/api/github/getAccessToken?code=${codeParam}`, {
        method: "GET",
      });
      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
    }
    // localStorage.removeItem("access_token");
    getUserData();
  } catch (err) {
    console.error("Error Github access token", err);
  }
});

export async function getUserData() {
  const res = await fetch("/api/github/getUserData", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
  });
  const data = await res.json();
  //se data sera cool pour avoir toute se qu'on a besoin pour cree un client
  if (data) {
    console.log(data);
    if (localStorage.getItem("access_token")) registerGithubAccount(data);
  }
  // je sais juste pas se qu'on fait avec on lui créé quand meme un token local a nous ?
}

export function loginWithGithub() {
  window.location.assign(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user%20user:email`
  );
}
