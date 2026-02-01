/**
 * EVENTS PAGE - Main Script
 * Handles event display, filtering, pagination, registration, and view tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('events-container');
  const paginationContainer = document.getElementById('pagination-controls');

  // Pagination settings
  const EVENTS_PER_PAGE = 6;
  let currentPage = 1;
  let allEventsData = [];

  /* ================================
      INTEGRATED EVENT DATA (from events.json)
  ================================ */
  const eventDatabase = [
    {
        "title": "Pixel Phantoms Kickoff Meetup",
        "description": "A community meetup introducing upcoming projects and collaborations.",
        "date": "2026-01-10",
        "location": "Discord",
        "registrationOpen": true,
        "registrationLink": "https://example.com/kickoff"
    },
    {
        "title": "AI Art Jam 2026",
        "description": "A creative challenge where participants generate and submit AI-assisted artwork.",
        "date": "2026-01-15",
        "location": "Online",
        "registrationOpen": true,
        "registrationLink": "https://example.com/ai-art-jam"
    },
    {
        "title": "Phantom DevTalk: Game Engines",
        "description": "A tech session exploring Unity, Godot, and Unreal workflows.",
        "date": "2026-02-05",
        "location": "Discord",
        "registrationOpen": true,
        "registrationLink": "https://example.com/devtalk-ge"
    },
    {
        "title": "Pixel Horror Night",
        "description": "A themed gaming session featuring pixel-style horror games played together.",
        "date": "2026-03-12",
        "location": "Online",
        "registrationOpen": true,
        "registrationLink": "https://example.com/horror-night"
    },
    {
        "title": "Code & Chill Sprint #3",
        "description": "A relaxed coworking sprint for building and debugging projects.",
        "date": "2026-05-22",
        "location": "Discord",
        "registrationOpen": true,
        "registrationLink": "https://example.com/code-chill"
    },
    {
        "title": "Phantom AI Tools Masterclass",
        "description": "A beginner-friendly workshop on AI art, text, and workflow automation tools.",
        "date": "2026-07-09",
        "location": "Online",
        "registrationOpen": true,
        "registrationLink": "https://example.com/ai-masterclass"
    }
  ];

  /* ================================
      VIEW COUNTER MODULE
  ================================ */
  const ViewCounter = (() => {
    const STORAGE_KEY = 'pixelphantoms_event_views';
    const DEBOUNCE_TIME = 3000;
    const VIEW_INCREMENT_DELAY = 1500;

    let inMemoryViewData = {};
    let localStorageAvailable = true;
    const viewTimers = new Map();

    const getViewData = () => {
      if (!localStorageAvailable) return inMemoryViewData;
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        localStorageAvailable = false;
        return inMemoryViewData;
      }
    };

    const saveViewData = (data) => {
      if (!localStorageAvailable) {
        inMemoryViewData = data;
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        localStorageAvailable = false;
        inMemoryViewData = data;
      }
    };

    const getViewCount = (eventId) => {
      const data = getViewData();
      return data[eventId]?.count || 0;
    };

    const isRecentView = (eventId) => {
      const data = getViewData();
      if (!data[eventId]?.lastView) return false;
      const timeSinceLastView = Date.now() - data[eventId].lastView;
      return timeSinceLastView < DEBOUNCE_TIME;
    };

    const incrementViewCount = (eventId) => {
      if (isRecentView(eventId)) return getViewCount(eventId);
      const data = getViewData();
      if (!data[eventId]) {
        data[eventId] = { count: 0, lastView: null };
      }
      data[eventId].count += 1;
      data[eventId].lastView = Date.now();
      saveViewData(data);
      return data[eventId].count;
    };

    const formatViewCount = (count) => {
      if (count < 1000) return String(count);
      if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
      return (count / 1000000).toFixed(1) + 'M';
    };

    const updateViewDisplay = (eventId, count) => {
      const viewElement = document.querySelector('[data-view-for="' + eventId + '"]');
      if (viewElement) {
        const formattedCount = formatViewCount(count);
        const isPlural = formattedCount.includes('K') || formattedCount.includes('M') || count !== 1;
        viewElement.textContent = formattedCount + ' view' + (isPlural ? 's' : '');
        viewElement.parentElement.classList.add('view-pulse');
        setTimeout(() => viewElement.parentElement.classList.remove('view-pulse'), 500);
      }
    };

    const scheduleViewIncrement = (eventId, cardElement) => {
      if (viewTimers.has(eventId)) clearTimeout(viewTimers.get(eventId));
      const timer = setTimeout(() => {
        const newCount = incrementViewCount(eventId);
        updateViewDisplay(eventId, newCount);
        viewTimers.delete(eventId);
      }, VIEW_INCREMENT_DELAY);
      viewTimers.set(eventId, timer);
    };

    const cancelViewIncrement = (eventId) => {
      if (viewTimers.has(eventId)) {
        clearTimeout(viewTimers.get(eventId));
        viewTimers.delete(eventId);
      }
    };

    return {
      getViewCount,
      incrementViewCount,
      formatViewCount,
      updateViewDisplay,
      isRecentView,
      scheduleViewIncrement,
      cancelViewIncrement
    };
  })();

  /* ================================
      HELPER FUNCTIONS
  ================================ */

  const startCountdown = (event) => {
    const section = document.getElementById("countdown-section");
    const nameEl = document.getElementById("next-event-name");
    
    if (!section || !nameEl) return;

    const targetDate = new Date(event.date).getTime();
    section.classList.remove("countdown-hidden");
    nameEl.innerHTML = `Counting down to: <span style="color:var(--accent-color)">${event.title}</span>`;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        section.innerHTML = "<h3>The Event Has Started! 🚀</h3>";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById("days").innerText = String(days).padStart(2, "0");
      document.getElementById("hours").innerText = String(hours).padStart(2, "0");
      document.getElementById("minutes").innerText = String(minutes).padStart(2, "0");
      document.getElementById("seconds").innerText = String(seconds).padStart(2, "0");
    };

    setInterval(updateTimer, 1000);
    updateTimer();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const normalizeDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const generateEventId = (event) => {
    const base = (event.title || 'Untitled') + '|' + event.date + '|' + (event.location || '');
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      const char = base.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'event-' + Math.abs(hash);
  };

  const getEventStatus = (eventDate, today) => {
    if (eventDate < today) return { label: 'Ended', class: 'ended' };
    if (eventDate.getTime() === today.getTime()) return { label: 'Today', class: 'today' };
    return { label: 'Upcoming', class: 'upcoming' };
  };

  /* ================================
      EVENT CARD RENDERING
  ================================ */

  const createEventCard = (event, today) => {
    const eventDate = normalizeDate(event.date);
    const status = getEventStatus(eventDate, today);
    const eventId = generateEventId(event);
    const viewCount = ViewCounter.getViewCount(eventId);
    const formattedViews = ViewCounter.formatViewCount(viewCount);

    const hasValidRegistration = event.registrationOpen && event.registrationLink;

    const card = document.createElement('div');
    card.className = 'event-card ' + status.class;
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-event-id', eventId);
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', 'Event: ' + (event.title || 'Untitled Event'));

    const registerButtonHTML = hasValidRegistration && eventDate >= today
      ? `<a href="${event.registrationLink}" target="_blank" rel="noopener noreferrer" class="btn-register btn-open-register" data-event-title="${event.title.replace(/"/g, '&quot;')}">Register Now</a>`
      : '<button class="btn-register disabled" disabled>Registration Closed</button>';

    card.innerHTML = `
      <div class="event-card-header">
        <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
        <span class="event-status ${status.class}" role="status">${status.label}</span>
      </div>
      <div class="event-meta">
        <div class="meta-item"><i class="fa-solid fa-calendar-days"></i><span>${formatDate(event.date)}</span></div>
        <div class="meta-item"><i class="fa-solid fa-location-dot"></i><span>${event.location || 'TBA'}</span></div>
      </div>
      <p class="event-description">${event.description || 'Details coming soon.'}</p>
      <div class="event-footer">
        <div class="event-register">${registerButtonHTML}</div>
        <div class="event-views" role="status">
          <span class="view-icon">👁️</span>
          <span class="view-count" data-view-for="${eventId}">${formattedViews} view${viewCount !== 1 ? 's' : ''}</span>
        </div>
      </div>`;

    card.addEventListener('mouseenter', () => ViewCounter.scheduleViewIncrement(eventId, card));
    card.addEventListener('mouseleave', () => ViewCounter.cancelViewIncrement(eventId));
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-register')) {
        ViewCounter.cancelViewIncrement(eventId);
        const newCount = ViewCounter.incrementViewCount(eventId);
        ViewCounter.updateViewDisplay(eventId, newCount);
      }
    });

    return card;
  };

  /* ================================
      PAGINATION & CORE LOGIC
  ================================ */

  const renderPagination = (totalEvents) => {
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }

    paginationContainer.innerHTML = `
      <button class="pagination-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Previous</button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button class="pagination-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next <i class="fas fa-chevron-right"></i></button>`;

    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderEventsPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    document.getElementById('next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderEventsPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  };

  const renderEventsPage = () => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const pageEvents = allEventsData.slice(startIndex, startIndex + EVENTS_PER_PAGE);
    container.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pageEvents.forEach(event => container.appendChild(createEventCard(event, today)));
    renderPagination(allEventsData.length);
  };

  /* ================================
      INITIALIZATION (Replaces Fetch)
  ================================ */
  const initEvents = () => {
    container.innerHTML = ''; // Clear loading message
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = eventDatabase
      .filter(e => normalizeDate(e.date) >= today)
      .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

    const pastEvents = eventDatabase
      .filter(e => normalizeDate(e.date) < today)
      .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date));

    allEventsData = [...upcomingEvents, ...pastEvents];

    if (upcomingEvents.length > 0) {
      startCountdown(upcomingEvents[0]);
    }

    renderEventsPage();
  };

  initEvents(); // Run immediately using local array

  /* ================================
      REGISTRATION MODAL
  ================================ */
  (function() {
    const modal = document.getElementById('register-modal');
    const modalTitle = document.getElementById('register-event-title');
    const registerForm = document.getElementById('register-form');
    if (!modal || !registerForm) return;

    const closeModal = () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      registerForm.reset();
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-open-register');
      if (btn) {
        modalTitle.textContent = btn.dataset.eventTitle;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    });

    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('✓ Successfully registered! Check your email.', 'success');
      setTimeout(closeModal, 1000);
    });
  })();

  const showToast = (message, type) => {
    let toast = document.getElementById('toast-notification') || document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
    toast.textContent = message;
    toast.className = (type || 'info') + ' show';
    setTimeout(() => toast.classList.remove('show'), 4000);
  };
});