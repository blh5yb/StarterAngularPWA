import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectivityService } from 'src/app/services/connectivity.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  isLoading: boolean = false;
  email: string;
  conn: boolean = false;
  company: string;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private connectivity: ConnectivityService,
    ) {  
      
      this.connectivity.createOnline$().subscribe((conn: any) => {
      [this.isLoading, this.conn] = this.connectivity.checkOnline(conn)
      })
    }

  ngOnInit() {
    this.company = environment.company;
    this.isLoading = true;
    if (this.conn) {
      this.route.queryParams.subscribe(params => {
        if (params.email){
          this.email = params.email
        }
        this.isLoading = false;
      })
    }
  }

  goToSignIn(){
    this.router.navigate(['/login']);
  }

}
