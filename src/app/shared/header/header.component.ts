import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLoading: boolean = false;
  show_back_button: boolean = false;
  back_route: string;
  isAuthenticated: boolean;
  photoURL: string;
  my_url: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private helperService: HelperService,
  ) { }

  ngOnInit() {
    this.my_url = this.router.url;
    this.back_route = '/home'
  }

  goHome(){
    return this.router.navigate(['/home'])
  }

  menuPopover(event: any){
    return this.helperService.menuPopover(event)
  }

}
