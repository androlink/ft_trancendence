
export async function loginRoutes(fastifyInstance) {
    fastifyInstance.post('/login', async (req, reply) => {
        // might add a cleaner addHook of type prevalidation for the 2 "if" below. 
        // For now it is working enough as it is, and more readable
        if (!("content-type" in req.headers)) {
            return reply.code(415).send(req.headers);//"Content-Type not found in a post request");
        }
        if(req.headers["content-type"] !== "application/x-www-form-urlencoded"){
            return reply.code(415).send("We only support application/x-www-form-urlencoded");
        }
        const data = req.body

        if (!Object.hasOwn(data, "username"))
            return { success: false, reason: "query username missing" };
        if (!Object.hasOwn(data, "password"))
            return { success: false, reason: "query password missing" };
        if (data["username"] === "admin")
            return { success: true, reason: "connected"}
        return { success: false, reason: "no account yet" };
    });
}
