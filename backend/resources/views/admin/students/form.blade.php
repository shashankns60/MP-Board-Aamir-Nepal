@extends('layouts.admin')

@section('title', $mode === 'edit' ? 'Edit Student' : 'Add Student')
@section('heading', $mode === 'edit' ? 'Edit Student Result' : 'Add Student Result')

@section('content')
<form method="POST" action="{{ $mode === 'edit' ? route('admin.students.update', $student) : route('admin.students.store') }}">
    @csrf
    @if ($mode === 'edit')
        @method('PUT')
    @endif

    <div class="card table-card mb-4">
        <div class="card-header bg-white"><strong>Student Details</strong></div>
        <div class="card-body row g-3">
            <div class="col-md-4">
                <label class="form-label">Roll Number *</label>
                <input type="text" name="roll_number" value="{{ old('roll_number', $student->roll_number) }}" class="form-control" required>
            </div>
            <div class="col-md-4">
                <label class="form-label">Date of Birth *</label>
                <input type="date" name="date_of_birth" value="{{ old('date_of_birth', optional($student->date_of_birth)->format('Y-m-d')) }}" class="form-control" required>
            </div>
            <div class="col-md-4">
                <label class="form-label">Class</label>
                <select name="class" class="form-select">
                    <option value="">Select class</option>
                    @foreach (['10th', '12th'] as $classOption)
                        <option value="{{ $classOption }}" @selected(old('class', $student->class) === $classOption)>{{ $classOption }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Student Name *</label>
                <input type="text" name="student_name" value="{{ old('student_name', $student->student_name) }}" class="form-control" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Enrollment Number</label>
                <input type="text" name="enrollment_number" value="{{ old('enrollment_number', $student->enrollment_number) }}" class="form-control">
            </div>
            <div class="col-md-6">
                <label class="form-label">Father Name</label>
                <input type="text" name="father_name" value="{{ old('father_name', $student->father_name) }}" class="form-control">
            </div>
            <div class="col-md-6">
                <label class="form-label">Mother Name</label>
                <input type="text" name="mother_name" value="{{ old('mother_name', $student->mother_name) }}" class="form-control">
            </div>
            <div class="col-md-8">
                <label class="form-label">School Name</label>
                <input type="text" name="school_name" value="{{ old('school_name', $student->school_name) }}" class="form-control">
            </div>
            <div class="col-md-2">
                <label class="form-label">School Code</label>
                <input type="number" name="school_code" value="{{ old('school_code', $student->school_code) }}" class="form-control">
            </div>
            <div class="col-md-2">
                <label class="form-label">Exam Year</label>
                <input type="number" name="examination_year" value="{{ old('examination_year', $student->examination_year) }}" class="form-control">
            </div>
        </div>
    </div>

    <div class="card table-card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <strong>Subjects</strong>
            <button type="button" class="btn btn-sm btn-outline-primary" id="add-subject-row">Add Subject</button>
        </div>
        <div class="table-responsive">
            <table class="table mb-0" id="subjects-table">
                <thead class="table-light">
                <tr>
                    <th>Subject Name</th>
                    <th>Theory</th>
                    <th>Practical</th>
                    <th>Total</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                @php($subjects = old('subjects', $student->subjects ?? []))
                @foreach ($subjects as $index => $subject)
                    <tr>
                        <td><input type="text" name="subjects[{{ $index }}][name]" value="{{ $subject['name'] ?? '' }}" class="form-control"></td>
                        <td><input type="number" name="subjects[{{ $index }}][theory]" value="{{ $subject['theory'] ?? '' }}" class="form-control"></td>
                        <td><input type="number" name="subjects[{{ $index }}][practical]" value="{{ $subject['practical'] ?? '' }}" class="form-control"></td>
                        <td><input type="number" name="subjects[{{ $index }}][total]" value="{{ $subject['total'] ?? '' }}" class="form-control"></td>
                        <td><button type="button" class="btn btn-sm btn-outline-danger remove-subject-row">&times;</button></td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="card table-card mb-4">
        <div class="card-header bg-white"><strong>Result Summary</strong></div>
        <div class="card-body row g-3">
            <div class="col-md-3">
                <label class="form-label">Total Obtained</label>
                <input type="number" name="total_obtained" value="{{ old('total_obtained', $student->total_obtained) }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Maximum Marks</label>
                <input type="number" name="maximum_marks" value="{{ old('maximum_marks', $student->maximum_marks ?: 600) }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Percentage</label>
                <input type="number" step="0.0001" name="percentage" value="{{ old('percentage', $student->percentage) }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Division</label>
                <input type="text" name="division" value="{{ old('division', $student->division) }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Result Status</label>
                <input type="text" name="result_status" value="{{ old('result_status', $student->result_status ?: 'PASS') }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Serial Number</label>
                <input type="number" name="serial_number" value="{{ old('serial_number', $student->serial_number) }}" class="form-control">
            </div>
            <div class="col-md-3">
                <label class="form-label">Issue Date</label>
                <input type="text" name="issue_date" value="{{ old('issue_date', $student->issue_date) }}" class="form-control" placeholder="22.05.2018">
            </div>
            <div class="col-md-3">
                <label class="form-label">Record Status</label>
                <select name="status" class="form-select">
                    <option value="active" @selected(old('status', $student->status) === 'active')>Active</option>
                    <option value="on_leave" @selected(old('status', $student->status) === 'on_leave')>On Leave</option>
                </select>
            </div>
        </div>
    </div>

    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">{{ $mode === 'edit' ? 'Update Record' : 'Save Record' }}</button>
        <a href="{{ route('admin.students.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </div>
</form>
@endsection

@push('scripts')
<script>
    (function () {
        var tableBody = document.querySelector('#subjects-table tbody');
        var rowIndex = tableBody ? tableBody.children.length : 0;

        document.getElementById('add-subject-row').addEventListener('click', function () {
            var row = document.createElement('tr');
            row.innerHTML =
                '<td><input type="text" name="subjects[' + rowIndex + '][name]" class="form-control"></td>' +
                '<td><input type="number" name="subjects[' + rowIndex + '][theory]" class="form-control"></td>' +
                '<td><input type="number" name="subjects[' + rowIndex + '][practical]" class="form-control"></td>' +
                '<td><input type="number" name="subjects[' + rowIndex + '][total]" class="form-control"></td>' +
                '<td><button type="button" class="btn btn-sm btn-outline-danger remove-subject-row">&times;</button></td>';
            tableBody.appendChild(row);
            rowIndex++;
        });

        tableBody.addEventListener('click', function (event) {
            if (event.target.classList.contains('remove-subject-row')) {
                event.target.closest('tr').remove();
            }
        });
    })();
</script>
@endpush
