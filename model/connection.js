"use strict";
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_URL, {
    family: 4
})
    .then(() => console.log("Connected Successfully!"))
    .catch(err => console.log(err));