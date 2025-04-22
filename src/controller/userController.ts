import {error} from "elysia";
import prisma from "../../prisma/prisma";
import {Prisma} from "../generated/prisma";

export async function getKey(jwt: any, headers: any) {
    try {

        const token = headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return error(401, {
                success: false,
                message: 'No token provided',
            })
        }

        const userId = await jwt.verify(token);

        if (!userId) {
            return error(401, {
                success: false,
                message: 'Token is not valid',
            })
        }

        const key = await prisma.users.findFirst({
            where: {
                id: userId.id
            },
            select: {
                api_key: true
            }
        })

        if (key) {
            return {
                success: true,
                api_key: key.api_key,
            }
        }


    } catch (e) {
        throw error(500, {
            success: false,
            message: "Internal Server Error"
        })
    }
}

export async function signUp(data: { name: string, email: string, password: string }, jwt: any) {

    const {name, email, password} = data;

    try {

        const hashedPassword = await Bun.password.hash(password, {
            algorithm: "bcrypt",
            cost: 5
        });

        const user = await prisma.users.create({
            data: {
                id: crypto.randomUUID(),
                name: name,
                password: hashedPassword,
                email: email,
                api_key: crypto.randomUUID()
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })

        const token = await jwt.sign({
            id: user.id,
        });


        return {
            success: true,
            message: "User created successfully",
            token: token,
            data: user
        }


    } catch (e) {

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                throw error(409, {
                    success: false,
                    message: "User already exist",
                })
            }
        }

        throw error(500, {
            success: false,
            message: "Internal Server Error"
        })
    }
}

export async function login(data: { email: string, password: string }, jwt: any) {

    const {email, password} = data;

    try {
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            }
        })

        if (user) {
            const pass = await Bun.password.verify(password, user.password, "bcrypt")
            if (pass) {

                const token = await jwt.sign({
                    id: user.id,
                });


                return {
                    success: true,
                    message: "User login successfully",
                    token: token,
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                }
            } else {
                return error(401, {
                    success: false,
                    message: "Password is incorrect",
                })
            }
        }

    } catch (e) {

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                throw error(404, {
                    success: false,
                    message: "User not found",
                })
            }
        }

        throw error(500, {
            success: false,
            message: "Internal Server Error"
        })

    }
}