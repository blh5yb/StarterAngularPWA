import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  conn: boolean = false;

  constructor() { }


  checkOnline(conn){
    console.log(conn)
    this.conn = conn
    if (environment.connection[conn]){
      return [true, false]
    } else {
      return [false, true];
    }
  }


  createOnline$() {
    let type: any = 'onLine'
    if ((navigator as any).connection){
      type = (navigator as any).connection.effectiveType
    } else {
      type = 'onLine'
    }
    return merge<any>(
      fromEvent(window, 'offline').pipe(map(() => 'none')),
      fromEvent(window, 'online').pipe(map(() => type)),
      new Observable((sub: Observer<any>) => {
        sub.next(type);
        sub.complete();
      }));
  }
}
