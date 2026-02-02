document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".focus-card");

  cards.forEach((card) => {
    const overlay = card.querySelector(".focus-overlay");
    if (!overlay) return;

    // Mobile: tap/click toggles .open class
    overlay.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent bubbling
      card.classList.toggle("open");
    });
  });

  // Click outside closes all open overlays
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".focus-card.open").forEach((card) => {
      if (!card.contains(e.target)) {
        card.classList.remove("open");
      }
    });
  });
});
