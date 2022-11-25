(function ($) {
    "use strict";

    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });


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
})
