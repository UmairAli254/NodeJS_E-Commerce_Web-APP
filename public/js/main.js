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
					console.log(pro_data);

					// Get LoggedIn user's email. API
					let user_res = await fetch("http://localhost:3000/get-loggedin-user-email");
					let user_data = await user_res.json();
					console.log(user_data);

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
					alertBar.innerHTML = `<div class="alert alert-success fade show w-50 m-auto" role="alert">
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
		let shippingCostVal = parseInt(shippingCost.innerText);
		let overAllTotal = document.getElementById("overAllTotal");
		let totalAmount = 0;

		Array.from(singleProTotal).forEach(ele => {
			totalAmount += parseInt(ele.innerText);
		});

		cartSubTotal.innerText = totalAmount;
		overAllTotal.innerText = totalAmount + shippingCostVal;

		if (totalAmount === 0) {
			overAllTotal.innerText = 0;
			shippingCost.innerText = 0;
		} else
			shippingCost.innerText = 10;
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
					console.log(pro_res);
					let pro_data = await pro_res.json();
					console.log(pro_data);



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
					console.log(d_ret);

					// Update Favourite Value without sending the request again to the server
						let fav_badge = document.querySelector(".fav_badge");
						fav_badge.innerText = parseInt(fav_badge.innerText) + 1;
						let alertBar = document.getElementById("alertBar");
						alertBar.innerHTML = `<div class="alert alert-warning fade show w-50 m-auto" role="alert">
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

