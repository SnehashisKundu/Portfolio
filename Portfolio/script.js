const typed = new Typed(".typewriter-text", {
  strings: [
    "Web Developer",
    "Backend Developer",
    "Competitive Coder",
    "Content Writer",
    "Data Analyst"
  ],
  typeSpeed: 100,
  backSpeed: 60,
  loop: true
});

const scrollBtn = document.querySelector(".scrollToTop-btn");
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("active", window.scrollY > 500);
  header.classList.toggle("sticky", window.scrollY > 0);

  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav a");
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
});


scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


const menuBtn = document.querySelector(".menu-btn");
const navigation = document.querySelector("nav");
const navigationItems = document.querySelectorAll("nav a");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navigation.classList.toggle("active");
  });
}

navigationItems.forEach((link) => {
  link.addEventListener("click", () => {
    menuBtn.classList.remove("active");
    navigation.classList.remove("active");
  });
});

    // Close mobile menu on link click
    document.querySelectorAll("nav.md\\:hidden a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-active");
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
    function handleFormSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      if (data.name && data.email && data.message) {
        alert("Form submitted successfully! (Note: This is a demo. No actual submission is processed.)");
        form.reset();
      } else {
        alert("Please fill out all fields.");
      }
    }