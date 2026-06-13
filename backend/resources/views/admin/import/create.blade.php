@extends('layouts.admin')

@section('title', 'Bulk Upload')
@section('heading', 'Bulk Records Upload')

@section('content')
<div class="card table-card">
    <div class="card-body">
        <p class="text-muted">
            Upload an Excel file (.xlsx, .xls) or CSV with student result columns.
            Duplicate records (same Roll Number + Date of Birth) will be skipped.
        </p>

        <div class="alert alert-info">
            Supported headers include:
            <code>roll_number</code>, <code>date_of_birth</code>, <code>student_name</code>,
            <code>class</code>, <code>subjects_json</code>, or flat columns like
            <code>subject1_name</code>, <code>subject1_theory</code>, etc.
        </div>

        <form method="POST" action="{{ route('admin.import.store') }}" enctype="multipart/form-data" class="row g-3">
            @csrf
            <div class="col-md-8">
                <input type="file" name="file" class="form-control" accept=".xlsx,.xls,.csv" required>
            </div>
            <div class="col-md-4">
                <button type="submit" class="btn btn-primary w-100">Import Records</button>
            </div>
        </form>
    </div>
</div>
@endsection
