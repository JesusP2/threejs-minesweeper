import gsap from "gsap";
import * as THREE from "three";
import {
  type Font,
  FontLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";
import { MinesweeperMap } from "./map-generator";

export const SIZE = 2;
export const SPACING = 0.2;
export let BLOCK_ACTIONS = false;
const fontMaterials = [
  new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
  new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
];

let font = undefined as unknown as Font;
const fontLoader = new FontLoader();
fontLoader.load("JetBrainsMono NF_Bold.json", function (fnt) {
  font = fnt;
});

export function createCellsText(num: number, position: [number, number]) {
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
  return mesh;
}

const availableColors = ["#7760fb", "#303250", "#f05bb5"];
export function createCellPlatform(
  size: number,
  spacing: number,
  pos: [number, number],
) {
  const rand = Math.random();
  const colorIdx = rand < 0.8 ? 0 : rand < 0.9 ? 1 : 2;
  const geometry = new THREE.BoxGeometry(size, 0.1, size);
  const material = new THREE.MeshPhongMaterial({
    color: availableColors[colorIdx],
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos[0] * (size + spacing), 0, pos[1] * (size + spacing));
  return mesh;
}

export function jump(
  rabbit: THREE.Object3D,
  axis: "z" | "x" | "-z" | "-x",
  camera: THREE.PerspectiveCamera,
  cells: THREE.Mesh[][],
  map: MinesweeperMap,
  fall: boolean,
) {
  BLOCK_ACTIONS = true;
  const targetPosition = new THREE.Vector3(
    rabbit.position.x,
    rabbit.position.y,
    rabbit.position.z,
  );
  if (axis.startsWith("-")) {
    const _axis = axis[1] as "z" | "x";
    targetPosition[_axis] -= SIZE + SPACING;
  } else {
    targetPosition[axis as "z" | "x"] += SIZE + SPACING;
  }
  const startPosition = rabbit.position.clone();
  const jumpHeight = 1;
  const duration = 0.4;
  const baseHeight = rabbit.position.y;
  gsap.to(rabbit.position, {
    duration: duration,
    x: targetPosition.x,
    z: targetPosition.z,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const parabolicHeight = jumpHeight * 4 * progress * (1 - progress);
      rabbit.position.y = startPosition.y + parabolicHeight;
      centerCamera(camera, rabbit, baseHeight);
    },
    onComplete: () => {
      if (fall) {
        const dialog =
          document.querySelector<HTMLDialogElement>("#deadge-dialog");
        dialog?.showModal();
        gsap.to(rabbit.position, {
          duration: duration,
          y: -10,
          ease: "power2.out",
        });
        for (let h = 0; h < cells.length; h++) {
          for (let w = 0; w < cells[0].length; w++) {
            if (map[h][w].value === -1) {
              gsap.to(cells[h][w].position, {
                duration: duration,
                y: -10,
                ease: "power2.out",
              });
            }
          }
        }
      } else {
        BLOCK_ACTIONS = false;
      }
    },
  });
}

export function centerCamera(
  camera: THREE.PerspectiveCamera,
  rabbit: THREE.Object3D,
  basePosition: number,
) {
  const box = new THREE.Box3().setFromObject(rabbit);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const size = new THREE.Vector3();
  box.getSize(size);
  const vec = [10, 15, 0];
  if (isMobile()) {
    vec[1] = 30;
    vec[0] = 30;
    vec[2] = 5;
  }
  camera.position.set(
    center.x - vec[0],
    basePosition + vec[1],
    center.z + vec[2],
  );
  // camera.position.y += 3;
  // camera.lookAt(center);
  camera.updateProjectionMatrix();
}

export function revealCellNumber(
  currentPosition: { x: number; z: number },
  map: MinesweeperMap,
  scene: THREE.Scene,
) {
  const cell = map[currentPosition.x][currentPosition.z];
  if (cell.value >= 0 && !cell.visible) {
    const mesh = createCellsText(cell.value, [
      currentPosition.x,
      currentPosition.z,
    ]);
    scene.add(mesh);
  }
}

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

if (isMobile()) {
  console.log("Mobile device detected");
} else {
  console.log("Desktop device detected");
}
