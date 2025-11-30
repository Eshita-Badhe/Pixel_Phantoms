// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------
// 1. REPLACE THIS with your deployed Web App URL
// If you haven't deployed one yet, keep this string empty to force Fallback Mode.
const API_URL = "https://script.google.com/macros/s/AKfycbza1-ZyT4B8hU3h87Agc_jkPQ8dAjQBJkXkvxYfQ4SNAUENQtlXmYzdXgkC_Kj_zt-B/exec"; 

// 2. Fallback Data Path (Your local JSON file)
const LOCAL_JSON_PATH = "data/events.json";

let allEvents = [];
const EVENTS_PER_PAGE = 6; 

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    initOrganizeForm();
});

// -------------------------------------------------------------------------
// 1. LOAD EVENTS (With Auto-Fallback)
// -------------------------------------------------------------------------
async function loadEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = `<p class="loading-msg">Connecting to event stream...</p>`;

    try {
        // STEP A: Try to fetch from Google Sheets
        if (!API_URL || API_URL.includes("YOUR_SCRIPT_URL")) {
            throw new Error("API URL not configured");
        }

        console.log("Attempting to fetch from Google Sheet...");
        const res = await fetch(API_URL);
        
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        
        // Filter: Only show 'Approved' events (Case Insensitive)
        allEvents = data.filter(e => 
            e.status && e.status.toString().toLowerCase().trim() === "approved"
        );
        
        console.log("✅ Success: Loaded from Google Sheet");

    } catch (error) {
        // STEP B: Fallback to Local JSON if API fails
        console.warn("⚠️ API Connection Failed. Switching to Local Fallback.", error);
        
        try {
            const localRes = await fetch(LOCAL_JSON_PATH);
            allEvents = await localRes.json();
            console.log("✅ Loaded from Local Backup");
            
            // Optional: Show a tiny indicator that we are in offline mode
            showToast("Offline Mode: Showing cached events");
        } catch (localError) {
            container.innerHTML = `<p class="error-msg">Unable to load events.</p>`;
            return;
        }
    }

    // Sort: Nearest upcoming date first
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Setup Countdown
    setupCountdown(allEvents);

    // Initial Render
    renderPage(1);
}

function renderPage(page) {
    const container = document.getElementById("events-container");
    container.innerHTML = "";
    
    const start = (page - 1) * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    const eventsToShow = allEvents.slice(start, end);

    if (eventsToShow.length === 0) {
        container.innerHTML = `<div style="text-align:center; grid-column:1/-1;">No upcoming events found.</div>`;
        return;
    }

    const now = new Date();
    const nextEvent = allEvents.find(e => new Date(e.date) > now);

    eventsToShow.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("event-card");
        
        // Highlight logic
        if (nextEvent && event === nextEvent) {
            card.style.borderColor = "var(--accent-color)";
            card.style.boxShadow = "0 0 15px rgba(0, 170, 255, 0.15)";
        }

        // Safe Date Formatting
        let dateStr = event.date;
        try {
            const d = new Date(event.date);
            if(!isNaN(d)) dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
        } catch(e){}

        card.innerHTML = `
            ${(nextEvent && event === nextEvent) ? '<div style="color:var(--accent-color); font-weight:bold; font-size:0.8rem; margin-bottom:8px; text-transform:uppercase;">🔥 Next Up</div>' : ''}
            <h2>${event.title}</h2>
            <p class="event-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</p>
            <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || 'TBD'}</p>
            <p class="event-description">${event.description || 'No details available.'}</p>
            <a href="${event.link || '#'}" class="btn-event" target="_blank">View Details</a>
        `;
        container.appendChild(card);
    });

    renderPaginationControls(page);
}

function renderPaginationControls(page) {
    const container = document.getElementById('pagination-controls');
    if(!container) return;
    
    const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
            <i class="fas fa-chevron-left"></i> Prev
        </button>
        <span class="page-info">Page ${page} of ${totalPages}</span>
        <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

window.changePage = function(newPage) {
    renderPage(newPage);
    document.querySelector('.events-container').scrollIntoView({ behavior: 'smooth' });
};

// -------------------------------------------------------------------------
// 2. COUNTDOWN LOGIC
// -------------------------------------------------------------------------
function setupCountdown(events) {
    const now = new Date();
    const upcoming = events.find(e => new Date(e.date) > now);
    const section = document.getElementById('countdown-section');

    if (upcoming && section) {
        section.classList.remove('countdown-hidden');
        document.getElementById('next-event-name').innerHTML = `Counting down to: <span style="color:var(--accent-color)">${upcoming.title}</span>`;
        
        const target = new Date(upcoming.date).getTime();
        
        const timer = setInterval(() => {
            const nowTime = new Date().getTime();
            const diff = target - nowTime;

            if (diff < 0) {
                clearInterval(timer);
                section.innerHTML = "<h3>Event has started! 🚀</h3>";
                return;
            }

            document.getElementById("days").innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
            document.getElementById("hours").innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            document.getElementById("minutes").innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            document.getElementById("seconds").innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    } else if (section) {
        section.classList.add('countdown-hidden');
    }
}

// -------------------------------------------------------------------------
// 3. ORGANIZE FORM LOGIC (Robust Submission)
// -------------------------------------------------------------------------
function initOrganizeForm() {
    const form = document.getElementById('organize-form');
    const feedback = document.getElementById('organize-feedback');
    
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
            feedback.textContent = "";
            feedback.className = "feedback-message";

            const formData = {
                title: document.getElementById('event-title').value,
                type: document.getElementById('event-type').value,
                date: document.getElementById('event-date').value,
                description: document.getElementById('event-desc').value,
                location: "TBD", // Default values for CSV strictness
                link: "#",
                status: "Pending"
            };

            try {
                // IMPORTANT: Use text/plain to avoid CORS Preflight (OPTIONS) request
                // Google Apps Script handles this better than application/json
                await fetch(API_URL, {
                    method: "POST",
                    mode: "no-cors", 
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(formData)
                });

                // Success visual
                feedback.innerHTML = '<i class="fas fa-check-circle"></i> Proposal sent successfully!';
                feedback.className = "feedback-message success";
                form.reset();

            } catch (error) {
                console.error("Submission failed:", error);
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to connect. Try again later.';
                feedback.className = "feedback-message error";
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    setTimeout(() => { 
                        feedback.textContent = ""; 
                        feedback.className = "feedback-message";
                        feedback.style.opacity = '1';
                    }, 500);
                }, 5000);
            }
        });
    }
}

// Utility Toast for Fallback Notice
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(50,50,50,0.9); color: white; padding: 10px 20px;
        border-radius: 50px; z-index: 10000; font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3); animation: fadeIn 0.5s;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}