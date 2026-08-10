document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = Array.from(document.querySelectorAll(".nav-link"));
  const sections = ["top", "services", "gallery", "faq", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const revealItems = document.querySelectorAll(".reveal");
  const faqItems = document.querySelectorAll(".faq-item");
  const form = document.getElementById("contact-form");
  const formStatus = document.querySelector(".form-status");
  const year = document.querySelector("[data-year]");
  const body = document.body;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Set minimum date to today for the Preferred Start Date input
  const dateInput = document.getElementById("preferred-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  const closeMenu = () => {
    navLinks?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  const toggleMenu = () => {
    const expanded = navToggle?.getAttribute("aria-expanded") === "true";
    navToggle?.setAttribute("aria-expanded", String(!expanded));
    navLinks?.classList.toggle("open");
    body.classList.toggle("menu-open", !expanded);
  };

  navToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMenu();
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  const handleScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  const setActiveNavItem = (id) => {
    navItems.forEach((item) => {
      const isActive = item.getAttribute("href") === `#${id}`;
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavItem(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    }
  );

  sections.forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    button?.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      faqItems.forEach((faq) => {
        faq.classList.remove("active");
        faq.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("active");
        button?.setAttribute("aria-expanded", "true");
      }
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (dateInput && dateInput.value) {
      const selectedDate = new Date(dateInput.value);
      // Create a date object for today with time set to 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        if (formStatus) {
          formStatus.textContent = "Please select a current or future start date.";
        }
        dateInput.focus();
        return; // Stops form submission
      }
    }

    const formData = new FormData(form);
    fetch("/", {
      method: "POST",
      body: formData
    })
      .then(() => {
        if (formStatus) {
          formStatus.textContent = "Thank you — we will be in touch shortly with your quote.";
        }
        form.reset();
      })
      .catch(() => {
        if (formStatus) {
          formStatus.textContent = "An error occurred. Please try again.";
        }
      });
  });

  const galleryImages = Array.from(document.querySelectorAll("#gallery img"));
  let activeGalleryIndex = -1;

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.innerHTML = `
    <div class="gallery-lightbox-panel">
      <div class="gallery-lightbox-overlay"></div>
      <button class="gallery-lightbox-close" aria-label="Close lightbox">×</button>
      <button class="gallery-lightbox-prev" aria-label="Previous image">‹</button>
      <div class="gallery-lightbox-content">
        <img src="" alt="" class="gallery-lightbox-image" />
        <p class="gallery-lightbox-caption"> </p>
      </div>
      <button class="gallery-lightbox-next" aria-label="Next image">›</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
  const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");
  const closeButton = lightbox.querySelector(".gallery-lightbox-close");
  const prevButton = lightbox.querySelector(".gallery-lightbox-prev");
  const nextButton = lightbox.querySelector(".gallery-lightbox-next");

  const updateLightbox = (index) => {
    if (index < 0 || index >= galleryImages.length) return;
    activeGalleryIndex = index;
    const image = galleryImages[index];
    if (lightboxImage) {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt || "Gallery image";
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = `${index + 1} / ${galleryImages.length} — ${image.alt}`;
    }
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  const hideLightbox = () => {
    lightbox.style.display = "none";
    document.body.style.overflow = "";
    activeGalleryIndex = -1;
  };

  const showPrevImage = () => {
    if (activeGalleryIndex < 0) return;
    updateLightbox((activeGalleryIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNextImage = () => {
    if (activeGalleryIndex < 0) return;
    updateLightbox((activeGalleryIndex + 1) % galleryImages.length);
  };

  galleryImages.forEach((image, index) => {
    image.addEventListener("click", () => updateLightbox(index));
  });

  closeButton?.addEventListener("click", hideLightbox);
  prevButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showPrevImage();
  });
  nextButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showNextImage();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.classList.contains('gallery-lightbox-overlay')) {
      hideLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.style.display !== "flex") return;
    if (event.key === "Escape") {
      hideLightbox();
    }
    if (event.key === "ArrowLeft") {
      showPrevImage();
    }
    if (event.key === "ArrowRight") {
      showNextImage();
    }
  });
});