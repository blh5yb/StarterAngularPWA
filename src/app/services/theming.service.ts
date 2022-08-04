import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  dark_theme = new BehaviorSubject(window.matchMedia("(prefers-color-scheme: dark)").matches);

  constructor(ref: ApplicationRef) { 
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', e => {
      this.dark_theme.next(e.matches ? true : false);
      ref.tick();
    })
    //console.log('match media')
    //window.matchMedia("(prefers-color-scheme: dark)").addListener(e => {
    //  const turnOn = e.matches;
    //  console.log(e)
    //  console.log(turnOn)
    //  this.dark_theme.next(turnOn ? true : false);
//
    //  // Trigger refresh of UI
    //  ref.tick();
    //});
  }
}
