@extends('layouts.admin')

@section('title', 'Change Password')
@section('heading', 'Change Password')

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-6">
        <div class="card table-card">
            <div class="card-header bg-white border-0 pt-4 px-4">
                <h2 class="h5 mb-1">Update login password</h2>
                <p class="text-muted small mb-0">
                    Use a strong password (minimum 8 characters). After changing, other devices will be logged out.
                </p>
            </div>
            <div class="card-body px-4 pb-4">
                <form method="POST" action="{{ route('admin.password.update') }}" autocomplete="off">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label class="form-label" for="current_password">Current Password *</label>
                        <input
                            type="password"
                            name="current_password"
                            id="current_password"
                            class="form-control @error('current_password') is-invalid @enderror"
                            required
                            autofocus
                        >
                        @error('current_password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="password">New Password *</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            class="form-control @error('password') is-invalid @enderror"
                            required
                            minlength="8"
                        >
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">At least 8 characters.</div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label" for="password_confirmation">Confirm New Password *</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            id="password_confirmation"
                            class="form-control"
                            required
                            minlength="8"
                        >
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-shield-lock me-1"></i> Change Password
                        </button>
                        <a href="{{ route('admin.dashboard') }}" class="btn btn-outline-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
