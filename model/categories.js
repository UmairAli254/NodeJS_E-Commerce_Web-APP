"use strict";
const mongoose = require("mongoose");


const Sr = new mongoose.Schema({
    category_name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});


const Mr = new mongoose.model("categories", Sr);

module.exports = Mr;