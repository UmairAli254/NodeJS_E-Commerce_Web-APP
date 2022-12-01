"use strict";
const mongoose = require("mongoose");

const Sr = new mongoose.Schema({
 pro_id: {
  type: String,
  required: true
 },
 pro_title: {
  type: String,
  required: true
 },
 s_price: {
  type: Number,
  required: true
 },
 pro_img: {
  type: String,
  required: true
 },
 user_email: {
  type: String,
  required: true
 },
 date: {
  type: Date,
  default: Date.now()
 }

});

const Mr = new mongoose.model("fav_products", Sr);


module.exports = Mr;