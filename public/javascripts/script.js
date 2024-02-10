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
