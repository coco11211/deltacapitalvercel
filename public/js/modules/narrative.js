/*
    NARRATIVE.JS
    ---
    Module for the scroll-driven narrative 3D object on the Research page.
*/

export function initNarrative(canvas, container) {
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // The geometric surface
    const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        opacity: 0.5,
        transparent: true,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const originalPositions = new Float32Array(geometry.attributes.position.array);
    const noise = new THREE.SimplexNoise();

    let scrollProgress = 0;

    // Scroll listener to update progress
    window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.scrollHeight - window.innerHeight;
        const scrollTop = -rect.top;

        if (scrollTop >= 0 && scrollTop <= scrollableHeight) {
            scrollProgress = scrollTop / scrollableHeight;
        }
    });

    function gaussian(x, z, amplitude, cx, cz, sigma) {
        return amplitude * Math.exp(-(
            (Math.pow(x - cx, 2) / (2 * Math.pow(sigma, 2))) +
            (Math.pow(z - cz, 2) / (2 * Math.pow(sigma, 2)))
        ));
    }

    function animate() {
        requestAnimationFrame(animate);

        const t = scrollProgress;
        const positions = geometry.attributes.position.array;

        // Define animation stages based on t
        const peak1_amplitude = Math.min(1.0, t * 4) * 1.5;
        const noise_amplitude = t > 0.25 ? Math.min(1.0, (t - 0.25) * 4) * 0.1 : 0;
        const peak2_amplitude = t > 0.5 ? Math.min(1.0, (t - 0.5) * 4) * 1.2 : 0;
        const camera_pullback = t > 0.75 ? (t - 0.75) * 4 * 3 : 0;

        for (let i = 0; i < positions.length; i += 3) {
            const ox = originalPositions[i];
            const oz = originalPositions[i + 2];

            let y = 0;

            // Stage 1: Main peak
            y += gaussian(ox, oz, peak1_amplitude, 0, 0, 1.5);

            // Stage 2: Noise
            if (noise_amplitude > 0) {
                 y += noise.noise2d(ox * 2, oz * 2) * noise_amplitude;
            }

            // Stage 3: Second peak
            if (peak2_amplitude > 0) {
                y += gaussian(ox, oz, peak2_amplitude, 3, -2, 1);
            }
            
            positions[i + 1] = y;
        }

        geometry.attributes.position.needsUpdate = true;
        camera.position.z = 5 + camera_pullback;
        camera.position.y = 4 + camera_pullback;
        camera.lookAt(0,0,0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });
}
