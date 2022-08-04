import { ApplicationRef, Component, OnInit} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectivityService } from 'src/app/services/connectivity.service';
import { HelperService } from 'src/app/services/helper.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class LoginPage implements OnInit {

  signInForm: FormGroup;
  authInfo: any;
  isLoading: boolean = false;
  error: string = null;

  conn: boolean = false; 

  constructor(
    public authService: AuthService,
    public router: Router,
    private helperService: HelperService,
    private ref: ApplicationRef,
    private connectivity: ConnectivityService,
    ) {  
      
      this.connectivity.createOnline$().subscribe((conn) => {
      [this.isLoading, this.conn] = this.connectivity.checkOnline(conn)
      })
    }

  ngOnInit() {
    if (this.conn) {
      this.initLoginForm();
    }
  }

  initLoginForm(){
    this.signInForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'pass': new FormControl('', [Validators.required]),
    });
  }

  async onSubmit(){
    this.isLoading = true;
    this.authInfo = {
      'email': this.signInForm.controls.email.value,
      'pass': this.signInForm.controls.pass.value,
      // 'push': this.signUpForm.controls.push.value,
    };
    return await this.authService.signIn(this.authInfo.email, this.authInfo.pass).then(() => {
      //this.error = res;
      this.isLoading = false;
      this.signInForm.reset();
    })
  }

  onHandleError(){
    this.error = null;
    return this.ref.tick();
  }

  googleLogin(){
    if (this.helperService.isNativePlatform()) {
      this.nativeGoogleLogin();
    } else {
      this.googleLoginWeb();
    }
  }

  async nativeGoogleLogin(){
    this.isLoading = true;
    return await this.authService.nativeGoogleLogin().then(() => {
      this.isLoading = false;
    })
  }

  async googleLoginWeb(){
    this.isLoading = true;
    return await this.authService.GoogleAuthWeb().then(() => {
      this.isLoading = false;
    })
  }

  async continueAsGuest(){
    this.isLoading = true;
    return await this.authService.anonomousSignIn().then(() => {
      this.isLoading = false;
    })
  }

  setError(err: any){
    if (err) {
      this.error = err;
    }
    return
  }

  get email() { return this.signInForm.get('email'); }
  get pass() { return this.signInForm.get('pass'); }

}

