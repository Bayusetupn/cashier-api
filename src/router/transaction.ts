import {Elysia, t} from "elysia";
import {validateApiKey} from "../middleware/validate";
import {createTransaction, getAllTransactions, getDetails} from "../controller/transactionController";

export const transaction = new Elysia({prefix : "/trx"})
    .use(validateApiKey)
    .get('/detail/:id',({params}) => getDetails(params.id))
    .get('/',({userId})=>getAllTransactions(userId))
    .post('/add',({userId,body})=>createTransaction(userId,body),{
        body : t.Object({
            total : t.Number({
                error : {
                    success: false,
                    message: "Total must be filled"
                }
            }),
            items : t.Array(
                t.Object({
                    name : t.String({
                        error : {
                            success :  false,
                            message: "Name must be filled"
                        }
                    }),
                    item_id: t.String({
                        error : {
                            success :  false,
                            message: "item_id not found"
                        }
                    }),
                    quantity: t.Number({
                        minimum : 0,
                        error : {
                            success : false,
                            message : "quantity must be filled"
                        }
                    }),
                    price: t.Number({
                        minimum : 0,
                        error : {
                            success : false,
                            message : "price must be filled"
                        }
                    }),
                    subtotal: t.Number({
                        minimum : 0,
                        error : {
                            success : false,
                            message : "subtotal must be filled"
                        }

                    })
                })
            )
        })
    })