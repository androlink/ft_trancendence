import { useEffect } from "react";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";

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
  } catch (err) {
    console.error("Error Github access token", err);
  }
});

export async function getUserData() {
  const res = await fetch("api/github/getUserData", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
  });
  const data = await res.json();

  //se data sera cool pour avoir toute se qu'on a besoin pour cree un client
  if (data) console.log(data);
  // je sais juste pas se qu'on fait avec on lui créé quand meme un token local a nous ?
}

export function loginWithGithub() {
  window.location.assign(
    "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID
  );
}
