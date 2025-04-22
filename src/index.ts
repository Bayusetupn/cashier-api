import { Elysia } from "elysia";
import {auth} from "./router/auth";
import { items } from "./router/items";
import { transaction } from "./router/transaction";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors';

const app = new Elysia()
    .use(cors())
    .use(swagger({
        path : "/documentation",
        documentation : {
            info : {
                title : "Cashier API",
                description : "Cashier API documentation",
                version : "1.0.0"
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'x-api-key'
                    },
                }
            },
            security: [
                {
                    ApiKeyAuth: []
                }
            ]
        }
    }))
    .use(auth)
    .use(items)
    .use(transaction)
    .listen(8080)

console.log("Listening on http://localhost:8080")

