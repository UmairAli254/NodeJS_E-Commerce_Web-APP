"use strict";
const mongoose = require("mongoose");

const Sr = new mongoose.Schema({
    title: String,
    category: String,
    description: String,
    price: Number,
    s_price: Number,
    primary_img: {
        type: String,
        // required: true
    },
    all_imgs: { 
        type: [String],
        // required: true
    }
});

const Mr = new mongoose.model("products", Sr);

module.exports = Mr;
