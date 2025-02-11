import { RouteReuseStrategy } from '@angular/router';

// Custom route reuse strategy
export class NoReuseStrategy implements RouteReuseStrategy {
  shouldDetach(): boolean {
    return false;
  }
  store(): void {}
  shouldAttach(): boolean {
    return false;
  }
  retrieve(): null {
    return null;
  }
  shouldReuseRoute(): boolean {
    return false;
  }
}
