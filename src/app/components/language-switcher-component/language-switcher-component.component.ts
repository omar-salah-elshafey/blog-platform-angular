import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher-component',
  imports: [],
  templateUrl: './language-switcher-component.component.html',
  styleUrl: './language-switcher-component.component.scss',
})
export class LanguageSwitcherComponentComponent {
  currentLang = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'en';
    this.switchLanguage(savedLang);
  }

  onLanguageSwitch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedLang = target.checked ? 'en' : 'ar';
    this.switchLanguage(selectedLang);
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }
}
