import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements OnInit {
  @Input() photoURL: string;
  @Input() storage_folder: string;

  @Output() photoUpdated: EventEmitter<string> = new EventEmitter();

  isLoading: boolean = false;

  constructor(
    private afStorage: AngularFireStorage,
    private errorService: ErrorService,
    ) { }

  ngOnInit() {}

  async checkPhoto(){
    if (this.photoURL){
      return this.afStorage.storage.refFromURL(this.photoURL).delete();
    } else {
      return
    }
  }

  async onFileChanged(event: any){
    this.isLoading = true;
    await this.checkPhoto()
    const image: File = (event.target.files[0])
    let filePath = `${this.storage_folder}/${image.name}_${new Date().getTime()}`;
    const fileRef = this.afStorage.ref(filePath);
    this.afStorage.upload(filePath, image).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(async(url) => {
          this.photoURL = url;
          this.photoUpdated.emit(url)
          this.isLoading = false;
        }, error => {
          this.errorService.logError(error, "Error updating photo", 'update photo', this.storage_folder)
          this.isLoading = false;
        })
      })
    ).subscribe(() => {
      //return this.isLoading = false;
    }, (error) => {
      this.errorService.logError(error, "Error getting photo url", 'update photo', this.storage_folder)
      return this.isLoading = false;
    })
  }
}
