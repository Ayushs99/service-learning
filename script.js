const EVENTS = [
    {
      id: "1",
      title: "Zero-Waste Community Market",
      date: "2026-04-12",
      time: "10:00 AM – 4:00 PM",
      location: "City Green Plaza",
      type: "Market",
      sustainabilityLevel: "Zero Waste",
      badge: "Zero Waste",
      description:
        "Discover local zero-waste vendors, refill stations, and sustainable lifestyle brands in one vibrant community market.",
      highlights: [
        "Plastic-free vendor policy",
        "Compost and recycling stations at every exit",
        "Bring-your-own containers and bags encouraged"
      ]
    },
    {
      id: "2",
      title: "Carbon-Neutral Music Night",
      date: "2026-05-02",
      time: "6:00 PM – 10:00 PM",
      location: "Riverside Eco Park",
      type: "Concert",
      sustainabilityLevel: "Carbon Neutral",
      badge: "Carbon Neutral",
      description:
        "An intimate outdoor concert powered by renewable energy with verified carbon offsets for all attendee travel.",
      highlights: [
        "100% solar-powered stage and lighting",
        "Bike parking with small rewards",
        "Local plant-based food trucks only"
      ]
    },
    {
      id: "3",
      title: "Urban Forest Planting Drive",
      date: "2026-04-28",
      time: "8:00 AM – 1:00 PM",
      location: "Northside Urban Forest",
      type: "Volunteer Drive",
      sustainabilityLevel: "Regeneration",
      badge: "Tree Planting",
      description:
        "Join local volunteers and ecologists to plant native trees and expand the city’s green canopy.",
      highlights: [
        "Native and climate-resilient species only",
        "On-site workshop on urban biodiversity",
        "Snacks served in compostable packaging"
      ]
    },
    {
      id: "4",
      title: "Circular Design Innovation Summit",
      date: "2026-06-15",
      time: "9:00 AM – 5:00 PM",
      location: "Innovation Hub Auditorium",
      type: "Conference",
      sustainabilityLevel: "Low Impact",
      badge: "Low Impact",
      description:
        "A full-day summit featuring talks, panels, and labs on circular design and sustainable product lifecycles.",
      highlights: [
        "Low-waste staging and digital-only handouts",
        "Local, seasonal catering with minimal food waste",
        "Opportunities to co-create climate-positive projects"
      ]
    }
  ];
  
const THEME_KEY = "ecoTheme";
const USER_KEY = "ecoUser";
const BOOKINGS_KEY = "ecoBookings";
  
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));
  
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  function loadJSON(key, fallback = null) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    const theme = saved || (systemPrefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  
    const toggleBtn = qs("#themeToggle");
    if (toggleBtn) {
      toggleBtn.textContent = theme === "light" ? "🌙" : "☀️";
      toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme || "light";
        const next = current === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        localStorage.setItem(THEME_KEY, next);
        toggleBtn.textContent = next === "light" ? "🌙" : "☀️";
      });
    }
  }
  
  let currentUser = null;
  
  function loadUserFromStorage() {
    const saved = loadJSON(USER_KEY);
    if (saved && saved.email) {
      currentUser = saved;
    } else {
      currentUser = null;
    }
  }
  
  function renderAuthArea() {
    const authArea = qs("#authArea");
    if (!authArea) return;
  
    if (currentUser) {
      authArea.innerHTML = `
        <span class="nav-user">Hi, ${currentUser.name || currentUser.email}</span>
        <button class="btn-secondary" id="logoutBtn">Logout</button>
      `;
      const logoutBtn = qs("#logoutBtn");
      logoutBtn.addEventListener("click", () => {
        currentUser = null;
        localStorage.removeItem(USER_KEY);
        renderAuthArea();
      });
    } else {
      authArea.innerHTML = `
        <button class="btn-text" id="goLoginBtn">Login</button>
        <button class="btn-primary" id="goRegisterBtn">Register</button>
      `;
      qs("#goLoginBtn").addEventListener("click", () => {
        window.location.href = "login.html";
      });
      qs("#goRegisterBtn").addEventListener("click", () => {
        window.location.href = "register.html";
      });
    }
  }
  
  function setActivePage(pageId) {
    qsa(".page").forEach((p) => p.classList.remove("active"));
    const page = qs(pageId);
    if (page) page.classList.add("active");
  }
  
  function navigateTo(hash) {
    if (!hash.startsWith("#")) hash = "#" + hash;
    window.location.hash = hash;
  }
  
  function handleRoute() {
    const hash = window.location.hash || "#home";
    const [route, param] = hash.split("/");
  
    if (route === "#home") {
      setActivePage("#homePage");
    } else if (route === "#events") {
      setActivePage("#eventsPage");
    } else if (route === "#event" && param) {
      const event = EVENTS.find((e) => e.id === param);
      if (event) {
        setActivePage("#eventDetailsPage");
        renderEventDetails(event);
      } else {
        navigateTo("#events");
      }
    } else {
      setActivePage("#homePage");
    }
  }
  
  function renderEventsList() {
    const list = qs("#eventsList");
    if (!list) return;
  
    const dateFilter = qs("#filterDate").value;
    const typeFilter = qs("#filterType").value;
    const levelFilter = qs("#filterLevel").value;
  
    let filtered = [...EVENTS];
  
    if (dateFilter) {
      filtered = filtered.filter((e) => e.date >= dateFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }
    if (levelFilter) {
      filtered = filtered.filter((e) => e.sustainabilityLevel === levelFilter);
    }
  
    list.innerHTML = "";
  
    if (!filtered.length) {
      list.innerHTML =
        '<p style="color: var(--color-text-muted); font-size: 0.9rem;">No events match these filters yet. Try adjusting your filters.</p>';
      return;
    }
  
    filtered.forEach((event) => {
      const card = document.createElement("article");
      card.className = "event-card";
      card.innerHTML = `
        <div class="event-card-header">
          <h3 class="event-card-title">${event.title}</h3>
          <span class="badge-eco">${event.badge}</span>
        </div>
        <div class="event-meta">
          <span data-icon="date">${formatDate(event.date)}</span>
          <span data-icon="time">${event.time}</span>
          <span data-icon="location">${event.location}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--color-text-muted);margin:0.4rem 0 0.5rem;">
          ${event.description.substring(0, 110)}...
        </p>
        <div class="event-footer">
          <span class="event-level">${event.sustainabilityLevel}</span>
          <button class="btn-secondary" data-event-id="${event.id}">
            View & Book
          </button>
        </div>
      `;
      list.appendChild(card);
    });
  
    list.querySelectorAll("button[data-event-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-event-id");
        navigateTo("#event/" + id);
      });
    });
  }
  
  function renderEventDetails(event) {
    const container = qs("#eventDetailsContainer");
    if (!container) return;
  
    container.innerHTML = `
      <article class="event-details-main">
        <div style="display:flex;justify-content:space-between;gap:0.75rem;align-items:center;">
          <div>
            <h2>${event.title}</h2>
            <div class="event-meta">
              <span data-icon="date">${formatDate(event.date)}</span>
              <span data-icon="time">${event.time}</span>
              <span data-icon="location">${event.location}</span>
            </div>
          </div>
          <span class="badge-eco">${event.badge}</span>
        </div>
        <p>${event.description}</p>
  
        <section class="event-highlights">
          <h3>Sustainability Highlights</h3>
          <ul>
            ${event.highlights.map((h) => `<li>${h}</li>`).join("")}
          </ul>
        </section>
      </article>
  
      <aside class="booking-card">
        <h3>Book your spot</h3>
        <p>Secure your tickets and we’ll email you all eco‑friendly arrival tips.</p>
        <form id="bookingForm" class="form">
          <div class="form-group">
            <label for="bookName">Name</label>
            <input id="bookName" type="text" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label for="bookEmail">Email</label>
            <input id="bookEmail" type="email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label for="bookTickets">Number of tickets</label>
            <input id="bookTickets" type="number" min="1" max="10" value="1" required />
          </div>
          <button type="submit" class="btn-primary" style="width:100%;margin-top:0.2rem;">
            Confirm booking
          </button>
        </form>
        <div id="bookingConfirmation" class="booking-confirmation" style="display:none;"></div>
      </aside>
    `;
  
    const form = qs("#bookingForm");
    const confirmation = qs("#bookingConfirmation");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const name = qs("#bookName").value.trim();
      const email = qs("#bookEmail").value.trim();
      const tickets = Number(qs("#bookTickets").value || 1);
  
      if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        confirmation.textContent =
          "Please enter a valid name and email before booking.";
        confirmation.style.display = "block";
        return;
      }
  
      const booking = {
        eventId: event.id,
        name,
        email,
        tickets,
        bookedAt: new Date().toISOString()
      };
  
      const existing = loadJSON(BOOKINGS_KEY, []);
      existing.push(booking);
      saveJSON(BOOKINGS_KEY, existing);
  
      confirmation.textContent = `You’re all set, ${name}! We’ve reserved ${tickets} ticket(s) for “${event.title}”. Check your inbox for details.`;
      confirmation.style.display = "block";
      form.reset();
    });
  }
  
  function initFilters() {
    const dateInput = qs("#filterDate");
    const typeSelect = qs("#filterType");
    const levelSelect = qs("#filterLevel");
    const clearBtn = qs("#clearFilters");
  
    [dateInput, typeSelect, levelSelect].forEach((el) => {
      el.addEventListener("change", () => renderEventsList());
    });
  
    clearBtn.addEventListener("click", () => {
      dateInput.value = "";
      typeSelect.value = "";
      levelSelect.value = "";
      renderEventsList();
    });
  }
  
  function initBackButton() {
    const backBtn = qs("#backToEvents");
    if (backBtn) {
      backBtn.addEventListener("click", () => navigateTo("#events"));
    }
  }
  
  function initFooterYear() {
    const span = qs("#yearSpan");
    if (span) span.textContent = new Date().getFullYear();
  }
  
  function init() {
    initTheme();
    loadUserFromStorage();
    renderAuthArea();
  
    initFilters();
    renderEventsList();
    initBackButton();
    initFooterYear();
  
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }
  
  document.addEventListener("DOMContentLoaded", init);

