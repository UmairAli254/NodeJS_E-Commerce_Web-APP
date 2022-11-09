"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Variables
const static_path = __dirname + "/public";
 
// Middlewares & Template Engine
app.set("view engine", "ejs");
app.use(express.static(static_path));



// Routing
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/shop", (req, res) => {
    res.render("shop");
})

app.get("/detail", (req, res) => {
    res.render("detail");
})

app.get("/contact", (req, res) => {
    res.render("contact");
})

app.get("/checkout", (req, res) => {
    res.render("checkout");
})

app.get("/cart", (req, res) => {
    res.render("cart");
})








// Server
app.listen(port, "localhost", () => {
    console.log("Server is running on port", port);
})