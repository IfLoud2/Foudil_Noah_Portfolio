/// Web Worker : acquisition synthétique + DFT hors du thread principal.
import { acquire, type AcquireRequest } from './dsp.ts';

interface WorkerScope {
  postMessage(message: unknown, transfer: Transferable[]): void;
  onmessage: ((event: MessageEvent<AcquireRequest>) => void) | null;
}

const scope = self as unknown as WorkerScope;

scope.onmessage = (event) => {
  const result = acquire(event.data);
  scope.postMessage(result, [result.v.buffer, result.i.buffer, result.spectrum.buffer]);
};
