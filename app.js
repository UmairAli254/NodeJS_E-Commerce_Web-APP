"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./model/connection");
const AMr = require("./model/admin");
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
const sold_Mr = require("./model/sold_products");


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
    const products = await prod_Mr.find().sort({ _id: -1 }).limit(8);

    res.render("home", {
        categories: all_categories,
        products: products
    });
});

// app.get("/shop", async (req, res) => {
//     const all_categories = await CMr.find({}, { category_name: true });
//     const products = await prod_Mr.find().sort({ _id: -1 });

//     let obj = {
//         categories: all_categories,
//         products
//     };

//     res.render("shop", obj);
// });
app.get("/shop", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });
    // const products = await prod_Mr.find().sort({ _id: -1 });

    let obj = {
        categories: all_categories
    };

    res.render("shop", obj);
});

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
        // console.log(post);
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
            res.redirect("/register");

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
            res.redirect("/profile");
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

        const purchased_items = await sold_Mr.find({ user_email: isVerified }).sort({ _id: -1 });
        const data = await UMr.findOne({ email: isVerified });

        if (isVerified) {
            res.render("profile", {
                categories: all_categories,
                data, purchased_items
            });
        } else
            res.redirect("/login");
    } catch {
        res.redirect("/login");
    }

});

const user_profile_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/img/product_imgs");
    },
    filename: function (req, file, cb) {
        cb(null, path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname));
    }
});
const user_profile_upload = multer({ storage: user_profile_storage });

app.post("/profile-update", user_profile_upload.single("userImage"), async (req, res) => {

    const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);
    // console.log(req.file);
    // console.log(req.body);

    let filename;
    try {
        filename = req.file.filename;
    } catch {
        filename = "";
    }


    if (filename === "") {
        await UMr.updateOne({ email: isVerified }, {
            $set: {
                name: req.body.name,
                address: req.body.address
            }
        });
        res.redirect("/profile");
    } else {
        await UMr.updateOne({ email: isVerified }, {
            $set: {
                name: req.body.name,
                address: req.body.address,
                profile_img: req.file.filename
            }
        });
        res.redirect("/profile");
    }

    // res.redirect("/profile");
})


app.get("/logout", (req, res) => {
    try {

        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);
        if (isVerified) {

            res.clearCookie("eShopperLoginToken");
            res.redirect("/login");
        }
    } catch {
        res.redirect("/login");
    }
});

// End User Account
app.get("/checkout", async (req, res) => {
    try {
        const all_categories = await CMr.find({}, { category_name: true });
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await cart_pro_Mr.find({ user_email: isVerified });

        res.render("checkout", {
            categories: all_categories,
            products: data
        });

    } catch (err) {
        res.status(500).send(err);
    }
});

// Cart Page and Add to cart process below
// Cart Page
app.get("/cart", async (req, res) => {
    try {

        const all_categories = await CMr.find({}, { category_name: true });
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await cart_pro_Mr.find({ user_email: isVerified });

        if (isVerified) {
            res.render("cart", {
                categories: all_categories,
                products: data
            });
        } else
            res.redirect("/login");


    } catch (err) {
        res.redirect("/login");
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
        // console.log(data);
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
    res.redirect("/cart");
});


// Favourtie Pages
app.get("/favourites", async (req, res) => {
    try {
        const all_categories = await CMr.find({}, { category_name: true });
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);

        const data = await fav_pro_Mr.find({ user_email: isVerified });

        if (isVerified) {
            res.render("favourite", {
                categories: all_categories,
                products: data
            });
        } else
            res.redirect("/login");

    } catch (err) {
        res.redirect("/login");

    }

});

// Store favourtie product to db
app.post("/store-fav-porduct-to-db", async (req, res) => {
    try {
        const data = await fav_pro_Mr(req.body);
        // console.log(data);
        const ret = await data.save();
        ret ? res.status(201).send(true) : res.status(500).send(false);
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
    await fav_pro_Mr.findByIdAndDelete(req.params.id);
    res.redirect("/favourites");
});

// Store the sold products to database
app.post("/store-sold-to-db", async (req, res) => {
    try {
        const data = await sold_Mr.insertMany(req.body);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete the products from cart after purchasing
app.get("/remove-products-from-cart", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.eShopperLoginToken, process.env.SECRET_KEY);
        const data = await cart_pro_Mr.deleteMany({ email: isVerified });
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});








// Live Search Engine APIs
app.get("/get-all-products", async (req, res) => {
    const data = await prod_Mr.find({}, { title: true, primary_img: true, s_price: true });
    res.send(data);
})
// Search page for the products from the serach engine
app.get("/search/:name?", async (req, res) => {
    const all_categories = await CMr.find({}, { category_name: true });

    if (req.params.name) {
        const data = await prod_Mr.find({ title: { $regex: `${req.params.name}`, $options: "i" } });
        // console.log(data);
        res.render("searched", {
            categories: all_categories,
            search_pro: req.params.name,
            data
        })
    } else {
        const data = await prod_Mr.find();
        // console.log(data);
        res.render("searched", {
            categories: all_categories,
            search_pro: "You didn't searched anything!",
            msg: "Showing All Available Products",
            data
        })
    }
});


// Paginaion
// Next
app.get("/shop/next-page/:skip", async (req, res) => {
    try {
        let skip = req.params.skip * 12;
        // let limit = req.params.limit * 12;
        const data = await prod_Mr.find().skip(skip).limit(12);

        // console.log(data);
        res.status(200).send(data);
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }

});

// Previous
app.get("/shop/pre-page/:skip/:last_page_data", async (req, res) => {
    try {
        let skip = req.params.skip * 12;
        // let limit = req.params.limit * 12;
        let previous_last_page_data = req.params.last_page_data;
        let limit = 12 + parseInt(previous_last_page_data);
        console.log(limit);
        const data = await prod_Mr.find().skip(skip).limit(limit).sort({ _id: -1 });

        // console.log(data);
        res.status(200).send(data);
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }

});

// Pagination ends here







// Admin Routes
// Dashboard Routes
app.get("/admin-login", (req, res) => {
    res.render("admin/login");
});

app.post("/admin-login", async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;
        const data = await AMr.findOne({ email });
        const isMatch = data.pass === pass;

        if (isMatch) {
            const loginToken = jwt.sign(email, process.env.SECRET_KEY);
            res.cookie("adminLoginToken", loginToken);
            res.redirect("/admin/dashboard");
        } else
            res.status(500).send("Password is wrong");

    } catch {
        res.send("Email Not Found!");
    }
});

app.get("/admin-login", (req, res) => {
    res.render("admin/login");
});


app.get("/admin/dashboard", async (req, res) => {
    try {
        const posts = await PMr.find();
        const products = await prod_Mr.find();
        const sold_products = await sold_Mr.find().sort({ _id: -1 });
        const registered_users = await UMr.find();

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            res.render("admin/dashboard", {
                posts, products, sold_products, registered_users
            });
        }
    } catch {
        res.redirect("/admin-login");
    }
});

app.get("/admin/posts", async (req, res) => {
    try {
        const data = await PMr.find();

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified)
            res.render("admin/all_posts/all_posts", {
                data: data
            });
    } catch (err) {
        res.redirect("/admin-login");
    }
});

app.get("/admin/categories", async (req, res) => {
    try {
        const data = await CMr.find();

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified)
            res.render("admin/categories/categories", {
                data: data
            });
    } catch (err) {
        res.redirect("/admin-login");
    }
});

app.get("/admin/registered-users", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            const data = await UMr.find();
            res.render("admin/registered_users", {
                data: data
            });
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});

app.get("/admin/sold-products", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            const data = await sold_Mr.find().sort({ _id: -1 });
            const registered_users = await UMr.find();

            res.render("admin/sold_products", {
                data, registered_users
            });
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});

// Delivery Status Update APIs
// Update delivery status API upon click on the toggle
app.post("/admin/sold-delivery-update/:id", async (req, res) => {
    try {
        const data = await sold_Mr.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        res.status(201).send(data);
    } catch (err) {
        res.status(501).end(err);
    }
});


app.get("/admin/logout", (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            res.clearCookie("adminLoginToken");
            res.redirect("/admin-login");
        }
    } catch {
        res.redirect("/admin-login");
    }
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
        res.redirect("/admin/posts/new");
    } catch (err) {
        res.status(500).send(err);
    }
})
// Edit Post
app.get("/admin/posts/edit/:id", async (req, res) => {

    try {
        const data = await PMr.findOne({ _id: req.params.id });

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified)
            res.render("admin/all_posts/edit_post", {
                id: data._id,
                title: data.title,
                content: data.description
            });
    } catch {
        res.redirect("/admin-login");
    }
})

// Update post when submit the form
app.post("/admin/posts/update/:id", async (req, res) => {
    try {

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            await PMr.findByIdAndUpdate(req.params.id, req.body);
            res.redirect("/admin/posts");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});
// Delete post
app.get("/admin/posts/delete/:id", async (req, res) => {
    try {

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {

            await PMr.findByIdAndDelete(req.params.id);

            res.redirect("/admin/posts");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});


// Categories Routes 
app.post("/admin/categories/new/publish", async (req, res) => {
    try {

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            const data = await new CMr(req.body);
            await data.save();

            res.redirect("/admin/categories");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }

});
// Edit Category
app.get("/admin/categories/update/:id/:cat_name", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            await CMr.findByIdAndUpdate(req.params.id, { category_name: req.params.cat_name });
            res.redirect("/admin/categories");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});
// Delete Category
app.get("/admin/categories/delete/:id", async (req, res) => {
    try {

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            await CMr.findByIdAndDelete(req.params.id);
            res.redirect("/admin/categories");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});

// Admin Product Pages
app.get("/admin/products", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            const data = await prod_Mr.find().sort({ _id: -1 });
            const categories = await CMr.find({}, { category_name: true, _id: 0 });

            res.render("admin/products/products", {
                data: data,
                categories: categories
            });
        }
    } catch {
        res.redirect("/admin-login");
    }
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

        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
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

            res.redirect("/admin/products/");
        }
    } catch (err) {
        res.redirect("/admin-login");

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
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
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

            res.redirect("/admin/products/");
        }

    } catch (err) {
        res.redirect("/admin-login");
    }
});


// Delete Product
app.get("/admin/products/delete/:id", async (req, res) => {
    try {
        const isVerified = jwt.verify(req.cookies.adminLoginToken, process.env.SECRET_KEY);

        if (isVerified) {
            await prod_Mr.findByIdAndDelete(req.params.id);
            res.redirect("/admin/products/");
        }
    } catch (err) {
        res.redirect("/admin-login");
    }
});













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