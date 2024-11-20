import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const radialAmnt = 100;
const tubularAmnt = 200;
const geometry = new THREE.TorusGeometry(1, .4, radialAmnt, tubularAmnt);

/// looping through coords to set height
const rIndex = 0;
const tIndex = 0;
const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const rIndex = Math.floor(i / radialAmnt);
    const tIndex = i % tubularAmnt;
    const u = rIndex / radialAmnt;
    const v = tIndex / tubularAmnt;

    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    let displacement = 0;
    // const dist = Math.sqrt(x*x + y*y + z*z);
    if (v > .1 && v < .5) {
        if (u > .1 && u < .5) {
            displacement = Math.sin(v) * Math.random() / 30;
        }
    } else {
        displacement = 0;
    }
    
    pos.setXYZ(i, x + displacement * x, y + displacement * y, z + displacement * z);
}
pos.needsUpdate = true;


const texture = new THREE.TextureLoader().load('./textures/earth.jpeg'); // Replace with your texture
const dMap = new THREE.TextureLoader().load('./textures/grayscale.jpeg');
const material = new THREE.MeshStandardMaterial({
    // map: texture,
    color: 0x188888,
    wireframe: true,
    // displacementMap: dMap,
    // displacementScale: .1,
});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);


// Add light
const light = new THREE.DirectionalLight(0xffffff, 10);
light.position.set(5, 5, 5);
scene.add(light);

// Position Camera
camera.position.z = 3;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x += 0.005;
    torus.rotation.y += -0.0001;
    torus.rotation.z += -0.005;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
