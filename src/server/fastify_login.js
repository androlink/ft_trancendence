export async function userRoutesLogin(fastify) {
    // Route to sign a token
    fastify.post('/login', async (request, reply) => {
    const token = fastify.jwt.sign({ user: 'geymat' });
    return { token };
    });

    // Route to verify token
    fastify.get('/protected', {
        preHandler: async (request, reply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    reply.send(err);
                }
            }
    }, async (request, reply) => {
        return { message: 'You are authenticated', user: request.user };
    });
}