document.addEventListener("DOMContentLoaded", () => {
    // Set active navigation link based on current path
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll(".nav-link").forEach(link => {
            const linkPath = new URL(link.href).pathname;
            link.classList.toggle("active", linkPath === currentPath);
        });
    }
    setActiveNavLink();

    // Toggle menu
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // Toast message display
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 3000);
    }

    // Event delegation for book-now buttons
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("book-now")) {
            const roomId = event.target.dataset.roomId;
            if (roomId) {
                window.location.href = `/book-room?id=${roomId}`;
            }
        }
    });

    // Form validation
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const checkIn = document.getElementById("check-in").value;
            const checkOut = document.getElementById("check-out").value;
            
            if (!name || !email || !checkIn || !checkOut) {
                showToast("All fields are required!", "error");
                return;
            }
            
            showToast("Booking successful!");
            bookingForm.submit();
        });
    }

    // Modal close on escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.classList.add("hidden");
            });
        }
    });

    // Room availability date constraints
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener("change", () => {
            checkOutInput.min = checkInInput.value;
        });
    }
});
