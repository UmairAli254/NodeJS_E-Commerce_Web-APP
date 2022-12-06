"use strict";
const mongoose = require("mongoose");

const Sr = new mongoose.Schema({
 pro_title: String,
 price: Number,
 s_price: Number,
 quantity: Number,
 shipping_cost: Number,
 total_amount: Number,
 pro_img: String,
 user_email: String,
 pro_id: String,
 date: {
  type: Date,
  default: Date.now
 },
 delivered: {
  type: Boolean,
  default: false
 }
});

const Mr = new mongoose.model("sold_products", Sr);

module.exports = Mr;