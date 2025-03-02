import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [CommonModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss',
})
export class ScrollToTopComponent {
  isVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isVisible = scrollTop > 100;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
