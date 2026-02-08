export function initScroll() {
    const sections = document.querySelectorAll('.viewport');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.dataset.scrollState = 'active';
            } else {
                entry.target.dataset.scrollState = 'inactive';
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}
