import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';
import { DataStorageService } from './data-storage.service';
import { ErrorService } from './error.service';
import { WidgetUtilService } from './widget-util.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  newerMessage = new BehaviorSubject(null);
  notificationToken: any;

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private dataStorage: DataStorageService,
    private widgetService: WidgetUtilService,
    private errorService: ErrorService
    ) {
    }

  requestPermission(user: any) {
    this.angularFireMessaging.requestToken.subscribe(
      (token: any) => {
        this.notificationToken = token
        //console.log(token)
        if (!user.private.firePushToken || user.private.firePushToken !== token){
          user.private.firePushToken = token
          return this.dataStorage.updateUser(user);
        }
      },
      (err) => {
        this.errorService.logError(err, "Error subscribing to angular fire message", 'push notification', user.private.uid)
      }
    )
    return
  }

  getToken(){
    return this.notificationToken;
  }

  receiveMessage() {
    //console.log('receive message')
    this.angularFireMessaging.messages.subscribe(
      (payload: any) => {
        this.currentMessage.next(payload.notification);
        //console.log(payload)
        //console.log(payload.notification)
        return this.widgetService.presentToast(payload.notification);
      },
      (err) => {
        return this.errorService.logError(err, "Error receiving notification", 'receive push notification', 'unkown')
      }
    )
    
    //const messaging = getMessaging();
    //this.angularFireMessaging.onMessage.bind(messaging)
    //this.newerMessage.next(messaging);
    //console.log(messaging)
  }
}
