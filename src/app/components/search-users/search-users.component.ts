import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search-users',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss',
})
export class SearchUsersComponent implements OnInit {
  searchForm!: FormGroup;
  users: any[] = [];
  paginatedUsers: any[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      query: ['', Validators.required],
    });

    this.searchForm
      .get('query')!
      .valueChanges.pipe(debounceTime(500))
      .subscribe((query) => {
        if (!query) this.clearResults();
        else this.onSearch();
      });
  }

  onSearch() {
    const query = this.searchForm.get('query')!.value;
    if (!query) return;
    if (this.currentPage === 1) this.users = [];
    this.loading = true;
    this.profileService
      .searchUsers(query, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.users = [...this.users, ...response.items];
          this.totalPages = response.totalPages;
          console.log(response);
        },
        error: (error) => {
          this.toastr.error('Error fetching results.', 'Error');
          console.error('Error:', error);
        },
        complete: () => (this.loading = false),
      });
  }

  loadMoreUsers() {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.onSearch();
    }
  }

  clearResults() {
    this.users = [];
    this.paginatedUsers = [];
    this.currentPage = 1;
    this.totalPages = 1;
  }
}
