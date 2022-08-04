import { NgModule } from '@angular/core';
import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

@NgModule({
  imports: [
    SharedModule,
    LoginPageRoutingModule,
  ],
  declarations: [
    LoginPage,
    ForgotPasswordComponent
  ]
})
export class LoginPageModule {}
