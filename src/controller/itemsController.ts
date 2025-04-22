import prisma from "../../prisma/prisma";
import {error} from "elysia";
import { Prisma } from "../generated/prisma/client";

export async function getAllItems(userId:string) {

    try {
        const items = await prisma.items.findMany({
            where: { user_id: userId }
        });

        if (!items[0]?.user_id) {
            return error(404, {
                success: false,
                message: "User doesn't have items yet"
            });
        }

        return {
            success: true,
            message: "Getting items successfully",
            data: items
        };

    }catch (e) {

        throw error(500,{
            success: false,
            message: "Internal server error"
        })

    }
}

export async function addItem(userId: string,data: {name:string,price:number,stock:number}) {

    const {name, price,stock} = data;

    try {
        const item = await prisma.items.create({
            data : {
                id: crypto.randomUUID(),
                user_id : userId,
                name: name,
                price: price,
                stock: stock,
            },select : {
                id: true,
                name: true,
                price: true,
                stock: true
            }
        })

        if (!item) {
            return error(400, {
                success: false,
                message: "Cannot add item"
            })
        }

        return {
            success: true,
            message: "Item added successfully",
            data: item
        }

    }catch (e){
        throw error(500,{
            success: false,
            message: "Internal server error"
        })
    }

}

export async function updateItem(itemId:string,data: {name?:string,price?:number,stock?:number}) {

    const {name, price,stock} = data;

    try {

        const update =  await prisma.items.update({
            where : {id : itemId},
            data : {
                ...(name && {name: name}),
                ...(price && {price: price}),
                ...(stock && {stock: stock}),
            },
            select : {
                id: true,
                name: true,
                price: true,
                stock: true
            }
        })

        if (!update) {
            return error(400, {
                success: false,
                message: "Cannot update item"
            })
        }

        return {
            success: true,
            message: "Item updated successfully",
            data: update
        }

    }catch (e){
        throw error(500,{
            success: false,
            message: "Internal server error"
        })
    }

}

export async function deleteItem(itemId:string) {

    try {

        const deleteItem = await prisma.items.delete({
            where: {id : itemId},
        })

        if (!deleteItem) {
            return error(404, {
                success: false,
                message: "Cannot delete item"
            })
        }

        return {
            success: true,
            message: "Item deleted successfully",
        }

    }catch (e){

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2025"){
                throw error(404,{
                    success: false,
                    message: "Item not found",
                })
            }
        }

        throw error(500,{
            success: false,
            message: "Internal server error"
        })
    }
}