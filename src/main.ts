import "./style.css";
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
camera.position.z = 10;
camera.zoom = 0.1
scene.add(camera);

// controls for movement

const light = new THREE.AmbientLight(0xffffff, 1);
const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
scene.add(light);
light2.position.x = -5;
scene.add(light2);

// idk
const loader = new GLTFLoader();
loader.load("rabbit_blender.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.position.y = 0.95;
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

const dialog = document.querySelector<HTMLDialogElement>("#settings-dialog")!;

const dialogForm = document.querySelector<HTMLFormElement>("#dialog-form")!;
dialogForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const controls = new OrbitControls(camera, canvas);
  controls.addEventListener("change", render);
  controls.update();
  const formData = new FormData(e.currentTarget as any)

  const height = Number(formData.get('height'))
  const width = Number(formData.get('width'))


  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      const newBox = createBoxPlatform(2, 0.2, [h, w])
      scene.add(newBox)
    }
  }
  dialog.close();
});

function createBoxPlatform(size: number, spacing: number, pos: [number, number]) {
  const geometry = new THREE.BoxGeometry(size, 0.1, size)
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(pos[0] * (size + spacing), 0, pos[1] * (size + spacing))
  return mesh
}
