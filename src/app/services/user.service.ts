import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  profileChanged = new Subject<UserProfile>();
  profile: UserProfile;
  uid: string;

  constructor(
    private helperService: HelperService,
  ) { }

  setProfile(user: any){
    user.created = this.helperService.handleDates(user.created);
    this.updateProfile(user)
  }

  async setAnonymousProfile(user: any) {
    user.expiration_date = this.helperService.handleDates(user.expiration_date);
    localStorage.setItem('user', JSON.stringify(user));
    return this.updateProfile(user)
  }

  updateProfile(user: any){
    this.profile = user;
    this.uid = user.uid;
    this.profileChanged.next(user);
  }

  getProfile(){
    return this.profile;
  }

  getUserId(){
    return this.uid
  }
}
