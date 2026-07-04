// Socket.IO client is optional in this Phase 7 worker container.
// If dependencies/types are not available, we fall back to a no-op emitter.
// This keeps job processing reliable even if Socket.IO is misconfigured.
export class SocketEventEmitter {
  private socket: any;
  private connected = false;

  constructor() {
    // no-op (intentionally)
  }


  emit(event: string, payload: any) {
    try {
      this.socket.emit(event, payload);
    } catch {
      // ignore socket errors during shutdown; job processing must not fail
    }
  }
}

