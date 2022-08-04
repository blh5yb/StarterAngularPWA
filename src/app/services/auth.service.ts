import { ApplicationRef, Injectable} from '@angular/core';
import { BehaviorSubject, Subject} from 'rxjs';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { GoogleAuthProvider, getAuth, signInAnonymously } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

import { UserProfile } from '../models/user-profile.model';
import { DataStorageService } from '../services/data-storage.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../services/error.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  profileChanged = new Subject<UserProfile>(); //inform app of when user changes - behavior give subscriber immediate access to previous value
  //private tokenExpirationTimer: any;
  userState: any;
  profile: UserProfile;
  loggedIn = new BehaviorSubject<boolean>(false);
  isLoading: boolean = false;
  tokenExpirationTimer: any;
  company: string = environment.company;

  constructor(
    private router: Router,
    private dataStorage: DataStorageService,
    private functions: AngularFireFunctions,
    private afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    private userService: UserService,
    private googlePlus: GooglePlus,
    private ref: ApplicationRef,
    private errorService: ErrorService,
    ) { }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  async SignUp(authInfo: any) {
    return await this.afAuth.createUserWithEmailAndPassword(authInfo.email, authInfo.pass)  
    .then(async (result) => {
        if (result.user) {
          const update_arrays = this.updateArrays('emails', authInfo.email)
          const profile = this.SetUserData(result.user)
          const verification = this.SendVerificationMail();
          let promises = await Promise.all([update_arrays, profile, verification])
          this.profile = promises[1];
          return
        }
      }).catch(async(error) => {
        let errorMessage = 'AN UNKNOWN ERROR OCCURRED';
        if (error.code) {
          //this.router.navigate(['/auth/email-verification']);
          if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use'){
            errorMessage = "Email Exists: An account already exists with that email. If You already signed up, please hit the back arrow to go to the login page"
          }
          this.isLoading = false;
        //window.alert(error);
        return await this.errorService.logError(error.code, errorMessage, 'sign up', authInfo.email)
      } else {
        if (error.error) {
          return await this.errorService.logError(error.error, errorMessage, 'sign up', authInfo.email)
        } else {
          return await this.errorService.logError(error, errorMessage, 'sign up', authInfo.email)
        }
      }
    })
  }  

  async anonomousSignIn(){
    const auth = getAuth();
    return await signInAnonymously(auth).then(async(res) => {
      const profile = await this.SetUserData(res.user)
      let user_auth = await res.user.getIdTokenResult()
      profile.expiration_date = new Date(user_auth.expirationTime)
      this.nextUser(profile);
      this.userService.setAnonymousProfile(profile);
      if (this.router.url == '/auth/signin') {
        return this.router.navigate(['/home'])
      }
      return
    }).catch(async(error) => {
      return await this.errorService.logError(error.code, "An Unknown Error Occurred", 'anonymous sign in', 'anonymous')
      //window.alert("An error occured")
    })
  }
  
  async SendVerificationMail() {
    return await this.afAuth.currentUser.then(async(u) => {
      return await u.sendEmailVerification().then(() => {
        this.router.navigate(['/register/email-verification'], {queryParams: {email: u.email}})
      }).catch(async(error: any) => {
        let errorMessage = 'AN UNKNOWN ERROR OCCURRED';
        if (error.code) { 
          if (error.code == 'auth/too-many-requests'){
            errorMessage = `EMAIL NOT VERIFIED: Check your email for the subject 'Verify your email for ${environment.company}' and click the link to verify your email to continue`
            this.router.navigate(['/register/email-verification'], {queryParams: {email: u.email}}).then(async() => {
              return await this.errorService.logError(error.code, errorMessage, 'auth email', u.uid)
            })
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          return await this.errorService.logError(error, errorMessage, 'auth email', u.uid)
        }
      })
    })
    .catch(async(error) => {
      let errorMessage = 'AN UNKNOWN ERROR OCCURRED';
      if (error.code) {
        this.isLoading = false;
        return await this.errorService.logError(error.code, errorMessage, 'auth email', 'unknown')
      } else {
        return await this.errorService.logError(error, errorMessage, 'auth email', 'unknown')
      }
    })
  }

  async ForgotPassword(passwordResetEmail: string) {
    return await this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.')
    }).catch(async(error: any) => {
      let message: string = "An Unknown Error Occurred";
      if (error.code && error.code == 'auth/user-not-found'){
        message = "There is no user with that email address"
        return await this.errorService.logError(error.code, message, 'forgot password', passwordResetEmail)
      }
      return await this.errorService.logError(error, message, 'forgot password', passwordResetEmail)
    });
  }

  async signIn(email: string, password: string) {
    this.isLoading = true;
    return await this.afAuth.signInWithEmailAndPassword(email, password)
      .then(async(result) => {
        if (result.user.emailVerified){
          return await this.setProfile(result.user)
        } else {
          this.router.navigate(['/register/email-verification'], {queryParams: {email: email}}).then(() => {
            let errorMessage = `EMAIL NOT VERIFIED: Check your email for the subject 'Verify your email for ${this.company}' and click the link to verify your email to continue`         
            this.errorService.logError('Email Not Verified', errorMessage, 'sign in', email)
          })
        }
      }).catch(async(error: any) => {
        let errorMessage = 'An unknown error occurred';
        if (error.code) {
          if (error.code == 'auth/user-not-found'){
            errorMessage = 'INVALID LOGIN: Check that your email and password are correct'
            if (email.includes('@gmail.com')){
              errorMessage += "; If you signed up with google, click the 'LOG IN WITH GOOGLE' button to continue"
            }
          } else if (error.code == 'auth/wrong-password'){
            errorMessage = "INVALID PASSWORD: You can click 'Forgot Password?' below to reset your password"
          } else if (error.code == 'auth/user-not-found') {
            errorMessage = "USER NOT FOUND: There is no existing user record corresponding to the provided identifier."
          } 
          return await this.errorService.logError(error.code, errorMessage, 'sign in', email)
        }
        return await this.errorService.logError(error, errorMessage, 'sign in ', email)
    });
  }

  async GoogleAuthWeb() {
    return await this.afAuth.signInWithPopup(new GoogleAuthProvider()).then(async (res: any) => {
      return await this.AuthLogin(res);
      //return Object.keys(res)
    }).catch(async(err: any) => {
      let errorMessage = 'AN UNKNOWN ERROR OCCURRED'
      if (err && err.code && err.name == 'FirebaseError'){
        if (err.code == 'auth/popup-closed-by-user'){
          errorMessage = 'AUTH POPUP CLOSED PREMATURELY'
        }
        return await this.errorService.logError(err.code, errorMessage, 'google auth web', 'unknown')
      }
      return await this.errorService.logError(err, errorMessage, 'google auth web', 'unknown')
    })
  }

  async nativeGoogleLogin(){
    const result = await this.googlePlus.login({
      webClientId: '', // get this for native
      offline: true,
      scope: 'profile email'
    });
    return await this.afAuth.signInAndRetrieveDataWithCredential(GoogleAuthProvider.credential(result.idToken)).then( async (res: any) => {
      return await this.AuthLogin(result)
    }).catch(async(error: any)=> {
      let errorMessage = "AN UNKNOWN ERROR OCCURRED";
      if (error.code && error.name == 'FirebaseError'){
        return await this.errorService.logError(error.code, errorMessage, 'google auth web', 'unknown')
      }
      return await this.errorService.logError(error, errorMessage, 'google auth web', 'unknown')
    })
  }

  async AuthLogin(result: any) {
    // this.SetUserData(result.user)
    let exists = await this.updateArrays('emails', result.user.email)
    console.log(exists);
    if (exists) {
      return await this.setProfile(result.user);
    } else {
      let profile: any = await this.dataStorage.fetchUser(result.user.uid)
      if (profile) {
        this.profile = profile
      } else {
        this.profile = await this.SetUserData(result.user)
      }
      this.nextUser(this.profile)
    }
  }

  async autoLogin() {
    this.afAuth.authState.subscribe(async(user) => {
      if (user && user.uid && !user.isAnonymous && user.emailVerified) {
        await this.setProfile(user);
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user && user.anonymous) {
          user.private.expiration_date = new Date(user.private.expiration_date)
          await this.userService.setAnonymousProfile(user)
          const expires_in = new Date(user.private.expiration_date).getTime() - new Date().getTime();
          await this.autoLogout(expires_in);
          await this.nextUser(user);
          if (this.router.url === '/login'){
            this.router.navigate(['/login'])
          }
        } else {
          localStorage.setItem('user', null);
          if (!['/home', '/login'].includes(this.router.url)) {
            this.router.navigate(['/login']);
            //this.widgetService.presentToast("You are not logged in")
          }
        }
      }
    }, async(error: any) => {
      let my_message: string = "AN UNKOWN ERROR OCCURRED WHILE LOGING IN"
      if (error && error.code && error.name == 'FirebaseError'){
        return await this.errorService.logError(error.code, my_message, 'auto login', 'unknown')
      }
      return await this.errorService.logError(error, my_message, 'auto login', 'unknown')
    })
  }

  async setProfile(user: any) {
    this.isLoading = true;
    this.profile = user;
    this.nextUser(user);
    if (user.emailVerified){
      // complete profile
      if (!this.profile.complete){
        this.isLoading = false;
        if (!['/terms', '/policy'].includes(this.router.url)){
          //await this.widgetService.dismissLoader();
          return this.router.navigate(['/auth/complete-profile']);
        }
        return
      } else {
        this.isLoading = false;
        if (['/login', '/register'].includes(this.router.url)){
          //await this.widgetService.dismissLoader();
          return this.router.navigate(['/home']);
        }
      } 
    } else {
      return await this.SendVerificationMail()
    }
  }

  async SetUserData(user: any) {
    const accessToken = await user.getIdToken()
    let userState = {
      uid: user.uid,
      email: user.email,
      uname: null,
      emailVerified: user.emailVerified,
      access_token: accessToken,
      online: false,
      complete: false,
      accepted_terms: false,
      accepted_policy: false,
      stripe: null,
      fire_push: null,
      created: new Date(),
      expiration_date: null
    }
    this.dataStorage.updateUser(userState)
    return userState
  }

  logOut(){
    this.loggedIn.next(false);
    if (this.profile) {
      this.dataStorage.updateUser(this.profile, true)
      localStorage.removeItem('user');
      return this.afAuth.signOut().then(() => {
        //window.location.reload();
        this.router.navigate(['/auth/signin']);
        return this.ref.tick();
      }, (error) => {
        return this.errorService.logError(error, "An Unknown Error Occurred", 'sign out', this.profile.uid)
      })
    }
  }

  async autoLogout(expirationDuration: number) { //call this when we emit new user in autologin and authentication
    this.tokenExpirationTimer = setTimeout(async() => {
      return await this.logOut();
    }, expirationDuration);
  }

  async nextUser(profile: UserProfile){
    this.profile = profile
    this.userService.setProfile(profile)
    localStorage.setItem('user', JSON.stringify(profile));
    this.profileChanged.next(profile)
    this.loggedIn.next(true);
  }

  async deleteAccount(){
    this.afAuth.authState.subscribe(async (auth) => {
      await this.deleteArrayItem('unames', this.profile.uname)
      await this.deleteArrayItem('emails', this.profile.email)
      await this.dataStorage.deleteUser(auth.uid)
      auth.delete().then(() => {
        localStorage.removeItem('user');
      }).then(async() => {
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
        //window.location.reload();
        this.ref.tick();
        return 
      })
    }, async(err) => {
      return await this.errorService.logError(err, "An Unknown Error Occurred", 'delete account', this.profile.uid)
    })
  }

  async deleteArrayItem(field: any, item: string){
    return this.functions.httpsCallable("deleteArrayItem")({
      field: field,
      item: item
    }).subscribe(async() => {
    }, async(err) => {
      return this.errorService.logError(err, "An Unknown Error Occurred", 'delete ' + field + ' from array', item)
    })
  }

  async updateArrays(field: any, item: string){
    return this.functions.httpsCallable("addArrayItem")({
      field: field,
      item: item
    }).subscribe(async(res: boolean) => {
      return res
    }, async(err) => {
      return this.errorService.logError(err, "An Unknown Error Occurred", 'add ' + field + ' to array', item)
    })
  }
}
