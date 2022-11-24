"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./model/connection");
// const AMr = require("./model/admin");
const PMr = require("./model/posts");
const CMr = require("./model/categories");
const prod_Mr = require("./model/products");
const multer = require("multer");
const path = require("path");
// const bodyParser = require("body-parser");

// Variables
const static_path = __dirname + "/public";

// Middlewares & Template Engine
app.set("view engine", "ejs");
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// Categories to show on home and Other pages' header 

// Routing
app.get("/", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });
    const products = await prod_Mr.find().limit(8);

    res.render("home", {
        categories: all_categories,
        products: products
    });
});

app.get("/shop", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });
    const products = await prod_Mr.find();

    let obj = {
        categories: all_categories,
        products
    };

    res.render("shop", obj);
})

// Single Product
app.get("/product/:name/:id", async (req, res) => {

    const all_categories = await CMr.find({}, { category_name: true });
    const product = await prod_Mr.findOne({ _id: req.params.id });
    const same_cat_pro = await prod_Mr.find({ category: product.category });


    res.render("single-product", {
        categories: all_categories,
        product,
        same_cat_pro
    });
});

// Each Category Products
app.get("/category/:name/:id", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });
    const data = await prod_Mr.find({ category: req.params.name });

    res.render("single-category", {
        categories: all_categories,
        data,
        cat_name: req.params.name
    });
})



app.get("/contact", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("contact", {
        categories: all_categories
    });
})

app.get("/checkout", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("checkout", {
        categories: all_categories
    });
})

app.get("/cart", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("cart", {
        categories: all_categories
    });
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

app.get("/admin/categories", async (req, res) => {
    try {
        const data = await CMr.find();
        res.render("admin/categories/categories", {
            data: data
        });
    } catch (err) {
        res.status(501).end(err);
    }
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
});
// Delete post
app.get("/admin/posts/delete/:id", async (req, res) => {
    try {
        await PMr.findByIdAndDelete(req.params.id);
        res.redirect("//localhost:3000/admin/posts");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


// Categories Routes 
app.post("/admin/categories/new/publish", async (req, res) => {
    try {
        const data = await new CMr(req.body);
        await data.save();
        res.redirect("//localhost:3000/admin/categories");
    } catch (err) {
        res.status(500).send(err);
    }

});
// Edit Category
app.get("/admin/categories/update/:id/:cat_name", async (req, res) => {
    try {
        await CMr.findByIdAndUpdate(req.params.id, { category_name: req.params.cat_name });
        res.redirect("//localhost:3000/admin/categories");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
// Delete Category
app.get("/admin/categories/delete/:id", async (req, res) => {
    try {
        await CMr.findByIdAndDelete(req.params.id);
        res.redirect("//localhost:3000/admin/categories");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Admin Product Pages
app.get("/admin/products", async (req, res) => {
    const data = await prod_Mr.find();
    const categories = await CMr.find({}, { category_name: true, _id: 0 });

    res.render("admin/products/products", {
        data: data,
        categories: categories
    });
});

// Multer 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/img/product_imgs");
    },
    filename: function (req, file, cb) {
        cb(null, path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: "primary_img", maxCount: 1 }, { name: "all_imgs" }]);


app.post("/admin/products/new", multipleUpload, async (req, res) => {
    try {

        // req.files will return an array that will contain two objects, 1st will be of the first file field and 2nd one will be second file field of the form and then we have to get the values from that object of arrays
        const all_imgs_by_user = req.files.all_imgs || [];
        const gallery = new Array();
        all_imgs_by_user.forEach((ele, ind) => {
            gallery[ind] = req.files.all_imgs[ind].filename;
        });

        const data = await prod_Mr({
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            price: req.body.price,
            s_price: req.body.s_price,
            primary_img: req.files.primary_img[0].filename,
            all_imgs: gallery
        });
        await data.save();

        res.redirect("http://localhost:3000/admin/products/");
    } catch (err) {
        res.status(500).send(err);
    }
});


// API Get Product Details
app.get("/admin/products/data-for-update/:id", async (req, res) => {
    try {
        const data = await prod_Mr.findOne({ _id: req.params.id });
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});
// Update Product after hitting the Form Update Button
app.post("/admin/product/update/:id", multipleUpload, async (req, res) => {
    try {
        const all_imgs_by_user = req.files.all_imgs || [];
        const gallery = new Array();
        all_imgs_by_user.forEach((ele, ind) => {
            gallery[ind] = req.files.all_imgs[ind].filename;
        });

        let primary_image
        try {
            primary_image = req.files.primary_img[0].filename;
        } catch {
            primary_image = "";
        }

        if (primary_image === "" && gallery.length !== 0) {
            await prod_Mr.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                s_price: req.body.s_price,
                all_imgs: gallery
            });
        } else if (primary_image !== "" && gallery.length === 0) {
            await prod_Mr.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                s_price: req.body.s_price,
                primary_img: primary_image,
            });
        } else if (primary_image === "" && gallery.length === 0) {
            await prod_Mr.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                s_price: req.body.s_price,
            });
        } else {
            await prod_Mr.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                s_price: req.body.s_price,
                primary_img: primary_image,
                all_imgs: gallery

            });
        }

        res.redirect("http://localhost:3000/admin/products/");

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


// Delete Product
app.get("/admin/products/delete/:id", async (req, res) => {
    try {
        await prod_Mr.findByIdAndDelete(req.params.id);
        res.redirect("http://localhost:3000/admin/products/");
    } catch (err) {
        res.status(500).send(err);
    }
});










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




// Extra APIs than default routers
app.get("/admin/all-categories", async (req, res) => {
    try {
        const data = await CMr.find({}, { category_name: true, _id: 0 });
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
})







// Server
app.listen(port, "localhost", () => {
    console.log("Server is running on port", port);
})