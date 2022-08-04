import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorsService {

  constructor(
    private dataStorage: DataStorageService,
  ) { }

  asyncCheckUname = (control: AbstractControl): Observable<ValidationErrors | null> => {
    return this.dataStorage.checkArrayItem('unames', control.value).pipe(
      map(res => {
        return (res && control.value) ? {avail: true} : null;
      })
    )
  }

  asyncCheckEmail = (control: AbstractControl): Observable<ValidationErrors | null> => {
    return this.dataStorage.checkArrayItem('emails', control.value).pipe(
      map(res => {
        return (res && control.value) ? {avail: true} : null;
      })
    )
  }
}
