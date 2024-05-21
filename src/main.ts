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
camera.zoom = 0.1;
scene.add(camera);

// controls for movement

const light = new THREE.AmbientLight(0xffffff, 1);
const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
scene.add(light);
light2.position.x = -5;
scene.add(light2);

let pivot: any;
const loader = new GLTFLoader();
loader.load("rabbit_blender.glb", (gltf) => {
  const model = gltf.scene;
  // center model
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);

  // create pivot
  pivot = new THREE.Object3D();
  // pivot.position.copy();
  pivot.add(model);

  scene.add(pivot);
  pivot.position.y = 0.7;
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
  const formData = new FormData(e.currentTarget as any);

  const height = Number(formData.get("height"));
  const width = Number(formData.get("width"));

  const size = 2;
  const spacing = 0.2;
  // rabbitScene.position.x = -0.1;
  // rabbitScene.position.z = -0.5;
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      const newBox = createBoxPlatform(size, spacing, [h, w]);
      scene.add(newBox);
    }
  }
  dialog.close();

  document.addEventListener(
    "keyup",
    (event) => {
      if (
        (event.key === "w" || event.key === "ArrowUp") &&
        pivot.position.x < (size + spacing) * (height - 1) - 0.1 // magic number, cba calculating the right value
      ) {
        pivot.position.x += size + spacing;
        pivot.rotation.y = Math.PI;
      } else if (
        (event.key === "s" || event.key === "ArrowDown") &&
        pivot.position.x > 0
      ) {
        pivot.position.x -= size + spacing;
        pivot.rotation.y = 0;
      } else if (
        (event.key === "a" || event.key === "ArrowLeft") &&
        pivot.position.z > 0
      ) {
        pivot.position.z -= size + spacing;
        pivot.rotation.y = (Math.PI * 3) / 2;
      } else if (
        (event.key === "d" || event.key === "ArrowRight") &&
        pivot.position.z < (size + spacing) * (width - 1) - 0.1
      ) {
        pivot.position.z += size + spacing;
        pivot.rotation.y = (Math.PI * 1) / 2;
      }
    },
    false,
  );
});

function createBoxPlatform(
  size: number,
  spacing: number,
  pos: [number, number],
) {
  const geometry = new THREE.BoxGeometry(size, 0.1, size);
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos[0] * (size + spacing), 0, pos[1] * (size + spacing));
  return mesh;
}
