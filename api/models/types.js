const mongoose = require("mongoose");

/**
 * @openapi
 *  components:
 *   schemas:
 *    Type:
 *     type: object
 *     description: Type of items
 *     properties:
 *      name:
 *       type: string
 *       description: Name of the type
 *       example: Book
 *      borrowDays:
 *       type: number
 *       description: For how many days can you borrow this item type
 *       example: 12
 *      description:
 *       type: string
 *       description: Short description of this type
 *     required:
 *      - name
 *      - borrowDays
 */
const itemTypesSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {type: String, required: [true, "Title is required!"]},
    borrowDays: {
        type: Number,
        required: [true, "Borrow days is required!"],
        min: 1,
        max: 90,
    },
    noOfItems: {
        type: Number,
        default: 0
    },
    description: {type: String, required: false},
    createdOn: {type: Date, default: Date.now},
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
});

mongoose.model("Type", itemTypesSchema, "Types");