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

@Component({
  selector: 'app-search-users',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss',
})
export class SearchUsersComponent implements OnInit {
  searchForm!: FormGroup;
  users: any[] = [];
  paginatedUsers: any[] = [];
  loading = false;
  currentPage = 1;
  itemsPerPage = 5;
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

    this.loading = true;
    this.profileService.searchUsers(query).subscribe({
      next: (response) => {
        this.users = response;
        this.paginateResults();
        this.toastr.success('Search completed.', 'Success');
      },
      error: (error) => {
        this.toastr.error('Error fetching results.', 'Error');
        console.error('Error:', error);
      },
      complete: () => (this.loading = false),
    });
  }

  paginateResults() {
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  clearResults() {
    this.users = [];
    this.paginatedUsers = [];
    this.currentPage = 1;
    this.totalPages = 1;
  }
}
