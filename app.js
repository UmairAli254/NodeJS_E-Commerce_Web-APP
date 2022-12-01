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
const UMr = require("./model/user-signup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const noCache = require("nocache");
const cart_pro_Mr = require("./model/cart");
const fav_pro_Mr = require("./model/favourite");
require("dotenv").config();


// Variables
const static_path = __dirname + "/public";

// Middlewares & Template Engine
app.set("view engine", "ejs");
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(noCache());

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
        same_cat_pro,
        cat_name: req.params.name
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
});

// Blog
app.get("/blog", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });
    const posts = await PMr.find();

    res.render("blog", {
        categories: all_categories,
        posts
    });
});
// Blog Post API
app.get("/blog/:id", async (req, res) => {
    try {
        const post = await PMr.findOne({ _id: req.params.id });
        console.log(post);
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get("/contact", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("contact", {
        categories: all_categories
    });
});

// User Account
// Registeration
app.get("/register", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("register", {
        categories: all_categories
    });
});
app.post("/register", async (req, res) => {
    try {
        const pass = req.body.pass;
        const c_pass = req.body.c_pass;

        if (pass === c_pass) {
            const data = await new UMr({
                name: req.body.name,
                email: req.body.email,
                pass: pass
            });
            data.singnUpToken();
            const ret = await data.save();
            res.redirect("//localhost:3000/register");

        } else {
            res.send("Password in not same!");
        }
    } catch (err) {
        res.status(500).send(err);
    }

})
// Login
app.get("/login", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("login", {
        categories: all_categories
    });
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;
        const data = await UMr.findOne({ email });
        const isMatch = await bcrypt.compare(pass, data.pass);

        if (isMatch) {
            const loginToken = await data.genLoginToken();
            res.cookie("eShopperLoginToken", loginToken);
            // res.status(200).send(req.body);
            res.redirect("http://localhost:3000/profile");
        } else
            res.status(500).send("Password is wrong");

    } catch {
        res.send("Email Not Found!");
    }
});

// Profile Page
app.get("/profile", async (req, res) => {
    try {
        const all_categories = await CMr.find({}, { category_name: true });

        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);
        if (isVerified) {
            res.render("profile", {
                categories: all_categories
            });
        } else
            res.redirect("//localhost:3000/login");
    } catch {
        res.redirect("//localhost:3000/login");
    }

});

app.get("/logout", (req, res) => {
    res.clearCookie("eShopperLoginToken");
    res.redirect("//localhost:3000/login");
});

// End User Account

app.get("/checkout", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    res.render("checkout", {
        categories: all_categories
    });
})

// Cart Page and Add to cart process below
// Cart Page
app.get("/cart", async (req, res) => {
    try {
        const all_categories = await CMr.find({}, { category_name: true });
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await cart_pro_Mr.find({ user_email: isVerified });

        res.render("cart", {
            categories: all_categories,
            products: data
        });

    } catch (err) {
        res.status(500).send(err);
    }

});

// API to Get product by id when click on "Add To Cart"
app.get("/get-product-for-cart/:id", async (req, res) => {
    const data = await prod_Mr.findById(req.params.id);
    res.send(data);
})
// API to Get Loggedin User's id when click on "Add To Cart"
app.get("/get-loggedin-user-email", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            res.status(200).send(JSON.stringify(isVerified));
        } else {
            res.status(404).send("user is not loggedin");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
// Store product to the database via API when user clicks on the add_to_cart button
app.post("/store-cart-porduct-to-db", async (req, res) => {
    try {
        const data = await cart_pro_Mr(req.body);
        console.log(data);
        const ret = await data.save();
        ret ? res.status(201).send(true) : res.status(500).send(false);
    } catch (err) {
        res.status(500).send(err);
    }
});
// API to get cart products that are already added into db
app.get("/get-cart-products", async (req, res) => {

    try {
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await cart_pro_Mr.find({ user_email: isVerified });
        res.status(200).send(data);


    } catch (err) {
        res.status(500).send(err);
    }

});
// Remove product from cart
app.get("/remove-pro-from-cart/:id", async (req, res) => {
    const data = await cart_pro_Mr.findByIdAndDelete(req.params.id);
    res.redirect("http://localhost:3000/cart");
});


// Favourtie Pages
app.get("/favourites", async (req, res) => {
    try {
        const all_categories = await CMr.find({}, { category_name: true });
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await fav_pro_Mr.find({ user_email: isVerified });

        res.render("favourite", {
            categories: all_categories,
            products: data
        });

    } catch (err) {
        res.status(500).send(err);
    }

});

// Store favourtie product to db
app.post("/store-fav-porduct-to-db", async (req, res) => {
    try {
        const data = await fav_pro_Mr(req.body);
        console.log(data);
        const ret = await data.save();
        ret ? res.status(201).send(true) : res.status(500).send(false);
    } catch (err) {
        res.status(500).send(err);
    }
});

// API to Get product by id when click on "Add To Favourite"
app.get("/get-product-for-fav/:id", async (req, res) => {
    try {
        const data = await prod_Mr.findById(req.params.id);
        console.log(data);
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

// API to get favourite products that are already added into db
app.get("/get-fav-products", async (req, res) => {

    try {
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await fav_pro_Mr.find({ user_email: isVerified });
        res.status(200).send(data);


    } catch (err) {
        res.status(500).send(err);
    }

});

// Remove product from Favourite
app.get("/remove-pro-from-fav/:id", async (req, res) => {
    const data = await fav_pro_Mr.findByIdAndDelete(req.params.id);
    res.redirect("http://localhost:3000/favourites");
});








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