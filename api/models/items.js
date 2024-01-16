const mongoose = require("mongoose");

/**
 * @openapi
 *  components:
 *   schemas:
 *    Item:
 *     type: object
 *     description: Item we want to borrow
 *     properties:
 *      title:
 *       type: string
 *       description: Name of the item
 *       example: Godfather
 *      author:
 *       type: string
 *       description: Name of the author
 *       example: Francis Ford Coppola
 *      keywords:
 *       type: string
 *       description: Keywords separated by comma
 *       example: movie, mafia, al pacino
 *      status:
 *       type: string
 *       description: Available of borrowed
 *       enum: ["available", "borrowed"]
 *      description:
 *       type: string
 *       description: Short description of item
 *       example: The Godfather is a trilogy of American crime films directed by Francis Ford Coppola inspired by the 1969 novel of the same name by Italian American author Mario Puzo.
 *     required:
 *      - title
 *      - author
 *      - keywords
 *      - status
 *      - description
 *    ArrayOfItems:
 *     type: array
 *     description: Array of items
 *     items:
 *      $ref: '#/components/schemas/Item'
 */
const itemsSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    itemType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Type'
    },
    title: {type: String, required: [true, "Title is required!"]},
    author: {type: String, required: [true, "Author is required!"]},
    status: {
        type: String,
        required: [true, "Status is required!"],
        enum: ["available", "borrowed"]
    },
    keywords: {
        type: String,
        required: [true, "Keywords are required!"],
    },
    description: {
        type: String,
        required: [true, "Description is required!"],
    },
    counterBorrowed: {
        type: Number,
        default: 0
    },
    histories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'History'
    }],
    borrowedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    borrowedByName: {
        type: String,
    },
    shouldBeReturned: {
        type: Date
    }
});

mongoose.model("Item", itemsSchema, "Items");
