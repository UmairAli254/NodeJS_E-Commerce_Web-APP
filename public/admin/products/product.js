"use strict";

// Uplaod Multiple Images Previews
window.onload = function () {
    //Check File API support
    if (window.File && window.FileList && window.FileReader) {
        var filesInput = document.getElementById("product_all_images");
        filesInput.addEventListener("change", function (event) {
            var files = event.target.files; //FileList object
            var output = document.getElementById("result");
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                //Only pics
                if (!file.type.match('image'))
                    continue;
                var picReader = new FileReader();
                picReader.addEventListener("load", function (event) {
                    var picFile = event.target;
                    var div = document.createElement("div");
                    div.innerHTML = "<img class='thumbnail' src='" + picFile.result + "'" +
                        "title='" + picFile.name + "'/>";
                    output.insertBefore(div, null);
                });
                //Read the image
                picReader.readAsDataURL(file);
            }
        });
    } else {
        console.log("Your browser does not support File API");
    }
}


// For Update Product Form / Modal
const new_product_form = document.getElementById("update_product_form");
const update_title = document.getElementById("update_title");
const update_category = document.getElementById("update_category");
const update_description = document.getElementById("update_description");
const update_price = document.getElementById("update_price");
const update_s_price = document.getElementById("update_s_price");
const update_primary_img = document.getElementById("update_primary_img");
const update_all_imgs = document.getElementById("update_all_imgs");
const product_edit_btn = document.querySelectorAll(".product_edit_btn");

product_edit_btn.forEach((ele, ind) => {
    ele.addEventListener("click", (e) => {
        // Variables
        const product_id = e.target.id;
        const url = `http://localhost:3000/admin/products/data-for-update/${product_id}`;

        // Calling API
        fetch(url)
            .then(data => data.json())
            .then(value => {
                update_title.value = value.title;
                update_category.value = value.category;
                update_description.value = value.description;
                update_price.value = value.price;
                update_s_price.value = value.s_price;
                update_primary_img.value = value.primary_img
                update_all_images.value = value.all_imgs
            })
            .catch(err => console.log(err));
    })
})


// After clicking the edit button form.action url will be changed with the required ID of product
let editBtn = document.querySelectorAll(".product_edit_btn");
let update_product_form = document.getElementById("update_product_form");

editBtn.forEach((ele, ind) => {
    ele.addEventListener("click", (e) => {
        let id = e.target.id;

        update_product_form.action = `//localhost:3000/admin/product/update/${id}`;
    });

});




// For delete button 
let a = document.querySelectorAll(".delButton");
let delConfirmInModal = document.getElementById("delConfirm");
let del_modal_body = document.querySelector(".del-modal-body");

a.forEach((ele, ind) => {
    ele.addEventListener("click", (e) => {
        let id = e.target.id;
        let id_element_to_find_title = document.getElementById(id);
        delConfirmInModal.href = `//localhost:3000/admin/products/delete/${id}`;
        del_modal_body.innerText = id_element_to_find_title.parentNode.parentNode.parentNode.firstElementChild.nextElementSibling.innerText;
    });

});



// Update delivery status
function updateDeliveryStatusFun() {
    const deliveryToggle = document.getElementsByClassName("deliveryToggle");
    let alertBar = document.getElementById("alertBar");

    Array.from(deliveryToggle).forEach((ele, ind) => {
        ele.addEventListener("click", async (e) => {
            let product_title = ele.parentElement.parentElement.parentElement.firstElementChild.nextElementSibling.nextElementSibling.innerText;
            if (e.target.hasAttribute("checked")) {
                await fetch(`http://localhost:3000/admin/sold-delivery-update/${e.target.id}`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        delivered: false
                    })
                });
                e.target.removeAttribute("checked", "");
                alertBar.innerHTML = `<div class="alert alert-warning fade show w-50 m-auto alert-dismissible" role="alert">
                <strong>Not Delivered!</strong> This Product '${product_title}' is marked as not delivered 
                <button type="button" class="btn-close p-0 me-3 bg-transparent" data-bs-dismiss="alert" aria-label="Close" style="margin-top: 1.3rem"></button>
                </div>`;
                setTimeout(() => {
                    alertBar.innerHTML = "";
                }, 3000);
            } else {
                await fetch(`http://localhost:3000/admin/sold-delivery-update/${e.target.id}`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        delivered: true
                    })
                });
                e.target.setAttribute("checked", "");
                alertBar.innerHTML = `<div class="alert alert-success fade show w-50 m-auto alert-dismissible" role="alert">
                <strong>Delivered!</strong> This Product '${product_title}' is marked as delivered  
                <button type="button" class="btn-close p-0 me-3 bg-transparent" data-bs-dismiss="alert" aria-label="Close" style="margin-top: 1.3rem"></button>
                </div>`;
                setTimeout(() => {
                    alertBar.innerHTML = "";
                }, 3000);
            }
        })
    });

}
updateDeliveryStatusFun();
