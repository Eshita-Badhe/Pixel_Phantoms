// Configuration
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State
let allContributors = [];
let eventsLog = [];

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // 1. Fetch Real Data
    try {
        const [contributors, repo] = await Promise.all([
            fetchContributors(),
            fetchRepoDetails()
        ]);

        // 2. Process Data
        allContributors = processContributors(contributors);
        
        // 3. Update UI
        updateKPIs(allContributors, repo);
        renderPodium(allContributors.slice(0, 3));
        renderTable(allContributors);
        renderVelocityChart(); // Simulated for visual effect
        generateActivityFeed(allContributors);

    } catch (e) {
        console.error("System Failure:", e);
    }
}

// --- API CALLS ---
async function fetchContributors() {
    const res = await fetch(`${API_BASE}/contributors?per_page=100`);
    if(!res.ok) throw new Error("API Limit");
    return await res.json();
}

async function fetchRepoDetails() {
    const res = await fetch(API_BASE);
    return await res.json();
}

// --- DATA PROCESSING ---
function processContributors(data) {
    return data.map((user, index) => {
        // Calculate Pseudo-XP based on contributions (since real line count needs complex auth)
        const xp = (user.contributions * 100) + Math.floor(Math.random() * 50);
        
        // Determine "Class" based on random assignment for visual variety (Real implementation would check file types)
        const classes = ['DEV', 'DESIGN', 'DOCS', 'ARCHITECT'];
        const userClass = classes[Math.floor(Math.random() * classes.length)];
        
        return {
            rank: index + 1,
            login: user.login,
            avatar: user.avatar_url,
            contributions: user.contributions,
            xp: xp,
            level: Math.floor(xp / 500) + 1,
            class: userClass,
            status: xp > 1000 ? 'ELITE' : 'ACTIVE'
        };
    });
}

// --- RENDER FUNCTIONS ---

function updateKPIs(users, repo) {
    animateCounter('total-agents', users.length);
    animateCounter('total-merges', users.reduce((acc, u) => acc + u.contributions, 0));
    animateCounter('global-xp', users.reduce((acc, u) => acc + u.xp, 0));
    
    // Ping simulation
    setInterval(() => {
        document.getElementById('ping-val').innerText = (Math.floor(Math.random() * 30) + 10) + 'ms';
    }, 2000);
}

function renderPodium(top3) {
    const container = document.getElementById('podium-container');
    container.innerHTML = '';

    top3.forEach(user => {
        const card = document.createElement('div');
        card.className = `podium-card rank-${user.rank}`;
        card.innerHTML = `
            <div class="podium-rank">#${user.rank}</div>
            <img src="${user.avatar}" class="podium-avatar">
            <div class="podium-info">
                <h4>${user.login}</h4>
                <span>${user.xp} XP</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderTable(users) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // Class styling
        let classBadge = '';
        if(user.class === 'DEV') classBadge = '<span class="class-tag class-dev">DEV</span>';
        else if(user.class === 'DESIGN') classBadge = '<span class="class-tag class-des">UI/UX</span>';
        else classBadge = '<span class="class-tag class-doc">DOCS</span>';

        tr.innerHTML = `
            <td>#${user.rank}</td>
            <td style="display:flex; align-items:center; gap:10px;">
                <img src="${user.avatar}" style="width:25px; height:25px; border-radius:50%">
                ${user.login}
            </td>
            <td>${classBadge}</td>
            <td>${user.contributions}</td>
            <td style="color:var(--neon-blue)">LVL ${user.level}</td>
            <td>${user.status}</td>
        `;
        tbody.appendChild(tr);
    });

    // Search Filter
    document.getElementById('search-agent').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        Array.from(tbody.children).forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

// VISUALIZATION: Random Bar Chart
function renderVelocityChart() {
    const container = document.getElementById('velocity-chart');
    const barCount = 30;
    
    for(let i=0; i<barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        // Random height for "activity" look
        const h = Math.floor(Math.random() * 80) + 20;
        bar.style.height = `${h}%`;
        bar.style.opacity = (i / barCount) + 0.3;
        container.appendChild(bar);
    }
}

// SIMULATION: Activity Feed
function generateActivityFeed(users) {
    const list = document.getElementById('feed-list');
    const actions = ['pushed code', 'merged PR', 'opened issue', 'deployed build', 'refactored core'];
    
    // Generate initial fake history
    for(let i=0; i<10; i++) {
        addFeedItem(list, users, actions);
    }

    // Add live updates
    setInterval(() => {
        addFeedItem(list, users, actions);
    }, 3000);
}

function addFeedItem(list, users, actions) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const time = new Date().toLocaleTimeString();
    
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
        <span class="feed-time">[${time}]</span>
        <span class="feed-user">${randomUser.login}</span>
        ${randomAction} in <span style="color:#fff">main</span>
    `;
    
    list.prepend(item);
    if(list.children.length > 15) list.lastChild.remove();
}

// UTILS
function animateCounter(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const inc = Math.ceil(target / 50);
    const timer = setInterval(() => {
        current += inc;
        if(current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.innerText = current.toLocaleString();
    }, 20);
}