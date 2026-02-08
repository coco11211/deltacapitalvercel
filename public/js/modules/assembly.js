/*
    ASSEMBLY.JS
    ---
    Module for the system assembly visualization on the Architecture page.
*/

export function initAssembly(canvas, triggers) {
    if (!canvas || !triggers || triggers.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const group = new THREE.Group();
    scene.add(group);

    let currentPhase = -1;
    const nodeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const graph = {
        nodes: {
            'source1': { phase: 0, position: [-5, 3, 0] },
            'source2': { phase: 0, position: [-5, -3, 0] },
            'ingest1': { phase: 1, position: [-2, 2, 0] },
            'ingest2': { phase: 1, position: [-2, -2, 0] },
            'alphaCore': { phase: 2, position: [0, 0, 0], scale: 1.5 },
            'risk': { phase: 3, position: [2, 2, 0] },
            'exec': { phase: 3, position: [2, -2, 0] },
        },
        edges: [
            { from: 'source1', to: 'ingest1', phase: 1 },
            { from: 'source2', to: 'ingest2', phase: 1 },
            { from: 'ingest1', to: 'alphaCore', phase: 2 },
            { from: 'ingest2', to: 'alphaCore', phase: 2 },
            { from: 'alphaCore', to: 'risk', phase: 3 },
            { from: 'alphaCore', to: 'exec', phase: 3 },
            { from: 'risk', to: 'alphaCore', phase: 4 }, // Feedback loop
        ]
    };

    const nodeObjects = {};

    function animateNode(node, phase) {
        if (node.phase === phase) {
            const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            mesh.position.fromArray(node.position);
            if (node.scale) {
                mesh.scale.set(node.scale, node.scale, node.scale);
            }
            mesh.scale.set(0,0,0);
            group.add(mesh);
            nodeObjects[node.id] = mesh;

            // Animate scale
            new TWEEN.Tween(mesh.scale)
                .to({ x: node.scale || 1, y: node.scale || 1, z: node.scale || 1 }, 800)
                .easing(TWEEN.Easing.Elastic.Out)
                .start();
        }
    }

    function animateEdge(edge, phase) {
        if (edge.phase === phase) {
            const startNode = nodeObjects[edge.from];
            const endNode = nodeObjects[edge.to];
            if (!startNode || !endNode) return;

            const curve = new THREE.LineCurve3(startNode.position, endNode.position);
            const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
            const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
            const line = new THREE.Mesh(geometry, material);
            line.scale.z = 0;
            group.add(line);
            
            // Animate line drawing
            new TWEEN.Tween(line.scale)
                .to({ z: 1 }, 600)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

    function setPhase(phase) {
        if (phase <= currentPhase) return;
        currentPhase = phase;

        Object.keys(graph.nodes).forEach(id => {
            graph.nodes[id].id = id;
            animateNode(graph.nodes[id], phase);
        });

        graph.edges.forEach(edge => {
            animateEdge(edge, phase);
        });
        
        // Special effect for phase 3
        if (phase === 2) {
             const coreNode = nodeObjects['alphaCore'];
             if (coreNode) {
                 new TWEEN.Tween(coreNode.material.color)
                    .to({ r: 1, g: 0, b: 0 }, 100).yoyo(true).repeat(3)
                    .delay(600).start();
             }
        }
    }

    // Observer for triggers
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const phase = parseInt(entry.target.dataset.triggerPhase, 10);
                setPhase(phase);
            }
        });
    }, { threshold: 1.0 });

    triggers.forEach(trigger => observer.observe(trigger));

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        group.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }

    animate();
    
    // Add TWEEN.js script to head if not present
    if (!window.TWEEN) {
        const tweenScript = document.createElement('script');
        tweenScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';
        document.head.appendChild(tweenScript);
    }
    
}
