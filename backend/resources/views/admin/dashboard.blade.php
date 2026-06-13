@extends('layouts.admin')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="text-muted small">Total Registered Students</div>
                <div class="display-6 fw-bold text-primary">{{ number_format($totalStudents) }}</div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="text-muted small">System Health</div>
                <div class="fw-semibold text-success mt-2">Database connected and synchronized</div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card stat-card">
            <div class="card-body d-grid gap-2">
                <a href="{{ route('admin.students.create') }}" class="btn btn-primary">Add New Student</a>
                <a href="{{ route('admin.import.create') }}" class="btn btn-outline-primary">Bulk Records Upload</a>
                <a href="{{ route('admin.students.export') }}" class="btn btn-outline-secondary">Export All Data</a>
            </div>
        </div>
    </div>
</div>

<div class="card table-card">
    <div class="card-header bg-white border-0 pt-4 px-4">
        <h2 class="h5 mb-0">Recent Student Records</h2>
    </div>
    <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
            <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
            </tr>
            </thead>
            <tbody>
            @forelse ($recentStudents as $student)
                <tr>
                    <td>#{{ $student->roll_number }}</td>
                    <td>{{ $student->student_name }}</td>
                    <td>{{ $student->class ?: '-' }}</td>
                    <td>{{ $student->date_of_birth?->format('d M Y') }}</td>
                    <td>
                        <span class="badge {{ $student->status === 'active' ? 'bg-success' : 'bg-secondary' }}">
                            {{ $student->status === 'active' ? 'Active' : 'On Leave' }}
                        </span>
                    </td>
                    <td class="text-end">
                        <a href="{{ route('admin.students.edit', $student) }}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <form action="{{ route('admin.students.destroy', $student) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this record?')">
                            @csrf
                            @method('DELETE')
                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">No student records yet.</td>
                </tr>
            @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
