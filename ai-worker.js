// Runs the on-device language model (WebLLM, Apache-2.0) off the main thread so the app stays responsive.
import { WebWorkerMLCEngineHandler } from "./webllm.js";
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = msg => handler.onmessage(msg);
