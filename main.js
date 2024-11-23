import * as THREE from 'three';
import { makeNoise2D } from 'fast-simplex-noise';

const noise2D = new makeNoise2D();

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const radialAmnt = 400;
const tubularAmnt = 800;
const rc = 1;
const rt = .4;
const geometry = new THREE.TorusGeometry(rc, rt, radialAmnt, tubularAmnt);


function parametrizeUV(x, y, z, Rc, Rt) {
    let u = Math.atan2(y, x);
    
    let Cu = {x: Rc * Math.cos(u), y: Rc * Math.sin(u)};
    let dx = x - Cu.x;
    let dy = y - Cu.y;
    let dz = z;
    let v = Math.atan2(dz, Math.sqrt(dx*dx + dy*dy));

    if (u < 0) u += 2 * Math.PI;
    if (v < 0) v += 2 * Math.PI;

    return {u: u, v: v};
}

function calculateNormal(x, y, z, Rc, Rt) {
    // Parametrize UV to find the center of the torus tube circle
    let u = Math.atan2(y, x);
    let Cu = new THREE.Vector3(Rc * Math.cos(u), Rc * Math.sin(u), 0); // Center of the tube

    // Vector from the torus tube center to the point
    let toPoint = new THREE.Vector3(x, y, z).sub(Cu);

    // The normal vector is along this direction
    let normal = toPoint.normalize();

    return normal;
}

/// looping through coords to set height
const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    let uv_dict = parametrizeUV(x, y, z, rc, rt);
    let u = uv_dict.u*180/Math.PI;
    let v = uv_dict.v*180/Math.PI;
    console.log('v coord: ', v);

    let normal = calculateNormal(x, y, z, rc, rt);

    let noiseValue = noise2D(u, v);
    let displacement = noiseValue * .01;
    console.log('displacement: ', displacement);
    // let displacement = 0;
    if (u > 50 && u < 140) {
        if (v > 0 && v < 90) {
            displacement = Math.abs(.5 + (Math.sin(v / 10) + Math.sin(u / 10)) + Math.random()) / 50;
        }
    }
    if (u > 140 && u < 160) {
        if (v > 0 && v < 90) {
            displacement = Math.abs(1.5 + (Math.sin(v / 5) + Math.sin(u / 5)) + Math.random()) / 40;
        }
    }
    
    pos.setXYZ(i, x + normal.x * displacement, y + normal.y * displacement, z + normal.z * displacement);
}
pos.needsUpdate = true;


// const texture = new THREE.TextureLoader().load('./textures/earth.jpeg'); // Replace with your texture
// const dMap = new THREE.TextureLoader().load('./textures/grayscale.jpeg');
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
camera.position.z = 1.5;
// camera.position.y = -1;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x = -.55;
    torus.rotation.y += -.001;
    torus.rotation.z += -.002;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
