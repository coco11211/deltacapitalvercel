export function initAssembly(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const nodes = [
        { x: width * 0.2, y: height * 0.3, size: 10 },
        { x: width * 0.5, y: height * 0.2, size: 8 },
        { x: width * 0.8, y: height * 0.4, size: 12 },
        { x: width * 0.3, y: height * 0.7, size: 9 },
        { x: width * 0.7, y: height * 0.8, size: 11 },
    ];

    function draw(progress) {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';

        // Draw nodes
        const nodesToShow = Math.floor(progress * nodes.length);
        for (let i = 0; i < nodesToShow; i++) {
            ctx.beginPath();
            ctx.arc(nodes[i].x, nodes[i].y, nodes[i].size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw connections
        if (progress > 0.5) {
            const connectionProgress = (progress - 0.5) * 2;
            for (let i = 0; i < nodesToShow - 1; i++) {
                for (let j = i + 1; j < nodesToShow; j++) {
                    if (Math.random() > 0.5) { // Randomly connect some nodes
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        const destX = nodes[i].x + (nodes[j].x - nodes[i].x) * connectionProgress;
                        const destY = nodes[i].y + (nodes[j].y - nodes[i].y) * connectionProgress;
                        ctx.lineTo(destX, destY);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    window.addEventListener('scroll', () => {
        const assemblySection = document.getElementById('assembly-section');
        if (!assemblySection) return;
        const scrollableHeight = assemblySection.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY - assemblySection.offsetTop;
        const progress = Math.max(0, Math.min(1, scrollTop / scrollableHeight));

        draw(progress);
    });

    draw(0);
}
