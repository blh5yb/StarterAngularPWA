import { Injectable } from '@angular/core';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { MenuDropdownComponent } from '../shared/menu-dropdown/menu-dropdown.component';
import QrCodeWithLogo from "qrcode-with-logos";

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  popover: any = {};
  last_doc: any;

  constructor(
    private toastController: ToastController, 
    private platform: Platform,
    private popoverController: PopoverController,
    ) { }

  async presentToast(message: string){
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: this.platform.is('desktop') ? 'top': 'bottom'
    })
    toast.present();
  }

  async menuPopover(ev: any){
    this.popover = await this.popoverController.create({
      component: MenuDropdownComponent,
      event: ev,
      //cssClass: '{padding-left: 5px;}',
      translucent: true
    });
    this.popover.onDidDismiss().then((result) => {
    });

    return await this.popover.present();
  }

  async dismissPopover(){
    return await this.popover.dismiss();
  }

  handleDates(my_date: any){
    if (!(my_date instanceof Date)) {
      return my_date.toDate()
    } else {
      return my_date;
    }
  }

  createQrCode(url: string){
    const myCanvas = document.createElement('canvas')
    //document.getElementsByTagName('body')[0].appendChild(canvas);
    new QrCodeWithLogo({
      canvas: myCanvas,
      content: url,
      width: 380,
      download: true,
      logo: {
        src: '../../assets/icons/icon-96x96.png'
      }
    }).toImage();
  }

  isNativePlatform() {
    return (this.platform.is('cordova') || this.platform.is('capacitor'));
  }

  setPageRes(actions: any){
    let results: any[] = [];
    let last_doc: AnalyserNode;
    actions.forEach((item: any) => {
      const data = item.payload.doc.data();
      last_doc = item.payload.doc;
      results.push(data)
    })
    this.last_doc = last_doc
    return results.slice()
  }
}
