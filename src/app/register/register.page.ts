import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { ConnectivityService } from 'src/app/services/connectivity.service';

@Component({
  selector: 'app-user-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class RegisterPage implements OnInit {
  @Output() my_route: EventEmitter<any> = new EventEmitter();

  signUpForm: FormGroup;

  authInfo: any;
  isLoading: boolean = false;

  conn: boolean = false;

  constructor(
    private authService: AuthService,
    private helperService: HelperService,
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

  prevent(event: any){
    if (this.isLoading || !this.signUpForm.valid){
      event.preventDefault();
    }
  }

  initLoginForm(){
    this.signUpForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'pass': new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit(){
    this.isLoading = true;
    this.authInfo = {
      'email': this.signUpForm.controls.email.value,
      'pass': this.signUpForm.controls.pass.value,
      'complete': false
    };
    await this.authService.SignUp(this.authInfo);
    this.isLoading = false;
  }

  googleLogin(){
    if (this.helperService.isNativePlatform()) {
      this.nativeGoogleLogin();
    } else {
      this.googleLoginWeb();
    }
  }

  async nativeGoogleLogin(){
    try {
      this.isLoading = true;
      return await this.authService.nativeGoogleLogin().then(() => {
        return this.isLoading = false;
      })
    } catch (error) {
      this.isLoading = false
      throw new Error("An error occured");
    }
  }

  async googleLoginWeb(){
    this.isLoading = true;
    return await this.authService.GoogleAuthWeb().then(() => {
      return this.isLoading = false;
    })
  }

  get name() { return this.signUpForm.get('name'); }
  get email() { return this.signUpForm.get('email'); }
  get pass() { return this.signUpForm.get('pass'); }

}
