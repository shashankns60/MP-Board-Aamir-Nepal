<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentResultRequest;
use App\Models\StudentResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentResultController extends Controller
{
    public function index(Request $request): View
    {
        $search = trim((string) $request->query('search', ''));
        $classFilter = trim((string) $request->query('class', ''));

        $students = StudentResult::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('roll_number', 'like', "%{$search}%")
                        ->orWhere('student_name', 'like', "%{$search}%")
                        ->orWhere('enrollment_number', 'like', "%{$search}%");
                });
            })
            ->when($classFilter !== '', fn ($query) => $query->where('class', $classFilter))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $classes = StudentResult::query()
            ->whereNotNull('class')
            ->distinct()
            ->orderBy('class')
            ->pluck('class');

        return view('admin.students.index', compact('students', 'search', 'classFilter', 'classes'));
    }

    public function create(): View
    {
        return view('admin.students.form', [
            'student' => new StudentResult([
                'maximum_marks' => 600,
                'result_status' => 'PASS',
                'status' => 'active',
                'subjects' => array_fill(0, 6, ['name' => '', 'theory' => '', 'practical' => '', 'total' => '']),
            ]),
            'mode' => 'create',
        ]);
    }

    public function store(StudentResultRequest $request): RedirectResponse
    {
        StudentResult::create($request->validatedPayload());

        return redirect()
            ->route('admin.students.index')
            ->with('success', 'Student result added successfully.');
    }

    public function edit(StudentResult $student): View
    {
        $subjects = $student->subjects ?? [];
        while (count($subjects) < 6) {
            $subjects[] = ['name' => '', 'theory' => '', 'practical' => '', 'total' => ''];
        }

        $student->subjects = $subjects;

        return view('admin.students.form', [
            'student' => $student,
            'mode' => 'edit',
        ]);
    }

    public function update(StudentResultRequest $request, StudentResult $student): RedirectResponse
    {
        $student->update($request->validatedPayload());

        return redirect()
            ->route('admin.students.index')
            ->with('success', 'Student result updated successfully.');
    }

    public function destroy(StudentResult $student): RedirectResponse
    {
        $student->delete();

        return redirect()
            ->route('admin.students.index')
            ->with('success', 'Student result deleted successfully.');
    }

    public function export(): StreamedResponse
    {
        $fileName = 'student-results-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'roll_number',
                'date_of_birth',
                'class',
                'enrollment_number',
                'student_name',
                'father_name',
                'mother_name',
                'school_name',
                'school_code',
                'examination_year',
                'subjects_json',
                'total_obtained',
                'maximum_marks',
                'percentage',
                'division',
                'result_status',
                'serial_number',
                'issue_date',
                'status',
            ]);

            StudentResult::query()->orderBy('id')->chunk(200, function ($chunk) use ($handle) {
                foreach ($chunk as $student) {
                    fputcsv($handle, [
                        $student->roll_number,
                        $student->date_of_birth?->format('Y-m-d'),
                        $student->class,
                        $student->enrollment_number,
                        $student->student_name,
                        $student->father_name,
                        $student->mother_name,
                        $student->school_name,
                        $student->school_code,
                        $student->examination_year,
                        json_encode($student->subjects ?? []),
                        $student->total_obtained,
                        $student->maximum_marks,
                        $student->percentage,
                        $student->division,
                        $student->result_status,
                        $student->serial_number,
                        $student->issue_date,
                        $student->status,
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
