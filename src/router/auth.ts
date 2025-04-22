import {Elysia, t} from "elysia";
import {getKey, login, signUp} from "../controller/userController";
import {jwt} from "@elysiajs/jwt";

export const auth = new Elysia({prefix: '/auth'})
    .use(
        jwt({
            name: 'jwt',
            secret: Bun.env.SECRET!,
        })
    )
    .post('/signup', ({body, jwt}) => signUp(body, jwt), {
        detail: {
            security: []
        },
        body: t.Object({
            name: t.String({
                error: {
                    success: false,
                    message: "name is not valid"
                }
            }),
            email: t.String({
                format: "email",
                error: {
                    success: false,
                    message: "email is not valid"
                }
            }),
            password: t.String({
                minlength: 8,
                error: {
                    success: false,
                    message: "minimum 8  characters"
                }
            })
        })
    })
    .post('/login', ({body, jwt}) => login(body, jwt), {
        detail: {
            security: []
        },
        body: t.Object({
            email: t.String({
                format: 'email',
                error: {
                    success: false,
                    message: "email is not valid"
                }
            }),
            password: t.String({
                minlength: 8,
                error: {
                    success: false,
                    message: "minimum 8  characters"
                }
            })
        })
    })
    .get('/key', ({jwt, headers}) => getKey(jwt, headers), {
        detail: {
            security: []
        }
    })

