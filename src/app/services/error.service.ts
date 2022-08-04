import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { throwError } from 'rxjs';
import { ErrorModel } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private functions: AngularFireFunctions,
  ) { }

  public handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!\n' + errorRes.error;
    if (!errorRes.error || !errorRes.error.error) {
      window.alert("An unknown error occured");
      return throwError(errorMessage);
     }
  }

  async logError(error: any, message: string, type: string, user: string = '') {
    const my_date = new Date()
    const cst = my_date.setHours(my_date.getHours() - 7)
    const my_error: ErrorModel = {
      date_time: new Date(cst),
      message: message,
      error_code: error,
      user: user,
      error_type: type
    }
    window.alert(message);
    return this.functions.httpsCallable("createErrorLog")({'error': my_error})
    .subscribe(() => {
    }, async(error) => {
      console.error(error)
    })
  }
}
