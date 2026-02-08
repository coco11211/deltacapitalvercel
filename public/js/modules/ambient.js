/*
    AMBIENT.JS
    ---
    Module for the continuous, low-opacity background visualization.
*/

export function initAmbient(canvas) {
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

        velocities[i * 3] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x000000,
        size: 0.02,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.7
    });

    const points = new THREE.Points(particles, material);
    scene.add(points);

    camera.position.z = 15;

    const noise = new THREE.SimplexNoise();
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime() * 0.1;

        const positions = points.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            // Add curl noise for fluid motion
            const n = noise.noise3d(x * 0.1 + time, y * 0.1, z * 0.1);
            positions[i3] += Math.sin(n * Math.PI) * delta * 0.5;
            positions[i3+1] += Math.cos(n * Math.PI) * delta * 0.5;
            positions[i3+2] += (noise.noise3d(y * 0.1, z * 0.1, x * 0.1 + time) - 0.5) * delta;

            // Boundary checks
            if (positions[i3+1] < -15) positions[i3+1] = 15;
        }

        points.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}
