document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initTypeWriter();
    initScrollReveal();
    initDPOForm();
});

// 1. Dynamic Typing Effect for Title
function initTypeWriter() {
    const titleElement = document.getElementById('dynamic-title');
    const textToType = "Privacy_Policy !!"; // Tech-themed typing text
    let index = 0;

    // Add cursor span
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    titleElement.parentNode.insertBefore(cursor, titleElement.nextSibling);

    function type() {
        if (index < textToType.length) {
            titleElement.innerHTML += textToType.charAt(index);
            index++;
            setTimeout(type, 100); // Typing speed
        }
    }

    // Start typing after a slight delay
    setTimeout(type, 500);
}

// 2. GSAP Scroll Animations
function initScrollReveal() {
    // Animate Policy Text Sections (Slide Up)
    gsap.utils.toArray('.reveal-text').forEach((section) => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Animate Sidebar Stamps (Slide In from Right)
    gsap.utils.toArray('.reveal-stamps').forEach((box, i) => {
        gsap.to(box, {
            scrollTrigger: {
                trigger: box,
                start: "top 90%",
            },
            x: 0,
            opacity: 1,
            duration: 1,
            delay: i * 0.2,
            ease: "back.out(1.7)"
        });
    });
}

// 3. DPO Contact Form Handler
function initDPOForm() {
    const dpoForm = document.getElementById('dpo-form');
    if (!dpoForm) return;

    dpoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(dpoForm);
        const payload = {
            email: formData.get('email'),
            message: formData.get('message'),
        };

        try {
            const res = await fetch('https://formsubmit.co/ajax/privacy@pixelphantoms.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to send');

            alert('Your message has been sent to the DPO.');
            dpoForm.reset();
        } catch (err) {
            console.error(err);
            alert('Unable to send message right now. Please email privacy@pixelphantoms.com directly.');
        }
    });
}
