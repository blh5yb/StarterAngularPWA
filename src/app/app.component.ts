import { ApplicationRef, Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserProfile } from './models/user-profile.model';
import { AuthService } from './services/auth.service';
import { ConnectivityService } from './services/connectivity.service';
import { HelperService } from './services/helper.service';
import { MessagingService } from './services/messaging.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  public appPages = [
    { title: 'About', url: '/about', icon: 'information-circle' },
    { title: 'Terms Of Use', url: '/terms', icon: 'document-text' },
    { title: 'Privacy Policy', url: '/policy', icon: 'document-lock' }
  ];
  userPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'My Info', url: '/my-info', icon: 'person-circle'}
  ]
  public labels = [
    { title: 'Delete Account', icon: 'trash' }
  ];
  conn: boolean = false;
  connStatus: string;
  message: BehaviorSubject<string>;
  promptEvent: any;
  isAuthenticated: boolean = false;
  profile: UserProfile

  constructor(
    private swUpdate: SwUpdate,
    private authService: AuthService,
    private helperService: HelperService,
    private messagingService: MessagingService,
    private afMessaging: AngularFireMessaging,
    public router: Router,
    private functions: AngularFireFunctions,
    private userService: UserService,
    private connectivityService: ConnectivityService,
    private ref: ApplicationRef,
    ) {
      functions.useEmulator("localhost", 5001)
      this.connectivityService.createOnline$().subscribe((conn) => {
        this.conn = this.connectivityService.checkOnline(conn)[1]
        if (!this.conn) {
          this.helperService.presentToast(environment.connection[conn] + ': cannot refresh page')
        }
        this.ref.tick();
      })
    }

  ngOnInit(){
    this.afMessaging.messages.subscribe((message) => {
      if(message) {
        this.message = this.messagingService.currentMessage;
        let notification = message.notification.title + '\n' + message.notification.body
        this.helperService.presentToast(notification)
      }
    })
    this.checkUpdate();
    this.checkInstall();

    if(this.conn) {
      this.authService.autoLogin();
    }
    this.authService.isLoggedIn.subscribe((res) => {
      this.isAuthenticated = res;
      if (res) {this.profile = this.userService.getProfile()}
    })
    this.userService.profileChanged.subscribe((profile) => {
      this.profile = profile;
    })
  }

  async logout(){
    await this.authService.logOut();
  }

  checkUpdate(){
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
          if(confirm("New version available. Load New Version?")) {
            window.location.reload();
          }
      });
    }
  }

  checkInstall(){
    let deferredPrompt: any; 

    window.addEventListener('beforeinstallprompt', event => {
      deferredPrompt = event;
      this.promptEvent = event;
    });
  }

  installPwa(): void {
    this.promptEvent.prompt();
  }
}
