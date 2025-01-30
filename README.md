# Blog Platform Frontend (Angular 19)

This project is the frontend implementation of the Blog Platform, built with Angular 19. It provides an interactive and user-friendly interface for users to browse, create, and manage blog posts while interacting with the backend API.

## Features

### User Authentication and Authorization
- Login and registration with role-based access.
- JWT authentication with secure API requests.
- Navigation Guards: Users can only access pages permitted by their roles. Unauthorized access is restricted even if the URL is known.

### Blog Management
- View all posts with pagination.
- Create, update, and delete posts (Authors and Admins).
- View and manage comments on posts.

### User Profiles
- View user profiles.
- See posts written by a specific user.

### Admin Dashboard
- Manage users, posts, and comments.
- Register new users and assign roles.

### Dynamic UI Enhancements
- Responsive design with SCSS styling.
- Smooth navigation with Angular Router.

## Technologies Used

- **Framework:** Angular 19
- **Language:** TypeScript
- **Routing:** Angular Router
- **Forms:** Angular Reactive Forms
- **Styling:** SCSS
- **Notifications:** ngx-toastr
- **API Integration:** HTTP Client

## Backend Integration

This frontend is designed to work with the **[Blog Platform Backend](https://github.com/omar-salah-elshafey/BlogPlatformCleanArchitecture)**, which is built using .NET 8 with Clean Architecture.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js** (Latest LTS version recommended)
- **Angular CLI** (`npm install -g @angular/cli`)

### Installation Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/omar-salah-elshafey/blog-platform-angular.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd blog-platform-angular
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```
   
4. **Run the application:**
   ```sh
   ng serve
   ```
   The app will be available at `http://localhost:4200/`

## Usage

- **Authentication:** Users must log in to access certain features.
- **Navigating Posts:** Users can browse, search, and read posts.
- **Managing Content:** Authors and Admins can create, edit, and delete posts.
- **Admin Dashboard:** Admins have additional controls for user and post management.

## Contributing

Contributions are welcome! Feel free to submit pull requests for bug fixes, enhancements, or new features.

