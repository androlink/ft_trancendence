
import db from "./database.js";
import { dbLogFile } from "./database.js";
import fs from 'fs';
import MSG from './messages_collection.js'

// response format for that page :
// {
//   template?: string,
//   title?: string,
//   replace?:  {[key:string]:string | {[language:string]:string}},
//   inner?: string,
// }
// if you reuse code for other page, take it into consideration

export async function apiRoutes(fastifyInstance) {
  fastifyInstance.setNotFoundHandler ( (req, reply) => {
    return reply.code(404).send({
      template: "Error",
      replace: {status: "404 Not Found", message: MSG.LOST()}, 
      title: "404 Not Found",
    });
  });

  fastifyInstance.addHook('onRequest', async (req, reply) => {
    try {
      await req.jwtVerify();
      const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
      reply.setCookie('account', token, {path: '/', httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 15 * 60, });
      reply.header('x-authenticated', true);
    } catch (err) {
      req.user = {id: -1};
      reply.header('x-authenticated', false);
    }
  });

  const needConnection = async (req, reply) => {
    if (req.user.id === -1) {
      return reply.code(403).send({
        template: "Home",
        title: MSG.LOGIN(),
        inner: "Login",
      });
    }
    const row = db.prepare("SELECT * FROM users WHERE id = ? -- needConnection from api_routes.js").get(req.user.id);
    if (!row) {
      // might happen naturally if jwt from a previous DB or account deleted
      reply.clearCookie("account");
      reply.header('x-authenticated', false);
      return reply.send({
        template: "Home",
        title: MSG.LOGIN(),
        inner: "Login",
      });
    }
    req.user.username = row.username;
    req.user.admin = row.admin;
    req.user.password = row.password;
    req.user.bio = row.bio;
  };

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
      title: MSG.PONG_SOON(),
      inner: "Game",
    });
  });

  fastifyInstance.get('/pong', (req, reply) => {
    return reply.send({
      template: "Home",
      title: "actually the real Pong",
      inner: "Pong",
    });
  });

  fastifyInstance.get('/profile', { onRequest: needConnection }, (req, reply) => {
    return reply.send({
      template: "Home",
      replace: {username: req.user.username, biography: req.user.bio},
      title: MSG.YOU(),
      inner: "Profile1",
    });
  });

  fastifyInstance.get('/profile/:username', (req, reply) => {
    const username = req.params.username;
    const row = db.prepare('SELECT bio FROM users WHERE username = ? -- profile/:username route').get(username);
    if (!row)
      return reply.send({
        template: "Home", title: username, inner: "Error",
        replace: {status: "404 Not Found", message: MSG.USERNAME_NOT_FOUND(username), 
      },
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
      title: MSG.BORING(),
      inner: "Blank",
    });
  });

  fastifyInstance.get("/db-logs", { onRequest: needConnection }, (req, reply) => {
    if (!req.user.admin) {
      return reply.code(403).send({
        template: "Error", title: "403 Forbidden",
        replace: {status: "403 NUH UH", message: MSG.NEED_ADMIN},
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
