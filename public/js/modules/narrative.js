export function initNarrative(canvas) {
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    let shape;

    // Create an initial shape (e.g., a line)
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = new Float32Array(300 * 3); // 100 points, 3 vertices each
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    shape = new THREE.Line(geometry, material);
    scene.add(shape);

    camera.position.z = 5;

    function updateShape(progress) {
        const positions = shape.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const t = (i / positions.length) * Math.PI * 4; 
            // Morph from a line to a sine wave based on scroll progress
            positions[i] = (i / positions.length - 0.5) * 10;
            positions[i + 1] = Math.sin(t * progress) * progress; // y
            positions[i + 2] = 0; // z
        }
        shape.geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        renderer.render(scene, camera);
    }

    window.addEventListener('scroll', () => {
        const narrativeSection = document.getElementById('narrative-section');
        if (!narrativeSection) return;
        const scrollableHeight = narrativeSection.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY - narrativeSection.offsetTop;
        const progress = Math.max(0, Math.min(1, scrollTop / scrollableHeight));

        updateShape(progress);
        animate();
    });

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        animate();
    });

    updateShape(0);
    animate();
}
