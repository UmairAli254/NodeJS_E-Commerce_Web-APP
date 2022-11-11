"use strict";
const mongoose = require("mongoose");


const Sr = new mongoose.Schema({
    email: String,
    pass: String,
    active: Boolean
});

const Mr = new mongoose.model("admin", Sr);

module.exports = Mr;