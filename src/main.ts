import "./style.css";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { startGame } from "./lib/gameplay";

const SIZE = 2;
const SPACING = 0.2;
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

camera.position.set(-5.096, 16.26, 5.68);
camera.rotation.set(-1.57, -0.62, -1.57);
scene.add(camera);
//
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update();

const light = new THREE.AmbientLight(0xffffff, 1);
const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
scene.add(light);
light2.position.x = -5;
scene.add(light2);

const loader = new GLTFLoader();
loader.load("rabbit_blender.glb", (gltf) => {
  const model = gltf.scene;
  // center model
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);

  const rabbit = new THREE.Object3D();
  rabbit.add(model);

  scene.add(rabbit);
  rabbit.position.y = 0.7;
  loader.load("untitled.gltf", (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    const crystal = new THREE.Object3D()
    crystal.add(model)

    scene.add(crystal);
    startGame({ scene, SIZE, SPACING, rabbit, crystal, camera });
  });
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
document.body.appendChild(renderer.domElement);
const dialog = document.querySelector<HTMLDialogElement>("#settings-dialog");
dialog?.showModal();
