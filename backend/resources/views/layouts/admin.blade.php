<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Admin') - EduManager</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --sidebar-bg: #0f2744;
            --sidebar-active: #1a56db;
            --page-bg: #f4f7fb;
        }
        body { background: var(--page-bg); }
        .admin-shell { min-height: 100vh; }
        .admin-sidebar {
            width: 260px;
            background: var(--sidebar-bg);
            color: #fff;
            flex-shrink: 0;
        }
        .admin-sidebar .brand {
            padding: 1.25rem 1.5rem;
            font-weight: 700;
            font-size: 1.15rem;
            border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .admin-sidebar .nav-link {
            color: rgba(255,255,255,.85);
            padding: .85rem 1.5rem;
            border-radius: 0;
        }
        .admin-sidebar .nav-link.active,
        .admin-sidebar .nav-link:hover {
            background: rgba(255,255,255,.08);
            color: #fff;
        }
        .admin-content { flex: 1; }
        .admin-topbar {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 1.5rem;
        }
        .stat-card {
            border: 0;
            border-radius: 1rem;
            box-shadow: 0 8px 24px rgba(15,39,68,.08);
        }
        .table-card {
            border: 0;
            border-radius: 1rem;
            box-shadow: 0 8px 24px rgba(15,39,68,.08);
        }
    </style>
</head>
<body>
<div class="admin-shell d-flex">
    <aside class="admin-sidebar d-flex flex-column">
        <div class="brand">EduManager</div>
        <nav class="nav flex-column py-3 flex-grow-1">
            <a class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}">
                <i class="bi bi-grid me-2"></i> Dashboard
            </a>
            <a class="nav-link {{ request()->routeIs('admin.students.*') ? 'active' : '' }}" href="{{ route('admin.students.index') }}">
                <i class="bi bi-people me-2"></i> Students
            </a>
            <a class="nav-link {{ request()->routeIs('admin.import.*') ? 'active' : '' }}" href="{{ route('admin.import.create') }}">
                <i class="bi bi-upload me-2"></i> Bulk Upload
            </a>
            <a class="nav-link {{ request()->routeIs('admin.password.*') ? 'active' : '' }}" href="{{ route('admin.password.edit') }}">
                <i class="bi bi-shield-lock me-2"></i> Change Password
            </a>
        </nav>
        <form method="POST" action="{{ route('admin.logout') }}" class="p-3 border-top border-secondary-subtle">
            @csrf
            <button type="submit" class="btn btn-outline-light w-100">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
            </button>
        </form>
    </aside>

    <div class="admin-content">
        <div class="admin-topbar d-flex justify-content-between align-items-center">
            <div>
                <div class="text-muted small">Admin Panel</div>
                <h1 class="h4 mb-0">@yield('heading', 'Dashboard')</h1>
            </div>
            <div class="text-end">
                <div class="fw-semibold">{{ auth()->user()->name }}</div>
                <div class="text-muted small">SUPER ADMIN</div>
                <a href="{{ route('admin.password.edit') }}" class="small text-decoration-none">Change password</a>
            </div>
        </div>

        <main class="p-4">
            @if (session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
@stack('scripts')
</body>
</html>
