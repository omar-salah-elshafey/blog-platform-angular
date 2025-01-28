import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-post-deleting-confermation',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './post-deleting-confermation.component.html',
  styleUrl: './post-deleting-confermation.component.scss'
})
export class PostDeletingConfermationComponent {

}
