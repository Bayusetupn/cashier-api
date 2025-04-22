import {Elysia, t} from "elysia";
import {addItem, deleteItem, getAllItems, updateItem} from "../controller/itemsController";
import {validateApiKey} from "../middleware/validate";

export const items = new Elysia({prefix: '/items'})
    .use(validateApiKey)
    .get('/', ({userId}) => getAllItems(userId))
    .post('/add', ({userId, body}) => addItem(userId, body), {
        body: t.Object({
            name: t.String({
                error: {
                    success: false,
                    message: "Name must be filled"
                }
            }),
            price: t.Number({
                minimum: 0,
                error: {
                    success: false,
                    message: "Price must be filled"
                }
            }),
            stock: t.Number({
                minimum: 0,
                error: {
                    success: false,
                    message: "Stock must be filled"
                }
            })
        })
    })
    .put('/update/:id', ({params, body}) => updateItem(params.id, body), {
        detail : {
            security: [
                {
                    ApiKeyAuth: []
                }
            ]
        },
        body: t.Object({
            name: t.Optional(
                t.String()
            ),
            price: t.Optional(
                t.Number()
            ),
            stock: t.Optional(
                t.Number()
            )
        })
    })
    .delete('/delete/:id', ({params}) => deleteItem(params.id))