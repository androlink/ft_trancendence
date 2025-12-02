import { FastifyInstance } from "fastify";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";
// je peu en régénérer une au besoin
const CLIENT_SECRET = "003530775d960f318554c656cc1e80c404e8cf52";

export default function authentification(fastify: FastifyInstance) {
  fastify.get("/api/github/getAccessToken", async (req, res) => {
    const { code } = req.query as { code: string };

    const url = new URL("https://github.com/login/oauth/access_token");
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("client_secret", CLIENT_SECRET);
    url.searchParams.set("code", code);

    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    const data = await response.json();
    console.log(data);
    res.send(data);
  });

  fastify.get("/api/github/getUserData", async (req, res) => {
    const authHeader = req.headers["authorization"];
    console.log("Authorization =>", authHeader);
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    console.log(data);
    res.send(data);
  });
}
