import {
  BLOCK_ACTIONS,
  centerCamera,
  createCellPlatform,
  createCellsText,
  jump,
} from "./cell";
import { createMap } from "./map-generator";
import * as THREE from "three";

export function startGame({
  scene,
  SIZE,
  SPACING,
  rabbit,
  camera,
}: {
  scene: THREE.Scene;
  SIZE: number;
  SPACING: number;
  rabbit: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
}) {
  const dialog = document.querySelector<HTMLDialogElement>("#settings-dialog")!;
  const dialogForm = document.querySelector<HTMLFormElement>("#dialog-form")!;

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

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const newBox = createCellPlatform(SIZE, SPACING, [h, w]);
        scene.add(newBox);
      }
    }
    dialog.close();

    const mesh = createCellsText(
      map[currentPosition.x][currentPosition.z].value,
      [currentPosition.x, currentPosition.z],
    );
    scene.add(mesh);

    centerCamera(camera, rabbit, rabbit.position.y)
    document.addEventListener(
      "keyup",
      (event) => {
        if (
          !BLOCK_ACTIONS &&
          (event.key === "w" || event.key === "ArrowUp") &&
          rabbit.position.x < (SIZE + SPACING) * (height - 1) - 0.1 // magic number, cba calculating the right value
        ) {
          currentPosition.x += 1;
          rabbit.rotation.y = Math.PI;
          jump(
            rabbit,
            new THREE.Vector3(
              rabbit.position.x + SIZE + SPACING,
              rabbit.position.y,
              rabbit.position.z,
            ),
            camera,
          );
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "s" || event.key === "ArrowDown") &&
          rabbit.position.x > 0
        ) {
          currentPosition.x -= 1;
          rabbit.rotation.y = 0;
          jump(
            rabbit,
            new THREE.Vector3(
              rabbit.position.x - (SIZE + SPACING),
              rabbit.position.y,
              rabbit.position.z,
            ),
            camera,
          );
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "a" || event.key === "ArrowLeft") &&
          rabbit.position.z > 0
        ) {
          currentPosition.z -= 1;
          rabbit.rotation.y = (Math.PI * 3) / 2;
          jump(
            rabbit,
            new THREE.Vector3(
              rabbit.position.x,
              rabbit.position.y,
              rabbit.position.z - (SIZE + SPACING),
            ),
            camera,
          );
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "d" || event.key === "ArrowRight") &&
          rabbit.position.z < (SIZE + SPACING) * (width - 1) - 0.1
        ) {
          currentPosition.z += 1;
          rabbit.rotation.y = (Math.PI * 1) / 2;
          jump(
            rabbit,
            new THREE.Vector3(
              rabbit.position.x,
              rabbit.position.y,
              rabbit.position.z + (SIZE + SPACING),
            ),
            camera,
          );
        }

        const cell = map[currentPosition.x][currentPosition.z];
        if (cell.value >= 0 && !cell.visible) {
          const mesh = createCellsText(cell.value, [
            currentPosition.x,
            currentPosition.z,
          ]);
          scene.add(mesh);
        } else if (cell.value === -1) {
          console.log("Dentge");
        }
      },
      false,
    );
  });
}
