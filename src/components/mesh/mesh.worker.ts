import { createMeshRenderer, type MeshController, type MeshInit } from "./renderer";

/** Runs the neural mesh off the main thread on an OffscreenCanvas. */
export type MeshMessage =
  | { type: "init"; canvas: OffscreenCanvas; init: MeshInit }
  | { type: "pointer"; x: number; y: number }
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "visible"; visible: boolean }
  | { type: "destroy" };

type WorkerScope = {
  onmessage: ((event: MessageEvent<MeshMessage>) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
};
const scope = self as unknown as WorkerScope;

let mesh: MeshController | null = null;

scope.onmessage = (event) => {
  const msg = event.data;
  switch (msg.type) {
    case "init":
      mesh = createMeshRenderer(msg.canvas, msg.init);
      scope.postMessage({ type: mesh ? "ready" : "fail" });
      break;
    case "pointer":
      mesh?.setPointer(msg.x, msg.y);
      break;
    case "resize":
      mesh?.resize(msg.width, msg.height, msg.dpr);
      break;
    case "visible":
      mesh?.setVisible(msg.visible);
      break;
    case "destroy":
      mesh?.destroy();
      mesh = null;
      scope.close();
      break;
  }
};
