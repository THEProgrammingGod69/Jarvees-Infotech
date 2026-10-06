import { createCoreRenderer, type CoreController, type CoreInit, type CoreState } from "./renderer";

/**
 * The Neural Core's worker. It owns the OffscreenCanvas and the whole
 * render loop, so particle work never competes with scrolling, input or
 * React on the main thread.
 */
export type CoreMessage =
  | { type: "init"; canvas: OffscreenCanvas; init: CoreInit }
  | { type: "state"; state: CoreState }
  | { type: "pointer"; x: number; y: number }
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "visible"; visible: boolean }
  | { type: "destroy" };

// The project compiles against the DOM lib; describe just the worker scope
// this file uses rather than pulling in the conflicting webworker lib.
type WorkerScope = {
  onmessage: ((event: MessageEvent<CoreMessage>) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
};
const scope = self as unknown as WorkerScope;

let core: CoreController | null = null;

scope.onmessage = (event) => {
  const msg = event.data;
  switch (msg.type) {
    case "init":
      core = createCoreRenderer(msg.canvas, msg.init, () => scope.postMessage({ type: "ready" }));
      if (!core) scope.postMessage({ type: "fail" });
      break;
    case "state":
      core?.setState(msg.state);
      break;
    case "pointer":
      core?.setPointer(msg.x, msg.y);
      break;
    case "resize":
      core?.resize(msg.width, msg.height, msg.dpr);
      break;
    case "visible":
      core?.setVisible(msg.visible);
      break;
    case "destroy":
      core?.destroy();
      core = null;
      scope.close();
      break;
  }
};
