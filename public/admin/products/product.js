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


// APIs
// const new_product_form = document.getElementById("new_product_form");
// const product_title = document.getElementById("product_title");
// const product_category = document.getElementById("product_category");
// const product_description = document.getElementById("product_description");
// const product_price = document.getElementById("product_price");
// const product_selling_price = document.getElementById("product_selling_price");
// const product_main_image = document.getElementById("product_main_image");
// const product_all_images = document.getElementById("product_all_images");
// const product_publish_btn = document.getElementsByClassName("product_publish_btn");


// new_product_form.addEventListener("submit", (e) => {
//     e.preventDefault();
//     console.log(product_title.value);
//     console.log(product_category.value);
//     console.log(product_description.value);
//     console.log(product_price.value);
//     console.log(product_selling_price.value);
//     console.log(product_main_image.value);
//     const all_img = product_all_images.value;
//     let arr;

  
// })


