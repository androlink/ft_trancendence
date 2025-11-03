
import db from "./database.js";

export async function miscRoutes(fastifyInstance) {
  fastifyInstance.setNotFoundHandler ( (req, reply) => {
    return reply.code(404).send("all the /misc request are for the frontend tools, like the user research thing at the top. You should not be able to read this");
  });

  fastifyInstance.get('/users', (req, reply) => {
    let start = req.query.start;
    if (!start) start = "";
    let arr = db.prepare("SELECT username, pfp FROM users WHERE username LIKE ? -- users search route ").all(start + '%');
    arr = arr.sort((a, b) => (a.username > b.username) * 2 - 1);
    return arr.slice(0, 20);
  });
}