import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataStorageService } from './services/data-storage.service';
import { UserProfile} from './models/user-profile.model'
import { UserService } from './services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolverService implements Resolve<UserProfile> {

  constructor(
    private dataStorageService: DataStorageService,
    private userService: UserService,
    private afAuth: AngularFireAuth,
  ) { }
  resolve(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any{
    //const user_id = this.userService.getUserId();
    const userProfile = this.userService.getProfile();
    const uid = this.userService.getUserId();
    
    if (!userProfile) {
      const profile = this.dataStorageService.fetchUser(uid);
      return profile;
      
    } else {
        return userProfile;
    }

    //return this.afAuth.authState.subscribe((res: any) => {
    //  return res.user
    //})
  }
}
