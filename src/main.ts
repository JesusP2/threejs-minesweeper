import "./style.css";
import {
  Font,
  FontLoader,
  GLTFLoader,
} from "three/examples/jsm/Addons.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import * as THREE from "three";
import gsap from "gsap";
import { createMap, printMap } from "./lib/map-generator";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const SIZE = 2;
const SPACING = 0.2;
const fontMaterials = [
  new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
  new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
];
let font = undefined as unknown as Font;
const fontLoader = new FontLoader();
fontLoader.load("JetBrainsMono NF_Bold.json", function (fnt) {
  font = fnt;
});
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

let blockActions = false;
dialogForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // const controls = new OrbitControls(camera, canvas);
  // controls.addEventListener("change", render);
  // controls.update();
  const formData = new FormData(e.currentTarget as any);

  const height = Number(formData.get("height"));
  const width = Number(formData.get("width"));
  const map = createMap(width, height);
  const currentPosition = { x: 0, z: 0 };
  // printMap(map)

  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      const newBox = createCellPlatform(SIZE, SPACING, [h, w]);
      scene.add(newBox);
      const cellValue = map[h][w].value
      if (cellValue >= 0) {
        createCellsText(cellValue, [h, w]);
      }
    }
  }
  dialog.close();

  document.addEventListener(
    "keyup",
    (event) => {
      if (
        !blockActions &&
        (event.key === "w" || event.key === "ArrowUp") &&
        pivot.position.x < (SIZE + SPACING) * (height - 1) - 0.1 // magic number, cba calculating the right value
      ) {
        currentPosition.x += 1;
        pivot.rotation.y = Math.PI;
        simulateJump(
          pivot,
          new THREE.Vector3(
            pivot.position.x + SIZE + SPACING,
            pivot.position.y,
            pivot.position.z,
          ),
        );
      } else if (
        !blockActions &&
        (event.key === "s" || event.key === "ArrowDown") &&
        pivot.position.x > 0
      ) {
        currentPosition.x -= 1;
        pivot.rotation.y = 0;
        simulateJump(
          pivot,
          new THREE.Vector3(
            pivot.position.x - (SIZE + SPACING),
            pivot.position.y,
            pivot.position.z,
          ),
        );
      } else if (
        !blockActions &&
        (event.key === "a" || event.key === "ArrowLeft") &&
        pivot.position.z > 0
      ) {
        currentPosition.z -= 1;
        pivot.rotation.y = (Math.PI * 3) / 2;
        simulateJump(
          pivot,
          new THREE.Vector3(
            pivot.position.x,
            pivot.position.y,
            pivot.position.z - (SIZE + SPACING),
          ),
        );
      } else if (
        !blockActions &&
        (event.key === "d" || event.key === "ArrowRight") &&
        pivot.position.z < (SIZE + SPACING) * (width - 1) - 0.1
      ) {
        currentPosition.z += 1;
        pivot.rotation.y = (Math.PI * 1) / 2;
        simulateJump(
          pivot,
          new THREE.Vector3(
            pivot.position.x,
            pivot.position.y,
            pivot.position.z + (SIZE + SPACING),
          ),
        );
      }
    },
    false,
  );
});

function createCellsText(num: number, position: [number, number]) {
  const geometry = new TextGeometry(num.toString(), {
    font: font,
    size: 1,
    depth: 0.01,
  });
  geometry.computeBoundingBox();
  const mesh = new THREE.Mesh(geometry, fontMaterials);
  mesh.rotation.x = (Math.PI * 3) / 2;
  mesh.rotation.z = -Math.PI / 2;
  mesh.position.y = 0.05;
  mesh.position.set(
    position[0] * (SIZE + SPACING) - 0.5,
    0.05,
    position[1] * (SIZE + SPACING) - 0.5,
  );
  scene.add(mesh);
}

function createCellPlatform(
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

function simulateJump(pivot: any, targetPosition: any) {
  blockActions = true;
  const startPosition = pivot.position.clone();
  const jumpHeight = 1; // Height of the jump
  const duration = 0.4; // Duration of the entire jump
  gsap.to(pivot.position, {
    duration: duration,
    x: targetPosition.x,
    z: targetPosition.z,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const parabolicHeight = jumpHeight * 4 * progress * (1 - progress);
      pivot.position.y = startPosition.y + parabolicHeight;
    },
    onComplete: () => {
      blockActions = false;
    },
  });
}
