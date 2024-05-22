import gsap from "gsap";
import * as THREE from "three";
import {
  type Font,
  FontLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

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

export function createCellPlatform(
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

export function jump(rabbit: THREE.Object3D, targetPosition: any) {
  BLOCK_ACTIONS = true;
  const startPosition = rabbit.position.clone();
  const jumpHeight = 1;
  const duration = 0.4;
  gsap.to(rabbit.position, {
    duration: duration,
    x: targetPosition.x,
    z: targetPosition.z,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const parabolicHeight = jumpHeight * 4 * progress * (1 - progress);
      rabbit.position.y = startPosition.y + parabolicHeight;
    },
    onComplete: () => {
      BLOCK_ACTIONS = false;
    },
  });
}
