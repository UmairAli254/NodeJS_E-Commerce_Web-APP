"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./model/connection");
// const AMr = require("./model/admin");
const PMr = require("./model/posts");

// Variables
const static_path = __dirname + "/public";

// Middlewares & Template Engine
app.set("view engine", "ejs");
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}))



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

// Admin Routes
// Dashboard Routes
app.get("/admin-login", (req, res) => {
    res.render("admin/login");
});

app.get("/admin/dashboard", (req, res) => {
    res.render("admin/dashboard");
});

app.get("/admin/posts", async (req, res) => {
    try {
        const data = await PMr.find();
        res.render("admin/all_posts/all_posts", {
            data: data
        });
    } catch (err) {
        res.status(501).end(err);
    }
});

app.get("/admin/categories", (req, res) => {
    res.render("admin/categories/categories");
});

app.get("/admin/logout", (req, res) => {
    res.render("logout");
})

// Sub Routes
// Add New post
app.get("/admin/posts/new", (req, res) => {
    res.render("admin/all_posts/new_post");
})
// publish post when submit the form 
app.post("/admin/posts/new/publish", async (req, res) => {
    try {
        const data = await new PMr(req.body);
        const ret = await data.save();
        res.redirect("http://localhost:3000/admin/posts/new");
    } catch (err) {
        res.status(500).send(err);
    }
})
// Edit Post
app.get("/admin/posts/edit/:id", async (req, res) => {
    const data = await PMr.findOne({ _id: req.params.id });
    res.render("admin/all_posts/edit_post", {
        id: data._id,
        title: data.title,
        content: data.description
    });
})

// Update post when submit the form
app.post("/admin/posts/update/:id", async (req, res) => {
    try {
        await PMr.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("//localhost:3000/admin/posts");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})
// Delete post
app.get("/admin/posts/delete/:id", async (req, res) => {
    try {
        await PMr.findByIdAndDelete(req.params.id);
        res.redirect("//localhost:3000/admin/posts");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})


// Admin Post Routes

// Verify Login Data
// app.post("/admin-login", async (req, res) => {
//     try {
//         const data = await AMr.findOne();
//         res.status(200).send(data);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });








// Server
app.listen(port, "localhost", () => {
    console.log("Server is running on port", port);
})