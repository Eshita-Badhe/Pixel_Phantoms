document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    loadRoadmapData();
});

async function loadRoadmapData() {
    const container = document.getElementById('roadmap-mount-point');
    
    try {
        const response = await fetch('../data/roadmaps.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const phases = data.web.phases;

        container.innerHTML = ''; // Clear loading text

        phases.forEach((phase, index) => {
            const node = createPhaseNode(phase, index);
            container.appendChild(node);
        });

        // Trigger animations after DOM insertion
        animateRoadmap();

    } catch (error) {
        console.error('Error loading roadmap:', error);
        container.innerHTML = `<div class="console-text error">
            [ERROR] FAILED TO DECRYPT DATA_PACKET.<br>
            > CHECK CONSOLE FOR TRACE.
        </div>`;
    }
}

function createPhaseNode(phase, index) {
    const div = document.createElement('div');
    div.classList.add('phase-node');
    div.setAttribute('data-index', index);

    // Build modules HTML
    const modulesHTML = phase.modules.map(mod => `
        <li class="module-item">
            <a href="${mod.link}" target="_blank" class="module-link">
                <i class="fas fa-caret-right"></i> ${mod.title}
                <span class="module-desc">${mod.desc}</span>
            </a>
        </li>
    `).join('');

    div.innerHTML = `
        <h3 class="phase-title">${phase.title}</h3>
        <ul class="module-list">
            ${modulesHTML}
        </ul>
    `;

    return div;
}

function animateRoadmap() {
    // Animate the line growing
    gsap.from(".timeline-line", {
        height: 0,
        duration: 2,
        ease: "power2.inOut"
    });

    // Animate nodes appearing
    const nodes = document.querySelectorAll('.phase-node');
    
    nodes.forEach((node, i) => {
        // Determine direction (left or right) based on odd/even
        const xOffset = i % 2 === 0 ? -100 : 100;
        
        gsap.fromTo(node, 
            { 
                opacity: 0, 
                x: xOffset,
                filter: "blur(10px)"
            },
            {
                scrollTrigger: {
                    trigger: node,
                    start: "top 80%",
                    end: "top 50%",
                    scrub: 1,
                    // markers: true // Toggle for debugging
                },
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                duration: 1
            }
        );
    });
}