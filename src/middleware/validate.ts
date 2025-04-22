import {Elysia, error} from "elysia";
import prisma from "../../prisma/prisma";

export const validateApiKey = (app: Elysia) =>
    app.derive(async ({ request }) => {
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return error(401, {
                success :  false,
                message:  'Unauthorized',
            })
        }

        const user = await prisma.users.findUnique({
            where: { api_key: apiKey },
            select: {
                id: true
            }
        });

        if (!user) {
            throw error(401, {
                success: false,
                message: "Invalid API Key",
            });
        }

        return { userId : user.id  };
    })