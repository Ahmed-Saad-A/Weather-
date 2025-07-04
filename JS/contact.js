const path = window.location.pathname;

if (path.includes("index.html") || path === "/") {
  document.getElementById("nav-home")?.classList.add("active");
} else if (path.includes("contact.html")) {
  document.getElementById("nav-contact")?.classList.add("active");
}
