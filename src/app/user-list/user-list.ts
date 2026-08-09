import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../services/user';

import {
  User,
  CreateUserRequest
} from '../../models/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit {

  // ==========================================
  // USER DATA
  // ==========================================

  users: User[] = [];

  filteredUsers: User[] = [];

  // ==========================================
  // UI STATE
  // ==========================================

  isLoading = false;

  errorMessage = '';

  // ==========================================
  // SEARCH
  // ==========================================

  searchKeyword = '';

  // ==========================================
  // PAGINATION
  // ==========================================

  currentPage = 1;

  totalPages = 1;

  // ==========================================
  // ADD USER
  // ==========================================

isAddUserModalOpen = false;

isCreatingUser = false;

createUserError = '';

addUserForm = {
  name: '',
  job: ''
};

  // ==========================================
  // EDIT USER
  // ==========================================

  isEditUserModalOpen = false;

  isUpdatingUser = false;

  updateUserError = '';

  selectedUser: User | null = null;

  editUserForm = {
    name: '',
    job: ''
  };

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private userService: UserService
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.loadUsers();

  }

  // ==========================================
  // GET USERS
  // ==========================================

  loadUsers(): void {

    console.log(
      '[UserList] Loading users...'
    );

    this.isLoading = true;

    this.errorMessage = '';

    this.userService
      .getUsers(this.currentPage)
      .subscribe({

        // --------------------------------------
        // SUCCESS
        // --------------------------------------

        next: (response) => {

          console.log(
            '[UserList] Users loaded:',
            response
          );

          this.users =
            response.data;

          this.currentPage =
            response.page;

          this.totalPages =
            response.total_pages;

          this.filteredUsers =
            [...this.users];

          this.isLoading = false;

        },

        // --------------------------------------
        // ERROR
        // --------------------------------------

        error: (error) => {

          console.error(
            '[UserList] Failed to load users:',
            error
          );

          this.errorMessage =
            'Không thể tải danh sách người dùng. Vui lòng thử lại.';

          this.isLoading = false;

        }

      });

  }

  // ==========================================
  // SEARCH
  // ==========================================

  onSearch(): void {

    const keyword =
      this.searchKeyword
        .trim()
        .toLowerCase();

    if (!keyword) {

      this.filteredUsers =
        [...this.users];

      return;

    }

    this.filteredUsers =
      this.users.filter(user =>

        user.first_name
          .toLowerCase()
          .includes(keyword)

        ||

        user.last_name
          .toLowerCase()
          .includes(keyword)

        ||

        user.email
          .toLowerCase()
          .includes(keyword)

      );

  }

  // ==========================================
  // PAGINATION
  // ==========================================

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {

      return;

    }

    this.currentPage = page;

    this.searchKeyword = '';

    this.loadUsers();

  }

  // ==========================================
  // TRACK BY
  // ==========================================

  trackByUserId(
    index: number,
    user: User
  ): number {

    return user.id;

  }

  // ==========================================
  // ADD USER
  // ==========================================

  addUser(): void {

  console.log('[UserList] Add user clicked');

  this.addUserForm = {
    name: '',
    job: ''
  };

  this.createUserError = '';

  this.isAddUserModalOpen = true;

}

  // ==========================================
  // CLOSE ADD USER
  // ==========================================

closeAddUserModal(): void {

  if (this.isCreatingUser) {
    return;
  }

  this.isAddUserModalOpen = false;

}

  // ==========================================
  // CREATE USER
  // ==========================================

  submitCreateUser(): void {

    console.log(
      '[UserList] Creating user:',
      this.addUserForm
    );

    const name =
      this.addUserForm.name.trim();

    const job =
      this.addUserForm.job.trim();

    if (!name) {

      this.createUserError =
        'Vui lòng nhập tên người dùng.';

      return;

    }

    if (!job) {

      this.createUserError =
        'Vui lòng nhập công việc.';

      return;

    }

    this.createUserError = '';

    this.isCreatingUser = true;

    this.userService
      .createUser({
        name,
        job
      })
      .subscribe({

        next: (response) => {

          console.log(
            '[UserList] User created successfully:',
            response
          );

          const createdUser: User = {

            id: Number(response.id),

            email: '',

            first_name:
              response.name,

            last_name: '',

            avatar:
              'assets/default-avatar.png'

          };

          this.users = [
            createdUser,
            ...this.users
          ];

          this.filteredUsers = [
            createdUser,
            ...this.filteredUsers
          ];

          this.isAddUserModalOpen = false;

          this.addUserForm = {
            name: '',
            job: ''
          };

          this.isCreatingUser = false;

          alert(
            'Thêm người dùng thành công!'
          );

        },

        error: (error) => {

          console.error(
            '[UserList] Failed to create user:',
            error
          );

          this.createUserError =
            'Không thể tạo người dùng. Vui lòng thử lại.';

          this.isCreatingUser = false;

        }

      });

  }

  // ==========================================
  // EDIT USER
  // ==========================================

  editUser(user: User): void {

    console.log(
      '[UserList] Edit user:',
      user
    );

    // Lưu user đang được chỉnh sửa
    this.selectedUser = user;

    // Tạm thời dùng first_name + last_name
    // làm name gửi lên API
    const fullName =
      `${user.first_name} ${user.last_name}`
        .trim();

    this.editUserForm = {

      name: fullName,

      job: ''

    };

    this.updateUserError = '';

    this.isEditUserModalOpen = true;

  }

  // ==========================================
  // CLOSE EDIT USER
  // ==========================================

  closeEditUserModal(): void {

    if (this.isUpdatingUser) {

      return;

    }

    this.isEditUserModalOpen = false;

    this.updateUserError = '';

    this.selectedUser = null;

    this.editUserForm = {

      name: '',

      job: ''

    };

  }

  // ==========================================
  // SUBMIT UPDATE USER
  // ==========================================

  submitUpdateUser(): void {

    if (!this.selectedUser) {

      return;

    }

    console.log(
      '[UserList] Updating user:',
      this.selectedUser.id
    );

    const name =
      this.editUserForm.name.trim();

    const job =
      this.editUserForm.job.trim();

    // ----------------------------------------
    // VALIDATE
    // ----------------------------------------

    if (!name) {

      this.updateUserError =
        'Vui lòng nhập tên người dùng.';

      return;

    }

    if (!job) {

      this.updateUserError =
        'Vui lòng nhập công việc.';

      return;

    }

    this.updateUserError = '';

    this.isUpdatingUser = true;

    // ----------------------------------------
    // PUT API
    // ----------------------------------------

    this.userService
      .updateUser(
        this.selectedUser.id,
        {
          name,
          job
        }
      )
      .subscribe({

        // ------------------------------------
        // SUCCESS
        // ------------------------------------

        next: (response) => {

          console.log(
            '[UserList] User updated successfully:',
            response
          );

          /*
           * API demo trả về name/job.
           *
           * Cập nhật user ngay trên UI.
           */

          if (this.selectedUser) {

            const index =
              this.users.findIndex(
                user =>
                  user.id ===
                  this.selectedUser!.id
              );

            if (index !== -1) {

              const nameParts =
                response.name.trim()
                  .split(' ');

              const firstName =
                nameParts.shift() ?? '';

              const lastName =
                nameParts.join(' ');

              this.users[index] = {

                ...this.users[index],

                first_name:
                  firstName,

                last_name:
                  lastName

              };

            }

            // Cập nhật filteredUsers
            this.filteredUsers =
              [...this.users];

          }

          this.isEditUserModalOpen = false;

          this.isUpdatingUser = false;

          this.selectedUser = null;

          alert(
            'Cập nhật người dùng thành công!'
          );

        },

        // ------------------------------------
        // ERROR
        // ------------------------------------

        error: (error) => {

          console.error(
            '[UserList] Failed to update user:',
            error
          );

          this.updateUserError =
            'Không thể cập nhật người dùng. Vui lòng thử lại.';

          this.isUpdatingUser = false;

        }

      });

  }

  // ==========================================
  // DELETE USER
  // ==========================================

  deleteUser(user: User): void {

  console.log(
    '[UserList] Delete user:',
    user
  );

  const fullName =
    `${user.first_name} ${user.last_name}`;

  const confirmed =
    confirm(
      `Bạn có chắc chắn muốn xóa người dùng "${fullName}" không?`
    );

  if (!confirmed) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.userService
    .deleteUser(user.id)
    .subscribe({

      // ======================================
      // SUCCESS
      // ======================================

      next: () => {

        console.log(
          '[UserList] User deleted successfully:',
          user.id
        );

        // Xóa khỏi danh sách gốc
        this.users =
          this.users.filter(
            item => item.id !== user.id
          );

        // Xóa khỏi danh sách đang hiển thị
        this.filteredUsers =
          this.filteredUsers.filter(
            item => item.id !== user.id
          );

        this.isLoading = false;

        alert(
          `Đã xóa người dùng "${fullName}" thành công!`
        );
      },

      // ======================================
      // ERROR
      // ======================================

      error: (error) => {

        console.error(
          '[UserList] Failed to delete user:',
          error
        );

        this.errorMessage =
          'Không thể xóa người dùng. Vui lòng thử lại.';

        this.isLoading = false;
      }

    });
}

  // ==========================================
  // IMAGE ERROR
  // ==========================================

  handleImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      'assets/default-avatar.png';

  }
submitAddUser(): void {

  console.log(
    '[UserList] Creating user:',
    this.addUserForm
  );

  // -----------------------------
  // VALIDATE
  // -----------------------------

  const name =
    this.addUserForm.name.trim();

  const job =
    this.addUserForm.job.trim();

  if (!name || !job) {

    this.createUserError =
      'Vui lòng nhập đầy đủ thông tin.';

    return;
  }

  // -----------------------------
  // LOADING
  // -----------------------------

  this.isCreatingUser = true;

  this.createUserError = '';

  // -----------------------------
  // CALL API
  // -----------------------------

  this.userService
    .createUser({
      name,
      job
    })
    .subscribe({

      next: (response) => {

        console.log(
          '[UserList] User created:',
          response
        );

        this.isCreatingUser = false;

        this.isAddUserModalOpen = false;

        // Tải lại danh sách
        this.loadUsers();

      },

      error: (error) => {

        console.error(
          '[UserList] Create user failed:',
          error
        );

        this.isCreatingUser = false;

        this.createUserError =
          'Không thể tạo người dùng. Vui lòng thử lại.';

      }

    });

}
}