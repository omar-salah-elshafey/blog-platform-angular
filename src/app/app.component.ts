import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ScrollToTopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
