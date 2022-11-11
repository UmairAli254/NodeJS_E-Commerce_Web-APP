"use strict";
const mongoose = require("mongoose");


const Sr = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});


const Mr = new mongoose.model("pages", Sr);

module.exports = Mr;