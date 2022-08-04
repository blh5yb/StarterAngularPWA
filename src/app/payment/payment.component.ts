import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AngularStripeService } from '@fireflysemantics/angular-stripe-service'
import { ThemingService } from 'src/app/services/theming.service';
import { ErrorService } from 'src/app/services/error.service';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnDestroy, AfterViewInit, OnInit {
  @ViewChild('cardInfo', { static: false }) cardInfo: ElementRef;
  @Output() tokenCreated: EventEmitter<any> = new EventEmitter();
  @Input() profile: UserProfile;

  stripe: any;
  tipForm: FormGroup;card: any;
  //cardNumber: any;
  cardHandler = this.onChange.bind(this);
  cardError: string = 'input card info'
  min_transaction: number = environment.min_transaction;
  payAmount: number = 0;
  stripeToken: any;
  paymentRequest: any;
  tip_error: string;
  dark_mode: boolean = false;
  payButtonError: string = '';
  isLoading: boolean = false;
  showSpinner: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private stripeService: AngularStripeService,
    private themingService: ThemingService,
    private errorService: ErrorService
    ) { }

  ngOnInit() {
    this.themingService.dark_theme.subscribe((dark: boolean) => {
      this.dark_mode = dark;
    })
    this.tip_error = `Please enter a dollar amount of at least $${this.min_transaction} to continue`
    this.initTipForm();
  }

  ngAfterViewInit() {
    this.isLoading = true;
    this.createStripeElements(this.min_transaction)
    setTimeout(async() => {
      this.isLoading = false;
    }, 500)
  }

  async createStripeElements(amount: number){
    this.stripeService.setPublishableKey(environment.stripe.key).then(
      async(stripe)=> {
        let elementStyles = {
          base: {
              textAlign: 'center',
              fontWeight: 400,
              fontSize: '16px',
              color: '#2dd36f',
              backgroundColor: '#222428',
              '::placeholder': {color: '#2dd36f'},
          }
        };
      this.stripe = stripe;
      const elements = await stripe.elements();
      if (this.dark_mode) {
        //this.cardNumber = await elements.create('cardNumber', {style: elementStyles})
        this.card = await elements.create('card', {style: elementStyles});
      } else {
        this.card = await elements.create('card', {style: {base: {fontSize: '16px'}}})
        //this.cardNumber = await elements.create('cardNumber', {style: {base: {fontSize: '16px'}}})
      }
      
      await this.card.mount(this.cardInfo.nativeElement);
      //await this.cardNumber.mount(this.cardNum.nativeElement)
      await this.card.addEventListener('change', this.cardHandler);
      //await this.cardNumber.addEventListener('change', this.cardHandler);
      this.paymentRequest = await this.stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Total',
          amount: +amount * 100,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      //console.log(this.payElement.nativeElement);
      //console.log(this.payElement);
      const prButton = await elements.create('paymentRequestButton', {
        paymentRequest: this.paymentRequest
      });
      await this.paymentRequest.canMakePayment().then(async(result) => {
        if (result) {
          await prButton.mount('#payment-request-button');
        } else {
          document.getElementById('payment-request-button').style.display = 'none';
        }
      }).then(async() => {
        if (this.tipForm.valid) {
          await this.payWithStripeButton()
        }
      })
    }).catch((error) => {
      this.errorService.logError(error, "An Unknown Error Occurred", 'create stripe elements', this.profile.uid)
    })
  }

  async payWithStripeButton(){
    this.isLoading = true;
    let amount: any = this.min_transaction;
    this.tipForm.valueChanges.subscribe
    (async(res) => {
      if (res.amount) {
        amount = res.amount;
        await this.paymentRequest.update({
          total: {
            label: 'Total',
            amount: +amount *100,
          },
        })
      }
    }, (error: Error)=> {
      this.errorService.logError(error, "An Unknown Error Occurred", 'pay with stripe button', this.profile.uname)
    })
    let emitToken = this.tokenCreated
    await this.paymentRequest.on('token', (event: any) => {
      if (event.token) {
        if(isNaN(amount) || amount < this.min_transaction) {
          event.complete('fail')
          this.isLoading = false;
          return window.alert(this.tip_error)
        } else {
          emitToken.emit({amount: amount, token: event.token})
          emitToken.complete();
          this.payButtonError = '';
          this.isLoading = false;
          return event.complete('success')
        }
      } else {
        event.complete('fail')
        this.isLoading = false;
        return window.alert('Failed To Authorize payment')
      }
    }, (error: any) => {
      this.errorService.logError(error, "An Unknown Error Occurred\nYour Payment Was Not Processed", 'pay with stripe button', this.profile.uname)
      this.isLoading = false;
    })
  }

  async createStripeToken() {
    this.showSpinner = true;
    const amount = this.tipForm.controls.amount.value;
    this.tipForm.reset();

    if (amount) {
      const { token, error } = await this.stripe.createToken(this.card)
      if (error) {
        this.cardError = error.message;
        this.showSpinner = false;
      } else {
        this.cardError = null;
        this.tokenCreated.emit({amount: amount, token: token})
        this.tokenCreated.complete();
        this.showSpinner = false;
        return
      }
    }
  }

  onChange({ error }) {
    if (error) {
      this.cardError = error.message;
    } else {
      this.cardError = null;
    }
    this.cd.detectChanges();
  }

  initTipForm(){
    this.tipForm = new FormGroup({
      'amount': new FormControl(this.min_transaction, 
        [
          Validators.pattern(/^[0-9]\d*$/),
          Validators.required,
          Validators.min(this.min_transaction)
        ]
      )
    })
  }

  keyPressNumbers(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  prevent(event: any){
    if (this.cardError || !this.tipForm.valid || !this.card){
      event.preventDefault();
    }
  }

  Cancel(){
    this.tipForm.reset();
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }
  }
}
