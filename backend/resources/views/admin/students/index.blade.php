@extends('layouts.admin')

@section('title', 'Students')
@section('heading', 'Student Results')

@section('content')
<div class="card table-card">
    <div class="card-body border-bottom">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-5">
                <label class="form-label">Search records</label>
                <input type="text" name="search" value="{{ $search }}" class="form-control" placeholder="Roll number, name, enrollment">
            </div>
            <div class="col-md-3">
                <label class="form-label">Filter by Class</label>
                <select name="class" class="form-select">
                    <option value="">All classes</option>
                    @foreach ($classes as $class)
                        <option value="{{ $class }}" @selected($classFilter === $class)>{{ $class }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-4 d-flex gap-2">
                <button class="btn btn-primary">Search</button>
                <a href="{{ route('admin.students.create') }}" class="btn btn-success">Add Student</a>
                <a href="{{ route('admin.import.create') }}" class="btn btn-outline-primary">Import Excel</a>
            </div>
        </form>
    </div>

    <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
            <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>DOB</th>
                <th>Result</th>
                <th class="text-end">Actions</th>
            </tr>
            </thead>
            <tbody>
            @forelse ($students as $student)
                <tr>
                    <td>{{ $student->roll_number }}</td>
                    <td>{{ $student->student_name }}</td>
                    <td>{{ $student->class ?: '-' }}</td>
                    <td>{{ $student->date_of_birth?->format('Y-m-d') }}</td>
                    <td>{{ $student->result_status }} / {{ $student->division ?: '-' }}</td>
                    <td class="text-end">
                        <a href="{{ route('admin.students.edit', $student) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                        <form action="{{ route('admin.students.destroy', $student) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this record?')">
                            @csrf
                            @method('DELETE')
                            <button class="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">No records found.</td>
                </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    @if ($students->hasPages())
        <div class="card-footer bg-white">
            {{ $students->links() }}
        </div>
    @endif
</div>
@endsection
