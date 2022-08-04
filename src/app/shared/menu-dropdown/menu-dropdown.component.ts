import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu-dropdown',
  templateUrl: './menu-dropdown.component.html',
  styleUrls: ['./menu-dropdown.component.scss'],
})
export class MenuDropdownComponent implements OnInit {
  user_sub: Subscription;
  profile: UserProfile;

  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.user_sub = this.userService.profileChanged.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
      }
    )
    this.profile = this.userService.getProfile();
  }

  dismissPopover(route: string) {
    this.helperService.dismissPopover();
    if (route === 'logout'){
      return this.authService.logOut();
    } else {
      return this.router.navigate(['/', route])
    }
  }

  ngOnDestroy(){
    this.user_sub.unsubscribe();
  }

}
