
import db from "./database.js";
import { dbLogFile } from "./database.js";
import fs from 'fs';
import MSG from './messages_collection.js'
import { assetsPath } from "./config.js";

// response format for that page :
// {
//   template?: string,
//   title?: string,
//   replace?:  {[key:string]:string | {[language:string]:string}},
//   inner?: string,
//   success: boolean,
//   message:  {[key:string]:string | {[language:string]:string}}
// }
//
// if you reuse code for other page, take it into consideration
// it's collossal but this way it's gonna always have something to send
//
// It's mainly used by Nginx when it fails to treat the request

export async function errorRoutes(fastifyInstance) {
  // fastifyInstance.all('/404', (req, reply) => {
  //   return reply.code(404).send({
  //     template: "Error",
  //     replace: {status: "404 Not Found", message: MSG.ERR_404()}, 
  //     title: "404 Not Found",
  //     success: false,
  //     message: MSG.ERR_404(),
  //   });
  // });
  
  fastifyInstance.all('/413', (req, reply) => {
    return reply.code(413).send({
      template: "Home",
      title: "413 Payload Too Large",
      inner: "Error",
      replace: {status: "404 Not Found", message: MSG.ERR_413()},
      success: false,
      message: MSG.ERR_413(),
    });
  });

  fastifyInstance.all('/400', (req, reply) => {
    return reply.code(400).send({
      template: "Home",
      title: "400 Bad Request",
      inner: "Error",
      replace: {status: "400 Bad Request", message: MSG.ERR_400()},
      success: false,
      message: MSG.ERR_400(),
    });
  });
}
