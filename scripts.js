// Image Carousel
let imageIndex = 0;
const images = document.querySelectorAll('.carousel-images img');
const quotes = document.querySelectorAll('.quote-slide'); // Selects the quotes

function showCarouselSlide() {
    images.forEach((img, i) => {
        img.classList.remove('active');
        if (i === imageIndex) img.classList.add('active');
    });
    quotes.forEach((quote, i) => {
        quote.classList.remove('active');
        if (i === imageIndex) quote.classList.add('active'); // Sync quote with image
    });
    imageIndex = (imageIndex + 1) % images.length;
}

setInterval(showCarouselSlide, 30000); // Switch image and quote every 3 minutes

function showImageCarousel() {
    images.forEach((img, i) => {
        img.classList.remove('active');
        if (i === imageIndex) img.classList.add('active');
    });
    imageIndex = (imageIndex + 1) % images.length;
}

setInterval(showImageCarousel, 30000); // Switch image every 3 minutes

// Testimonials Carousel
let testimonialIndex = 0;
const testimonials = document.querySelectorAll('.testimonial-slide');

function showTestimonialsCarousel() {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.remove('active');
        if (i === testimonialIndex) testimonial.classList.add('active');
    });
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
}

setInterval(showTestimonialsCarousel, 50000); // Switch testimonial every 5 minutes
