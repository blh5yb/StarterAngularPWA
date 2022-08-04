import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PhotoUploadComponent } from './photo-upload.component';



@NgModule({
  declarations: [PhotoUploadComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [PhotoUploadComponent]
})
export class PhotoUploadModule { }
