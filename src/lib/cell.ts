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
  targetPosition: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
) {
  BLOCK_ACTIONS = true;
  const startPosition = rabbit.position.clone();
  const jumpHeight = 1;
  const duration = 0.4;
  const yo = rabbit.position.y
  gsap.to(rabbit.position, {
    duration: duration,
    x: targetPosition.x,
    z: targetPosition.z,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const parabolicHeight = jumpHeight * 4 * progress * (1 - progress);
      rabbit.position.y = startPosition.y + parabolicHeight;
      centerCamera(camera, rabbit, yo);
    },
    onComplete: () => {
      BLOCK_ACTIONS = false;
    },
  });
}

export function centerCamera(camera: THREE.PerspectiveCamera, rabbit: THREE.Object3D, yo) {
  const box = new THREE.Box3().setFromObject(rabbit);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const size = new THREE.Vector3();
  box.getSize(size);
  // // Calculate the distance from the camera to the center of the object
  // const maxDim = Math.max(size.x, size.y, size.z);
  // const fov = camera.fov * (Math.PI / 180);
  // let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  //
  // // Multiply by a factor to give some space around the object
  // cameraZ *= 1.5;
  //
  // // Set the camera position and make it look at the center of the object
  camera.position.set(center.x - 10, yo + 10, center.z);
  // camera.position.y += 3;
  // camera.lookAt(center);
  camera.updateProjectionMatrix();
}
