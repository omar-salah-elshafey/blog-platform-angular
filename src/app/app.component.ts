import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { LanguageSwitcherComponentComponent } from './components/language-switcher-component/language-switcher-component.component';
import { NotificationService } from './services/notification/notification.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ScrollToTopComponent,
    LanguageSwitcherComponentComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}
  ngOnInit(): void {
    this.notificationService.startConnection();
  }
}
