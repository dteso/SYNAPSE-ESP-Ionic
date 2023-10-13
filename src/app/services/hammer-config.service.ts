import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

// custom configuration Hammerjs
@Injectable()
export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    // I will only use the swap gesture so 
    // I will deactivate the others to avoid overlaps
    'pinch': { enable: false },
    'rotate': { enable: false }
  }
}