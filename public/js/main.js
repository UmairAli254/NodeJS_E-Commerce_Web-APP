(function ($) {
	"use strict";

	// Dropdown on mouse hover
	// $(document).ready(function () {
	// 	function toggleNavbarMethod() {
	// 		if ($(window).width() > 992) {
	// 			$('.navbar .dropdown').on('mouseover', function () {
	// 				$('.dropdown-toggle', this).trigger('click');
	// 			}).on('mouseout', function () {
	// 				$('.dropdown-toggle', this).trigger('click').blur();
	// 			});
	// 		} else {
	// 			$('.navbar .dropdown').off('mouseover').off('mouseout');
	// 		}
	// 	}
	// 	toggleNavbarMethod();
	// 	$(window).resize(toggleNavbarMethod);
	// });


	// Back to top button
	$(window).scroll(function () {
		if ($(this).scrollTop() > 100) {
			$('.back-to-top').fadeIn('slow');
		} else {
			$('.back-to-top').fadeOut('slow');
		}
	});
	$('.back-to-top').click(function () {
		$('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
		return false;
	});


	// Vendor carousel
	$('.vendor-carousel').owlCarousel({
		loop: true,
		margin: 29,
		nav: false,
		autoplay: true,
		smartSpeed: 1000,
		responsive: {
			0: {
				items: 2
			},
			576: {
				items: 3
			},
			768: {
				items: 4
			},
			992: {
				items: 5
			},
			1200: {
				items: 6
			}
		}
	});


	// Related carousel
	$('.related-carousel').owlCarousel({
		loop: true,
		margin: 29,
		nav: false,
		autoplay: true,
		smartSpeed: 1000,
		responsive: {
			0: {
				items: 1
			},
			576: {
				items: 2
			},
			768: {
				items: 3
			},
			992: {
				items: 4
			}
		}
	});


	// Product Quantity
	$('.quantity button').on('click', function () {
		var button = $(this);
		var oldValue = button.parent().parent().find('input').val();
		if (button.hasClass('btn-plus')) {
			var newVal = parseFloat(oldValue) + 1;
		} else {
			if (oldValue > 0) {
				var newVal = parseFloat(oldValue) - 1;
			} else {
				newVal = 0;
			}
		}
		button.parent().parent().find('input').val(newVal);
	});

})(jQuery);


// Character limit for post on blog page
const para = document.getElementsByClassName("paraLimit");

for (let one of Array.from(para)) {

	if (one.innerText.split(" ").length < 13)
		continue;

	let words = one.innerText;
	one.innerText = "";
	words = words.split(" ");
	for (let i = 0; i < 13; i++)
		one.innerHTML += `${words[i]} `;
};

// End Character limit for post on blog page


// Call API and Show post data in PopUP
const contReadBtn = document.getElementsByClassName("continueReading");
Array.from(contReadBtn).forEach(ele => {
	ele.addEventListener("click", (e) => {
		const id = e.target.id;
		let url = `http://localhost:3000/blog/${id}`;
		fetch(url)
			.then(res => res.json())
			.then(data => {
				let title = document.getElementById("exampleModalLongTitle");
				let body = document.querySelector(".modal-body");
				let upload_date = document.getElementById("uploaded-date");
				title.innerText = data.title;
				body.innerText = data.description;
				upload_date.innerText = new Date(data.date).toLocaleDateString();
			})
			.catch(err => console.log(err))
	})
});


// Check token and show user pages accordingly in menu
function cookieChecker() {
	const isExist = (document.cookie).includes("eShopperLoginToken");
	if (isExist) {
		document.getElementById("userProfileLinks").innerHTML = `<a href="/profile" class="nav-item nav-link">Profile</a>
    <a href="/logout" class="nav-item nav-link">Logout</a>`;
	} else {
		document.getElementById("userProfileLinks").innerHTML = `<a href="/register" class="nav-item nav-link">Register</a>
    <a href="/login" class="nav-item nav-link">Login</a>`;
	}
}
cookieChecker();



// Get cart products to show in cart widget
async function get_cart_products() {
	// Get stored products from the cart collection
	let cart_badge = document.querySelector(".cart_badge");
	let cart_prod_url = "http://localhost:3000/get-cart-products";

	const cart_prod_api_return = await fetch(cart_prod_url);
	const cart_prod_data = await cart_prod_api_return.json();
	// console.log(cart_prod_data);
	if (cart_prod_data.length)
		cart_badge.innerText = cart_prod_data.length;
}
get_cart_products();


// Add to Cart complete procedure 
function add_to_cart_fun() {
	const add_to_cart = document.getElementsByClassName("add_to_cart");

	Array.from(add_to_cart).forEach(ele => {
		ele.addEventListener("click", async (e) => {
			try {
				const isExist = (document.cookie).includes("eShopperLoginToken");

				if (isExist) {
					let pro_id = e.target.id;
					let url = `http://localhost:3000/get-product-for-cart/${pro_id}`;

					// Get product. API
					let pro_res = await fetch(url);
					let pro_data = await pro_res.json();
					// console.log(pro_data);

					// Get LoggedIn user's email. API
					let user_res = await fetch("http://localhost:3000/get-loggedin-user-email");
					let user_data = await user_res.json();
					// console.log(user_data);

					// Store Product to the Cart Collection in DB
					const pro_data_post_req = {
						method: "POST",
						headers: {
							"content-type": "application/json"
						},
						body: JSON.stringify({
							pro_id: pro_data._id,
							pro_title: pro_data.title,
							price: pro_data.price,
							s_price: pro_data.s_price,
							pro_img: pro_data.primary_img,
							user_email: user_data
						})
					};
					let store_cart_pro_to_db_url = "http://localhost:3000/store-cart-porduct-to-db";
					let stor_to_cart_return = await fetch(store_cart_pro_to_db_url, pro_data_post_req);
					let d_ret = await stor_to_cart_return.json();
					// console.log(d_ret);

					// Update Cart Value without sending the request again to the server
					let cart_badge = document.querySelector(".cart_badge");
					cart_badge.innerText = parseInt(cart_badge.innerText) + 1;
					let alertBar = document.getElementById("alertBar");
					alertBar.innerHTML = `<div class="alert alert-success fade show w-100" role="alert">
					<strong>Added!</strong> Product is added to cart! &nbsp; <a href="http://localhost:3000/cart"> Go To Cart </a>
				</div>`;
					setTimeout(() => {
						alertBar.innerHTML = "";
					}, 5000);


				}
				else {
					alert("Login first, to add into cart ")
				}

			} catch (err) {
				console.log(err);
			}
		})
	})
}
add_to_cart_fun();


// Subtotal and Total product price
function cartTotalFun() {
	if (document.URL === "http://localhost:3000/cart") {
		const singleProTotal = document.getElementsByClassName("singleProTotal");
		const cartSubTotal = document.getElementById("cartSubTotal");
		let shippingCost = document.getElementById("shippingCost");
		let overAllTotal = document.getElementById("overAllTotal");
		let totalAmount = 0;

		Array.from(singleProTotal).forEach(ele => {
			totalAmount += parseInt(ele.innerText);
		});

		if (totalAmount === 0) {
			overAllTotal.innerText = 0;
			shippingCost.innerText = 0;
		} else
			shippingCost.innerText = 10;

		cartSubTotal.innerText = totalAmount;
		overAllTotal.innerText = totalAmount + parseInt(shippingCost.innerText);

	}
}
cartTotalFun();



// Increase Descrease Product Quantity and Price upon clicking of the +,- buttons
const pro_minus = document.getElementsByClassName("pro-minus");
const pro_plus = document.getElementsByClassName("pro-plus");

// For Increment
Array.from(pro_plus).forEach((ele, ind) => {
	ele.addEventListener("click", (e) => {

		let realPrice = ele.parentElement.parentElement.parentElement.previousElementSibling.children[1].innerText;
		realPrice = parseInt(realPrice);

		let totalWala = ele.parentElement.parentElement.parentElement.nextElementSibling.children[1];

		let changeAble = totalWala.innerText;
		changeAble = parseInt(changeAble);

		totalWala.innerText = changeAble + realPrice;

		cartTotalFun();
	})
});

// For Decrement
Array.from(pro_minus).forEach(ele => {
	ele.addEventListener("click", (e) => {

		let realPrice = ele.parentElement.parentElement.parentElement.previousElementSibling.children[1].innerText;
		realPrice = parseInt(realPrice);

		let totalWala = ele.parentElement.parentElement.parentElement.nextElementSibling.children[1];

		let changeAble = totalWala.innerText;
		changeAble = parseInt(changeAble);

		if (changeAble !== 0)
			totalWala.innerText = changeAble - realPrice;

		cartTotalFun();
	})
});



// Add to favourite

// Get Favourite products to show in Favourite widget
async function get_fav_products() {
	// Get stored products from the cart collection
	let fav_badge = document.querySelector(".fav_badge");
	let fav_prod_url = "http://localhost:3000/get-fav-products";

	const fav_prod_api_return = await fetch(fav_prod_url);
	const fav_prod_data = await fav_prod_api_return.json();
	// console.log(fav_prod_data);
	if (fav_prod_data.length)
		fav_badge.innerText = fav_prod_data.length;
}
get_fav_products();


// Add to favourite complete procedure 
function add_to_fav_fun() {

	const add_to_favourite = document.getElementsByClassName("add_to_favourite");

	Array.from(add_to_favourite).forEach(ele => {
		ele.addEventListener("click", async (e) => {
			try {
				const isExist = (document.cookie).includes("eShopperLoginToken");

				if (isExist) {
					let pro_id = e.target.id;
					let url = `http://localhost:3000/get-product-for-cart/${pro_id}`;

					// // Get product. API
					let pro_res = await fetch(url);
					// console.log(pro_res);
					let pro_data = await pro_res.json();
					// console.log(pro_data);



					// // Get LoggedIn user's email. API
					let user_res = await fetch("http://localhost:3000/get-loggedin-user-email");
					let user_data = await user_res.json();
					// console.log(user_data);

					// Store Product to the Favourite Collection in DB
					const pro_data_post_req = {
						method: "POST",
						headers: {
							"content-type": "application/json"
						},
						body: JSON.stringify({
							pro_id: pro_data._id,
							pro_title: pro_data.title,
							s_price: pro_data.s_price,
							pro_img: pro_data.primary_img,
							user_email: user_data
						})
					};
					let store_fav_pro_to_db_url = "http://localhost:3000/store-fav-porduct-to-db";
					let store_to_fav_return = await fetch(store_fav_pro_to_db_url, pro_data_post_req);
					let d_ret = await store_to_fav_return.json();
					// console.log(d_ret);

					// Update Favourite Value without sending the request again to the server
					let fav_badge = document.querySelector(".fav_badge");
					fav_badge.innerText = parseInt(fav_badge.innerText) + 1;
					let alertBar = document.getElementById("alertBar");
					alertBar.innerHTML = `<div class="alert alert-warning fade show w-100" role="alert">
						<strong>Favourite!</strong> Product is added to your favourite list! &nbsp; <a href="http://localhost:3000/favourites"> Go To Favourite List </a>
					</div>`;
					setTimeout(() => {
						alertBar.innerHTML = "";
					}, 5000);


				}
				else {
					alert("Login first, to add it into you favourite list. ")
				}

			} catch (err) {
				console.log(err);
			}
		})
	})
}
add_to_fav_fun();



// Live Search Engine
function live_search_engine_fun() {
	const all_pro_api = "http://localhost:3000/get-all-products";
	const searchBar = document.getElementById("searchBar");
	const searchForm = document.getElementById("searchForm");
	const searchUL = document.getElementById("searchUL");
	// const searchDiv = document.getElementById("searchDiv");


	// For the separate search page
	searchForm.addEventListener("submit", (e) => {
		let pro_name = searchBar.value.trim();
		searchForm.action = `http://localhost:3000/search/${pro_name}`;
	});
	searchBar.addEventListener("blur", (e) => {
		setTimeout(() => {
			searchUL.innerHTML = "";
		}, 200);
	});


	// Get All Products. Show product below the search bar
	const xhr = new XMLHttpRequest();
	xhr.open("GET", all_pro_api, true);
	xhr.responseType = "json";
	xhr.onprogress = () => console.log("Progressing...");
	xhr.onload = () => {
		const products = xhr.response;


		const showResults = () => {
			searchUL.innerHTML = "";
			let i = 0;
			for (const one of products.sort()) {
				if (i < 10) {
					if (searchBar.value !== "") {
						if (one.title.toLowerCase().includes(searchBar.value.toLowerCase().trim())) {
							console.log("Fouund");
							searchUL.innerHTML += `<li class="list-group-item d-flex justify-content-between border-0"> <a href="http://localhost:3000/product/${one.title}/${one._id}" style="text-decoration:none;" class="stretched-link"> <img src="/img/product_imgs/${one.primary_img}"
					class="rounded mr-2" width="50px"> ${one.title} </a>
					<div><span>$</span><span>${one.s_price}</span></div>
				</li>`;
							i++;
						}
					}
				}
			} // Loop ends here
		}; //Event Listener ends here

		searchBar.addEventListener("input", showResults);
		searchBar.addEventListener("focus", showResults);
	}
	xhr.send();

}
live_search_engine_fun();



// Pagination
async function pagination_fun() {
	if (document.URL === "http://localhost:3000/shop") {
		let all_products_api = "http://localhost:3000/get-all-products";
		let pages_pagi_show_here = document.getElementById("pages_pagi_show_here");
		let alertBar = document.getElementById("alertBar");
		let pre_pagination = document.getElementById("pre_pagination");
		let next_pagination = document.getElementById("next_pagination");
		let show_products_here = document.getElementById("show_products_here");


		// Show pagination list/pages number dynamically

		const pro_res = await fetch(all_products_api);
		const all_products = await pro_res.json();
		let num_of_pages = Math.ceil(all_products.length / 12);

		for (let i = 1; i <= num_of_pages; i++) {
			pages_pagi_show_here.innerHTML += `
			<li class="page-item page-link pagi-buttons">${i}</li>
			`;
		}
		// End Here - Show pagination list/pages number dynamically



		let page = 1;
		const pagi_btns = document.getElementsByClassName("pagi-buttons");

		async function show_products_fun(page) {
			let url = `http://localhost:3000/shop/next-page/${page}`;
			const res = await fetch(url);
			const data = await res.json();

			show_products_here.innerHTML = "";

			for (let one of data) {
				show_products_here.innerHTML += `<div class="col-lg-3 col-md-6 col-sm-12 pb-1">
		<div class="card product-item border-0 mb-4">
			<div
				class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
				<img class="img-fluid w-100" src="/img/product_imgs/${one.primary_img}"
					alt="${one.title}">
			</div>
			<div class="card-body border-left border-right text-center p-0 pt-4 pb-3">
				<h6 class="text-truncate mb-3">
				${one.title}
				</h6>
				<div class="d-flex justify-content-center">
					<h6>$${one.s_price}
					</h6>
					<h6 class="text-muted ml-2"><del>$${one.price}</del></h6>
				</div>
			</div>
			<div class="card-footer d-flex justify-content-between bg-light border">
				<a href="http://localhost:3000/product/${one.title}/${one._id}"
					class="btn btn-sm text-dark p-0"><i class="fas fa-eye text-primary mr-1"></i>View
					Detail</a>

				<a class="btn btn-md text-dark p-0 add_to_favourite" id="${one._id}">
					<i class="fas fa-heart text-primary mr-1"></i>Fav
				</a>

				<a class="btn btn-sm text-dark p-0 add_to_cart" id="${one._id}"><i
						class="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart</a>
			</div>
		</div>
	</div>
`;
			}
			add_to_fav_fun();
			add_to_cart_fun();

			// Remove last and first pagination button accordingly
			if (page < num_of_pages) {
				next_pagination.style.visibility = "visible";
			} else {
				next_pagination.style.visibility = "hidden";
			}

			if (page === 1) {
				pre_pagination.style.visibility = "hidden";
			} else {
				pre_pagination.style.visibility = "visible";
			}

			// Change the color of pagination buttons accordingly
			Array.from(pagi_btns).forEach(ele => {
				if (parseInt(ele.innerText) === page) {
					ele.classList.add("active");
				} else {
					ele.classList.remove("active");
				}
			});

		}

		show_products_fun(page);


		next_pagination.addEventListener("click", function () {
			page++;
			show_products_fun(page);
		});

		pre_pagination.addEventListener("click", function () {
			page--;
			show_products_fun(page);
		});


		Array.from(pagi_btns).forEach(ele => {
			ele.addEventListener("click", (e) => {

				page = parseInt(e.target.innerText);
				console.log(page);
						show_products_fun(page);
			
			})
		});









	}
}
pagination_fun();



// Buy products complete procedure
async function pay_now() {
	if (document.URL === "http://localhost:3000/cart") {
		const priceInPopUP = document.getElementsByClassName("priceInPopUP");
		const quantityInPopUp = document.getElementsByClassName("quantityInPopUp");
		const proceedToCheckoutBtn = document.getElementById("proceedToCheckoutBtn");
		const shippingCost = document.getElementById("shippingCost").innerText;
		const payNow = document.getElementById("payNow");
		const all_cartPro_api = "http://localhost:3000/get-cart-products";
		const sold_pro_api = "http://localhost:3000/store-sold-to-db";
		let custom_message = document.getElementById("custom_message");
		let popupTable = document.getElementById("popupTable");


		payNow.addEventListener("click", async () => {

			let all_pro_latest_price_in_popup = [];
			let all_pro_latest_quantity_in_popup = [];

			Array.from(priceInPopUP).forEach((ele, ind) => {
				all_pro_latest_price_in_popup.push(ele.innerText);
			});
			console.log(all_pro_latest_price_in_popup);

			Array.from(quantityInPopUp).forEach((ele) => {
				all_pro_latest_quantity_in_popup.push(ele.innerText);
			});
			console.log(all_pro_latest_quantity_in_popup);



			// API
			const all_cart_pro = await fetch(all_cartPro_api);
			const all_cart_pro_data = await all_cart_pro.json();

			// console.log(all_cart_pro_data);

			all_cart_pro_data.forEach((ele, ind) => {

				ele.quantity = parseInt(all_pro_latest_quantity_in_popup[ind]);
				ele.shipping_cost = parseInt(shippingCost);
				ele.total_amount = parseInt(all_pro_latest_price_in_popup[ind]);
				delete ele.__v;
				delete ele.date;
				delete ele._id;

			});

			console.table(all_cart_pro_data);


			// Save the data/purchased-items to the database
			const sold_post_data = {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(all_cart_pro_data)
			}
			const sold_pro_api_ret = await fetch("http://localhost:3000/store-sold-to-db", sold_post_data);
			const sold_pro_data = await sold_pro_api_ret.json();
			// console.log(sold_pro_data);


			// Empty Cart After purchasing
			const deleteProducts = await fetch("http://localhost:3000/remove-products-from-cart");
			const deletePorductsData = await deleteProducts.json();
			if (deletePorductsData) {

				popupTable.innerHTML = `<p class="text-success text-center m-auto">
				<strong>Done!</strong> Your order is placed. &nbsp; <br/> <a href="http://localhost:3000/profile"> Go to your dashboard for details </a>
				</p>`;
				custom_message.innerHTML = `<span class="m-auto text-center m-auto" id="custom_message">Shipping Address: <span
				class="text-primary font-weight-bold">Default.</span></span>`;

				setTimeout(() => {
					window.location = "http://localhost:3000/profile";
				}, 3000);


			} else {
				console.log(deletePorductsData);
			}












		}); //Pay Now Button EventListener ends here



	}
}
pay_now();