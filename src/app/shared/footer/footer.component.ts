import { Component, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/services/theming.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  dark_mode: boolean = false;

  constructor(
    private themingService: ThemingService,
  ) { }

  ngOnInit() {
    this.themingService.dark_theme.subscribe((dark: boolean) => {
      this.dark_mode = dark;
    })
  }

}
