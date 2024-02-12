// Duplicate images for infinite scrolling
const slider = document.querySelector(".slider ul");
const slides = document.querySelectorAll(".slider ul li");
slides.forEach((slide) => {
  const cloneSlide = slide.cloneNode(true);
  slider.appendChild(cloneSlide);
});

// -----------Front page slider--------------------------

  var swiper = new Swiper(".mySwiper", {
    spaceBetween: 30,
    loop: true,
    centeredSlides: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });


// -----------------------------------

gsap.from(".section3-bottom-imgDiv-left-1", {
  x: 1000,
  duration: 1,
  opacity: 0,
  scrollTrigger: {
    trigger: ".section3-bottom-imgDiv-left-1",
    scroller: "body",
    start: "top 80%",
    // markers: true,
  },
});
gsap.from(".section3-bottom-imgDiv-left-2", {
  x: 1000,
  duration: 1,
  delay: 0.2,
  scrollTrigger: {
    trigger: ".section3-bottom-imgDiv-left-2",
    scroller: "body",
    start: "top 80%",
    // markers: true,
  },
});
gsap.from(".section3-bottom-imgDiv-right", {
  x: 1000,
  duration: 1.2,
  delay: 1,
  scrollTrigger: {
    trigger: ".section3-bottom-imgDiv-right",
    scroller: "body",
    start: "top 80%",
    // markers: true,
  },
});


// --------------------------------- my account page --------------------------------

 function openCity(evt, tabDetail) {
      // Declare all variables
      var i, tabcontent, tablinks;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the button that opened the tab
      document.getElementById(tabDetail).style.display = "block";
      evt.currentTarget.className += " active";

    }