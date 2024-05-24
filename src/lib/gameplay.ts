import {
  BLOCK_ACTIONS,
  centerCamera,
  createCellPlatform,
  createCellsText,
  jump,
  revealCellNumber,
} from "./cell";
import { createMap, printMap } from "./map-generator";
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
    const mines = Number(formData.get('mines'))
    const map = createMap(width, height, mines);
    const currentPosition = { x: 0, z: 0 };

    const cells: THREE.Mesh[][] = [];
    for (let h = 0; h < height; h++) {
      cells.push([]);
      for (let w = 0; w < width; w++) {
        const newBox = createCellPlatform(SIZE, SPACING, [h, w]);
        cells[h].push(newBox);
        scene.add(newBox);
      }
    }
    dialog.close();

    const mesh = createCellsText(
      map[currentPosition.x][currentPosition.z].value,
      [currentPosition.x, currentPosition.z],
    );
    scene.add(mesh);

    centerCamera(camera, rabbit, rabbit.position.y);

    const arrowUpButton =
      document.querySelector<HTMLButtonElement>(".arrow-up")!;
    arrowUpButton.addEventListener("click", () => {
      if (
        !BLOCK_ACTIONS &&
        rabbit.position.x < (SIZE + SPACING) * (height - 1) - 0.1
      ) {
        currentPosition.x += 1;
        rabbit.rotation.y = Math.PI;
        jump(
          rabbit,
          "x",
          camera,
          cells,
          map,
          map[currentPosition.x][currentPosition.z].value === -1,
        );
        revealCellNumber(currentPosition, map, scene);
      }
    });

    const arrowDownButton =
      document.querySelector<HTMLButtonElement>(".arrow-down")!;
    arrowDownButton.addEventListener("click", () => {
      if (!BLOCK_ACTIONS && rabbit.position.x > 0) {
        currentPosition.x -= 1;
        rabbit.rotation.y = 0;
        jump(
          rabbit,
          "-x",
          camera,
          cells,
          map,
          map[currentPosition.x][currentPosition.z].value === -1,
        );
        revealCellNumber(currentPosition, map, scene);
      }
    });

    const arrowLeftButton =
      document.querySelector<HTMLButtonElement>(".arrow-left")!;
    arrowLeftButton.addEventListener("click", () => {
      if (!BLOCK_ACTIONS && rabbit.position.z > 0) {
        currentPosition.z -= 1;
        rabbit.rotation.y = (Math.PI * 3) / 2;
        jump(
          rabbit,
          "-z",
          camera,
          cells,
          map,
          map[currentPosition.x][currentPosition.z].value === -1,
        );
        revealCellNumber(currentPosition, map, scene);
      }
    });

    const arrowRightButton =
      document.querySelector<HTMLButtonElement>(".arrow-right")!;
    arrowRightButton.addEventListener("click", () => {
      if (
        !BLOCK_ACTIONS &&
        rabbit.position.z < (SIZE + SPACING) * (width - 1) - 0.1
      ) {
        currentPosition.z += 1;
        rabbit.rotation.y = Math.PI / 2;
        jump(
          rabbit,
          "z",
          camera,
          cells,
          map,
          map[currentPosition.x][currentPosition.z].value === -1,
        );
        revealCellNumber(currentPosition, map, scene);
      }
    });

    document.addEventListener(
      "keyup",
      (event) => {
        if (
          !BLOCK_ACTIONS &&
          (event.key === "w" || event.key === "ArrowUp" || event.key === "k") &&
          rabbit.position.x < (SIZE + SPACING) * (height - 1) - 0.1 // magic number, cba calculating the right value
        ) {
          currentPosition.x += 1;
          rabbit.rotation.y = Math.PI;
          jump(
            rabbit,
            "x",
            camera,
            cells,
            map,
            map[currentPosition.x][currentPosition.z].value === -1,
          );
          revealCellNumber(currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "s" ||
            event.key === "ArrowDown" ||
            event.key === "j") &&
          rabbit.position.x > 0
        ) {
          currentPosition.x -= 1;
          rabbit.rotation.y = 0;
          jump(
            rabbit,
            "-x",
            camera,
            cells,
            map,
            map[currentPosition.x][currentPosition.z].value === -1,
          );
          revealCellNumber(currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "a" ||
            event.key === "ArrowLeft" ||
            event.key === "h") &&
          rabbit.position.z > 0
        ) {
          currentPosition.z -= 1;
          rabbit.rotation.y = (Math.PI * 3) / 2;
          jump(
            rabbit,
            "-z",
            camera,
            cells,
            map,
            map[currentPosition.x][currentPosition.z].value === -1,
          );
          revealCellNumber(currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "d" ||
            event.key === "ArrowRight" ||
            event.key === "l") &&
          rabbit.position.z < (SIZE + SPACING) * (width - 1) - 0.1
        ) {
          currentPosition.z += 1;
          rabbit.rotation.y = Math.PI / 2;
          jump(
            rabbit,
            "z",
            camera,
            cells,
            map,
            map[currentPosition.x][currentPosition.z].value === -1,
          );
          revealCellNumber(currentPosition, map, scene);
        }
      },
      false,
    );
  });
}
