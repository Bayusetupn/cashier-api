import { error } from "elysia";
import prisma from "../../prisma/prisma";

export async function getDetails(trxId:string){
    try {

        const trx = await prisma.transactions.findFirst({
            where:{
                id: trxId,
            }
        })

        const items = await prisma.transaction_items.findMany({
            where : {
                transaction_id : trxId
            }
        })

        if(!items && !trx){
            return error(404,{
                success: false,
                message: "No transactions were found"
            })
        }

        return {
            success: true,
            message : "All transactions were found",
            data : {
                trx,
                items
            }
        }

    }catch (e) {
        throw error (500,{
            success: false,
            message: "Internal server error"
        })
    }
}

export async function getAllTransactions(userId:string) {

    try {

        const trx = await prisma.transactions.findMany({
            where : {
                user_id : userId
            }
        })

        if(!trx){
            return error(404,{
                success: false,
                message: "No transactions were found"
            })
        }

        return {
            success: true,
            message : "All transactions were found",
            data : trx
        }

    }catch (e) {
        throw error (500,{
            success: false,
            message: "Internal server error"
        })
    }

}

export async function createTransaction(userId: string, body: {
    total: number,
    items: Array<{
        name : string,
        item_id: string,
        quantity: number,
        price: number,
        subtotal: number
    }>
}) {
    const { total, items } = body;

    const trxId= crypto.randomUUID()

    try {
        await prisma.$transaction(async (tx) => {
            const trx = await tx.transactions.create({
                data: {
                    id: trxId,
                    user_id: userId,
                    total_price: total
                }
            });

            const trxItems = items.map(item => ({
                id: crypto.randomUUID(),
                name :  item.name,
                transaction_id: trx.id,
                item_id: item.item_id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            }));

            await tx.transaction_items.createMany({
                data: trxItems
            });

            await Promise.all(items.map(item =>
                tx.items.update({
                    where: { id: item.item_id },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                })
            ));
        });

        const created = await prisma.transactions.findFirst({
            where: {
                id: trxId
            },
            select : {
                id : true,
                date: true,
            }
        })

        return {
            success: true,
            message: "Transaction Created.",
            data : created
        };

    } catch (e) {
        throw error(500, {
            success: false,
            message: "Internal Server Error"
        });
    }
}
