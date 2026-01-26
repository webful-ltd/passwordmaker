import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  /**
   * Signal holding the most recently shared text to use as the host field.
   * Components can watch this and react when it changes.
   */
  readonly sharedHost = signal<string | null>(null);

  /**
   * Set the shared host text. This will trigger any effects watching the signal.
   */
  setSharedHost(host: string) {
    this.sharedHost.set(host);
  }

  /**
   * Clear the shared host after it's been consumed.
   */
  clearSharedHost() {
    this.sharedHost.set(null);
  }
}
