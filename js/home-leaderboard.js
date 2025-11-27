// js/home-leaderboard.js

// Configuration (Matches contributors.js)
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const XP_MULTIPLIER = 100; // Multiplier to convert Points (PTS) to XP

// Point System Weights (Matches contributors.js)
const POINTS = {
    L3: 11,
    L2: 5,
    L1: 2,
    DEFAULT: 1
};

document.addEventListener('DOMContentLoaded', () => {
    initLeaderboard();
});

async function initLeaderboard() {
    try {
        // 1. Fetch Pull Requests (Limit to 3 pages to match contributors logic)
        const pulls = await fetchAllPulls();
        
        // 2. Calculate scores based on labels
        const scores = calculateScores(pulls);
        
        // 3. Sort and get top 3 contributors
        const topContributors = getTopContributors(scores);
        
        // 4. Update the DOM
        updateLeaderboardUI(topContributors);
        
    } catch (error) {
        console.error("Failed to load leaderboard:", error);
    }
}

async function fetchAllPulls() {
    let pulls = [];
    let page = 1;
    // Fetch up to 3 pages (300 PRs) to ensure we capture recent history
    while (page <= 3) {
        try {
            const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
            if (!res.ok) break;
            const data = await res.json();
            if (!data.length) break;
            pulls = pulls.concat(data);
            page++;
        } catch (e) { break; }
    }
    return pulls;
}

function calculateScores(pulls) {
    const statsMap = {};

    pulls.forEach(pr => {
        // Only count merged PRs
        if (!pr.merged_at) return;

        const user = pr.user.login;
        // Exclude the repo owner from the leaderboard
        if (user.toLowerCase() === REPO_OWNER.toLowerCase()) return;

        if (!statsMap[user]) {
            statsMap[user] = 0;
        }

        let prPoints = 0;
        let hasLevel = false;

        // Calculate points based on labels
        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3') || name.includes('level-3')) {
                prPoints += POINTS.L3;
                hasLevel = true;
            } else if (name.includes('level 2') || name.includes('level-2')) {
                prPoints += POINTS.L2;
                hasLevel = true;
            } else if (name.includes('level 1') || name.includes('level-1')) {
                prPoints += POINTS.L1;
                hasLevel = true;
            }
        });

        if (!hasLevel) prPoints += POINTS.DEFAULT;

        statsMap[user] += prPoints;
    });

    return statsMap;
}

function getTopContributors(statsMap) {
    return Object.entries(statsMap)
        .map(([login, points]) => ({ login, points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 3);
}

function updateLeaderboardUI(top3) {
    const rows = [
        { selector: '.lb-row.gold', data: top3[0] },
        { selector: '.lb-row.silver', data: top3[1] },
        { selector: '.lb-row.bronze', data: top3[2] }
    ];

    rows.forEach(row => {
        const el = document.querySelector(row.selector);
        
        if (el) {
            const spans = el.querySelectorAll('span');
            // Ensure we have the 3 spans: Rank, Name, XP
            if (spans.length === 3) {
                if (row.data) {
                    spans[1].textContent = `@${row.data.login}`;
                    // Calculate XP: Points * Multiplier
                    const xp = row.data.points * XP_MULTIPLIER;
                    spans[2].textContent = `${xp.toLocaleString()} XP`;
                } else {
                    // Placeholder if fewer than 3 contributors exist
                    spans[1].textContent = "---";
                    spans[2].textContent = "0 XP";
                }
            }
        }
    });
}