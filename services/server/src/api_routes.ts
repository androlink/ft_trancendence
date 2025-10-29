
import db from "./database";
import { dbLogFile } from "./database";
import fs from 'fs';

// response format for that page :
// {
//   template?: string,
//   title?: string,
//   replace?: {[key: string]: string},
//   inner?: string,
// }
// if you reuse code for other page, take it into consideration

export async function apiRoutes(fastifyInstance) {
  fastifyInstance.setNotFoundHandler ( (req, reply) => {
    return reply.code(404).send({
      template: "Error",
      replace: {status: "404 Not Found", message: "are you lost by any chance ?"}, 
      title: "404 Not Found",
    });
  });

  fastifyInstance.addHook('onRequest', async (req, reply) => {
    try {
      await req.jwtVerify();
      const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
      reply.header('x-authenticated', token);
    } catch (err) {
      req.user = {id: -1};
      reply.header('x-authenticated', false);
    }
  });

  const needConnection = async (req, reply) => {
    if (req.user.id === -1) {
      return reply.code(403).send({
        template: "Home",
        title: "login",
        inner: "Login",
      });
    }
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!row) {
      // might happen naturally if jwt from a previous DB or account deleted
      reply.header('x-authenticated', false);
      return reply.send({
        template: "Home",
        title: "login",
        inner: "Login",
      });
    }
    req.user.username = row.username;
    req.user.admin = row.admin;
    req.user.password = row.password;
    req.user.bio = row.bio;
  };
  // login now only use the profile route due to consistency
  // and because it made no sense to have a login page when connected
  
  // those comments will be removed in a future pull request

  // fastifyInstance.get('/login', (req, reply) => {
  //   return reply.send({
  //     template: "Home",
  //     title: "login",
  //     inner: "Login",
  //   });
  // });

  fastifyInstance.get('/', (req, reply) => {
    return reply.send({
      template: "Home",
      title: "ft_transcendence",
      inner: "Pdf",
    });
  });

  fastifyInstance.get('/game', (req, reply) => {
    return reply.send({
      template: "Home",
      title: "Pong soon",
      inner: "Game",
    });
  });

  fastifyInstance.get('/profile', { onRequest: needConnection }, (req, reply) => {
    return reply.send({
      template: "Home",
      replace: {username: req.user.username, biography: req.user.bio},
      title: "You", inner: "Profile1",
    });
  });

  fastifyInstance.get('/profile/:username', (req, reply) => {
    const username = req.params.username;
    const row = db.prepare('SELECT bio FROM users WHERE username = ?').get(username);
    if (!row)
      return reply.send({
        template: "Home", title: username, inner: "Error",
        replace: {status: "404 Not Found", message: "That user doesn't exist"},
      });
    return reply.send({
      template: "Home",
      replace: {username: username, biography: row.bio},
      title: username, inner: "Profile2",
    });
  });

  fastifyInstance.get('/blank', (req, reply) => {
    return reply.send({
      template: "Home",
      title: "Boooriiing",
      inner: "Blank",
    });
  });

  fastifyInstance.get("/db-logs", { onRequest: needConnection }, (req, reply) => {
    if (!req.user.admin) {
      return reply.code(403).send({
        template: "Error", title: "403 Forbidden",
        replace: {status: "403 NUH UH", message: "You need to be admin"},
      });
    }
    const file = fs.readFileSync(dbLogFile, { encoding: 'utf8', flag: 'r' })
      .replace(/(?:\r\n|\r|\n)/g, '<br>');
    // will need to be replaced soon if we wanna be clean.
    // Here it reads the whole file to send last 10Mo, waste of time if many Go long
    return reply.type('text/html').send(`<!DOCTYPE html><html><head><title>db logs</title></head>
      <body>${file.substring(file.length - 10 * 1024 * 1024)}</body></html>`);
  });
}
