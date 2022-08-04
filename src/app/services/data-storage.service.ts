import { Injectable} from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { debounceTime, map, take} from 'rxjs/operators';

import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(
    private db: AngularFirestore,
    private userService: UserService,
    private errorService: ErrorService
  ) { }

  async updateUser(profile: UserProfile, update?: boolean) {
    // over-ride updating admin fields and parse dates
    this.userService.updateProfile(profile)
    let my_profile = JSON.parse(JSON.stringify(profile))
    if (update) {
      delete my_profile.accepted_policy;
      delete my_profile.accepted_terms;
    }
    if (my_profile.expiration_date) {
      my_profile.expiration_date = new Date (my_profile.expiration_date);
    }
    const mydoc = 'users/' + my_profile.uid;
    return await this.db.doc(mydoc).set(my_profile, {merge: true}).then(async() => {
    }).catch((error) => {
      this.errorService.logError(error, "An Unknown Error Occurred", 'update user', profile.uid)
    })
  }

  async fetchUser(uid: any) {
    return await this.db.collection('users').doc(uid).ref.get().then((doc) => {
      const user: any = doc.data();
      if (user){
        if (user.anonymous) {
          this.userService.setAnonymousProfile(user)
        } else {
          this.userService.setProfile(user);
        }
        return user;
      } else {
        return null
      }
    }).catch((error) => {
      this.errorService.logError(error, "An Unknown Error Occurred", 'fetch user', uid)
    })
  }

  async queryFirstPage(col: string, field: string, item: string){
    const doc =  this.db.collection(col, ref => ref
      .where(field, '==', item)
      .limit(environment.pagination_lim)
    );
    return doc.snapshotChanges().pipe(map((actions: any) => {
      return actions
    }))
  }

  async fetchArrayItems(){
    return await this.db.collection('public').doc('arrays').ref.get().then((doc: any) => {
      return doc.data();
    }).catch((error) => {
       this.errorService.logError(error, "An Unknown Error Occurred", 'fetch array items', 'unknown')
    })
  }

  async addArrayItem(arrays: any) {
    const mydoc = 'public/arrays';
    return await this.db.doc(mydoc).set(arrays, {merge: true}).catch((error) => {
      this.errorService.logError(error, "An Unknown Error Occurred", 'add array items', 'unknown')
    })
  }

  checkArrayItem(field: string, item: string): Observable<any> {
    try {
      return this.db.collection('public').doc('arrays')
        .valueChanges().pipe(
        debounceTime(1000),
        take(1),
        map((res: any) => {
          if ((res[field]).includes(item.toLowerCase())){
            return true
          }
          return false
        })
      )
    } catch(error) {
      this.errorService.logError(error, "An Unknown Error Occurred", `check ${field} array`, 'unknown')
      throw new Error("An Unknown Error Occurred")
    }
  }

  async deleteUser(uid: string) {
    //const mydoc = 'users/' + profile.uid;
    const ref = this.db.collection('users');
    return await ref.doc(uid).delete().catch((error) => {
      this.errorService.logError(error, "An Unknown Error Occurred", 'delete user', uid)
    })
  }

}
