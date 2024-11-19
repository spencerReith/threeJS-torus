import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.TorusGeometry(1, .4, 100, 200);
const texture = new THREE.TextureLoader().load('./textures/earth.jpeg'); // Replace with your texture
const dMap = new THREE.TextureLoader().load('./textures/grayscale.jpeg');
const material = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0x188888,
    wireframe: true,
    displacementMap: dMap,
    displacementScale: .1,
});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

// Add light
const light = new THREE.DirectionalLight(0xffffff, 10);
light.position.set(5, 5, 5);
const secondLight = new THREE.DirectionalLight(0xffffff, 10);
secondLight.position.set(-5, -5, -5);
scene.add(secondLight);
scene.add(light);

// Position Camera
camera.position.z = 3;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x += 0.02;
    torus.rotation.y += 0.04;
    torus.rotation.z += 0.15;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
