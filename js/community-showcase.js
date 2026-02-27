/**
 * COMMUNITY_SHOWCASE ENGINE (Single-File Architecture)
 * Handles dynamic project rendering, new-tab execution, and source code copying.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initializing the showcase system from the JSON registry
    fetchCommunityProjects();
});

/**
 * 1. DYNAMIC RENDERING SYSTEM
 * Fetches data from the registry and builds the project grid.
 */
async function fetchCommunityProjects() {
    const grid = document.getElementById('community-grid');
    if (!grid) return;

    try {
        // Fetch the community project registry
        // Path assumed: data/community_projects.json
        const response = await fetch('../data/community_projects.json');
        if (!response.ok) throw new Error('System Link Failure: Could not access community database.');
        
        const projects = await response.json();
        
        // Clear the injection point and render cards
        grid.innerHTML = ''; 
        projects.forEach(project => renderProjectCard(project, grid));
        
        console.log(`[Showcase]: ${projects.length} community modules linked successfully.`);
    } catch (err) {
        grid.innerHTML = `<p class="console-text" style="color: #ff0055;">> CRITICAL_ERROR: ${err.message}</p>`;
        console.error("Showcase Initialization Error:", err);
    }
}

/**
 * Helper: Builds the card HTML and injects it into the grid.
 */
function renderProjectCard(project, container) {
    // Construct the direct path to the single project file
    // Assumes structure: projects/community/[folder]/index.html
    const filePath = `../projects/community/${project.folder}/${project.file || 'index.html'}`;
    
    const card = document.createElement('article');
    card.className = 'cyber-card showcase-card';
    
    card.innerHTML = `
    <div class="card-content">
        <div class="card-header">
            <span class="project-id">#${project.id.toUpperCase()}</span>
            <span class="status-dot online"></span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="showcase-actions">
            <button class="btn-cyber" onclick="executeDemo('${filePath}')">
                EXECUTE_DEMO
            </button>
            <button class="btn-terminal" style="color: white !important;" onclick="copySource('${filePath}')">
                <i class="fas fa-copy"></i> COPY_SOURCE
            </button>
        </div>
    </div>
`;
    container.appendChild(card);
}

/**
 * 2. EXECUTION SYSTEM
 * Opens the specific project's index.html in a new browser tab.
 */
function executeDemo(filePath) {
    const demoWindow = window.open(filePath, '_blank');
    
    // Safety check for popup blockers
    if (demoWindow) {
        demoWindow.focus();
    } else {
        alert('Uplink Blocked: Please allow popups for this site to view the demo.');
    }
}

/**
 * 3. SOURCE CLONING SYSTEM
 * Fetches the raw text of the single file and copies it to the clipboard.
 */
async function copySource(filePath) {
    // Optional: Visual feedback notification logic
    const notify = (msg, color) => {
        const status = document.createElement('div');
        status.className = 'copy-notification show';
        status.style.background = color || 'var(--accent-color)';
        status.textContent = msg;
        document.body.appendChild(status);
        setTimeout(() => status.remove(), 2500);
    };

    notify("> RETRIEVING_DATA_STREAM...");

    try {
        // Fetch the specific single-file index.html
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Data fetch failed.');
        
        const codeContent = await response.text();

        // Write the content to the system clipboard
        await navigator.clipboard.writeText(codeContent.trim());
        
        notify("> SOURCE_CODE_COPIED", "#00ff88");
    } catch (err) {
        console.error("Cloning Error:", err);
        notify("> UPLINK_FAILED", "#ff0055");
    }
}