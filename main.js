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

function fBm(point, octaves, H, noiseFunction, u, v) {
    let value = 0.0;
    let w = 1.0;

    for (let i = 0; i < octaves; i++) {
        value += w * noiseFunction(u, v);
        point.x *= 2;
        point.y *= 2;
        w *= Math.pow(2, -H);
    }

    return value;
}

/// looping through coords to set height
const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const point = {x: x, y: y, z: z};

    let uv_dict = parametrizeUV(x, y, z, rc, rt);
    let u = uv_dict.u*180/Math.PI;
    let v = uv_dict.v*180/Math.PI;

    let normal = calculateNormal(x, y, z, rc, rt);

    let noiseValue = noise2D(u, v);
    const octaves = 5;
    const h = .4;

    let displacement = 0;
    let epsilon = 10;

    /////////////////////
    // Baseline perlin noise
    ///////////////
    displacement = noiseValue / 400;

    /////////////////////
    // fBn Mountains
    //////////////
    if (u > 70 && u < 120) {
        if (v > 0 && v < 90) {
            const result = fBm(point, octaves, h, noise2D, u, v);
            displacement = result / 100;
        }
        let diff = Math.min(Math.abs(70 - u), Math.abs(120 - u), Math.abs(0 - v), Math.abs(90 - v));
        if (diff < epsilon) {
            diff = diff / epsilon;
            displacement *= diff;
        }
    }

    ///////////////////
    // sin/cos Mountains
    //////////////
    let scm_u0 = 160;
    let scm_uRange = 85;
    if (u > scm_u0 && u < scm_u0 + scm_uRange) {
        if (v > 0) {
            displacement = Math.abs(1.5 + (Math.sin(v / 5) + Math.sin(u / 5)) + Math.random()) / 40;
        }
        if (u < scm_u0 + epsilon) {
            let diff = (u - scm_u0) / epsilon;
            displacement *= diff;
        }
        if (u > scm_u0 + scm_uRange - epsilon) {
            let diff = (scm_u0 + scm_uRange - u) / 10;
            displacement *= diff;
        }
    }
    // displacement = Math.abs(1.5 + (Math.sin(v / 5) + Math.sin(u / 5)) + Math.random()) / 40;

    ///////////////////
    // Islands
    //////////////
    let island_u0 = 20;
    let island_uf = 40;
    let island_v0 = 0;
    let island_vf  = 90;

    let island_uc = 30;
    let island_vc = 45;
    let mapX = u - island_uc;
    let mapY = v - island_vc;
    let r1 = 5;
    let r0 = 4;
    if (u > island_u0 && u < island_uf) {
        if (v > island_v0 && v < island_vf) {
            if ((mapX**2 + mapY**2) < r0**2) {
                displacement = .02 + (noiseValue / 40);
            }
            if ((mapX**2 + mapY**2) < r0**2) {
                displacement = .005 + (noiseValue / 80);
            }
        }
    }


    /////////////////////
    // DUNES
    ///////////////
    let u_0 = 270;
    let u_range = 90;
    let v_0 = 0;
    let v_range = 90;
    let u_periods = 20;
    let v_periods = 5;
    if (u > u_0 && u < u_0 + u_range) {
        if (v > v_0 && v < v_0 + v_range) {
            // const result = fBm(point, octaves, h, noise2D, u, v);
            let rf1 = Math.random();
            let rf2 = Math.random();
            let rf3 = Math.abs(Math.random());
            let rf4 = Math.abs(Math.random());
            let vTerm = Math.sin((v - v_0) * (2 * Math.PI / v_range) * v_periods + rf1) / (150 + 30 * rf3);
            let uTerm = Math.sin((u - u_0) * (2 * Math.PI / u_range) * u_periods + rf2) / (150 + 30 * rf4);
            displacement = .01 + (uTerm + vTerm);
        }
        let diff = Math.min(Math.abs(u_0 - u), Math.abs(u_0 + u_range - u), Math.abs(v_0 - v), Math.abs(v_0 + v_range - v));
        if (diff < epsilon) {
            diff = diff / epsilon;
            displacement *= diff**2;
            // displacement = ;
        }
        
    }
    // displacement = Math.abs(.5 + (Math.sin(v / 10) + Math.sin(u / 10)) + Math.random()) / 50;
    // if (u > 140 && u < 160) {
    //     if (v > 0 && v < 90) {
    //         displacement = Math.abs(1.5 + (Math.sin(v / 5) + Math.sin(u / 5)) + Math.random()) / 40;
    //     }
    // }
    
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
camera.position.z = 1.4;
// camera.position.x = -.5;
camera.position.y = -.1;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x = -.65;
    torus.rotation.y = -.1;
    torus.rotation.z += -.005;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
