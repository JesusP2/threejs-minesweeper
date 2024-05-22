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
        jump(rabbit, "x", camera, currentPosition, map, scene);
      }
    });

    const arrowDownButton =
      document.querySelector<HTMLButtonElement>(".arrow-down")!;
    arrowDownButton.addEventListener("click", () => {
      if (!BLOCK_ACTIONS && rabbit.position.x > 0) {
        currentPosition.x -= 1;
        rabbit.rotation.y = 0;
        jump(rabbit, "-x", camera, currentPosition, map, scene);
      }
    });

    const arrowLeftButton =
      document.querySelector<HTMLButtonElement>(".arrow-left")!;
    arrowLeftButton.addEventListener("click", () => {
      if (!BLOCK_ACTIONS && rabbit.position.z > 0) {
        currentPosition.z -= 1;
        rabbit.rotation.y = (Math.PI * 3) / 2;
        jump(rabbit, "-z", camera, currentPosition, map, scene);
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
        jump(rabbit, "z", camera, currentPosition, map, scene);
      }
    });

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
          jump(rabbit, "x", camera, currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "s" || event.key === "ArrowDown") &&
          rabbit.position.x > 0
        ) {
          currentPosition.x -= 1;
          rabbit.rotation.y = 0;
          jump(rabbit, "-x", camera, currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "a" || event.key === "ArrowLeft") &&
          rabbit.position.z > 0
        ) {
          currentPosition.z -= 1;
          rabbit.rotation.y = (Math.PI * 3) / 2;
          jump(rabbit, "-z", camera, currentPosition, map, scene);
        } else if (
          !BLOCK_ACTIONS &&
          (event.key === "d" || event.key === "ArrowRight") &&
          rabbit.position.z < (SIZE + SPACING) * (width - 1) - 0.1
        ) {
          currentPosition.z += 1;
          rabbit.rotation.y = Math.PI / 2;
          jump(rabbit, "z", camera, currentPosition, map, scene);
        }
      },
      false,
    );
  });
}
