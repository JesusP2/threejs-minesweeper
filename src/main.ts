import "./style.css";
// import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
//
// function main() {
//   const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
//   canvas.width = canvas.width * 5
//   canvas.height = canvas.height * 5
//   const renderer = new THREE.WebGLRenderer({ canvas });
//
//   const fov = 45;
//   const aspect = 2; // the canvas default
//   const near = 0.1;
//   const far = 100;
//   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//   camera.position.set(0, 10, 20);
//
//   const controls = new OrbitControls(camera, canvas);
//   controls.target.set(0, 5, 0);
//   controls.update();
//
//   const scene = new THREE.Scene();
//
//   const floorGeometry = new THREE.BoxGeometry(10, 0.5, 10)
//   const floorMaterial = new THREE.MeshPhongMaterial({ color: "#CA8" });
//   const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
//   floorMesh.position.y = -0.5
//   scene.add(floorMesh)
//
//   const cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
//   const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
//   const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
//   cubeMesh.position.set(0, 1, 0)
//   scene.add(cubeMesh)
//
//   {
//     const color = 0xffffff;
//     const intensity = 1;
//     const light = new THREE.DirectionalLight(color, intensity);
//     light.position.set(0, 10, 0);
//     light.target.position.set(-5, 0, 0);
//     scene.add(light);
//     scene.add(light.target);
//
//     const gui = new GUI();
//     gui.add(light, "intensity", 0, 5, 0.01);
//     gui.add(light.target.position, "x", -10, 10, 0.01);
//     gui.add(light.target.position, "z", -10, 10, 0.01);
//     gui.add(light.target.position, "y", 0, 10, 0.01);
//   }
//
//   function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//
//     return needResize;
//   }
//
//   function render() {
//     if (resizeRendererToDisplaySize(renderer)) {
//       const canvas = renderer.domElement;
//       camera.aspect = canvas.clientWidth / canvas.clientHeight;
//       camera.updateProjectionMatrix();
//     }
//
//     renderer.render(scene, camera);
//
//     requestAnimationFrame(render);
//   }
//
//   requestAnimationFrame(render);
// }
//
// main();
//
//
//
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x999999);

// renderer
const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.y = 10;
scene.add(camera);

// controls for movement
const controls = new OrbitControls(camera, canvas);
controls.addEventListener("change", render);
controls.update();

const light = new THREE.AmbientLight(0xffffff, 0.5);
const light2 = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light);
light2.position.x = -5
scene.add(light2);

// cool cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x333300 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 2;
scene.add(cube);

// cool cube
const floorGeometry = new THREE.BoxGeometry(11, 0.1, 11);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.x = 0;
floor.position.z = 0;
floor.position.y = 0.5;
scene.add(floor);

// idk
const loader = new GLTFLoader();
loader.load("rabbit_blender.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.position.y = 1.4
});

// plane
const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
scene.add(grid);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

document.body.appendChild(renderer.domElement);
