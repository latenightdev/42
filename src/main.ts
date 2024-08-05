import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Module42 } from './42/42.module';

platformBrowserDynamic().bootstrapModule(Module42, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
