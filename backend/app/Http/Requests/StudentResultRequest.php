<?php

namespace App\Http\Requests;

use App\Models\StudentResult;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student')?->id;

        return [
            'roll_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('student_results', 'roll_number')
                    ->where(fn ($query) => $query->where('date_of_birth', $this->input('date_of_birth')))
                    ->ignore($studentId),
            ],
            'date_of_birth' => ['required', 'date'],
            'class' => ['nullable', 'string', 'max:10'],
            'enrollment_number' => ['nullable', 'string', 'max:100'],
            'student_name' => ['required', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'mother_name' => ['nullable', 'string', 'max:255'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'school_code' => ['nullable', 'integer'],
            'examination_year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
            'subjects' => ['nullable', 'array'],
            'subjects.*.name' => ['required_with:subjects', 'string', 'max:100'],
            'subjects.*.theory' => ['nullable', 'numeric'],
            'subjects.*.practical' => ['nullable', 'numeric'],
            'subjects.*.total' => ['nullable', 'numeric'],
            'total_obtained' => ['nullable', 'integer', 'min:0'],
            'maximum_marks' => ['nullable', 'integer', 'min:1'],
            'percentage' => ['nullable', 'numeric', 'min:0'],
            'division' => ['nullable', 'string', 'max:50'],
            'result_status' => ['nullable', 'string', 'max:50'],
            'serial_number' => ['nullable', 'integer'],
            'issue_date' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'string', 'in:active,on_leave'],
        ];
    }

    public function validatedPayload(): array
    {
        $data = $this->validated();
        $subjects = collect($data['subjects'] ?? [])
            ->filter(fn ($subject) => ! empty($subject['name']))
            ->map(function (array $subject) {
                return [
                    'name' => $subject['name'],
                    'theory' => $this->nullableNumber($subject['theory'] ?? null),
                    'practical' => $this->nullableNumber($subject['practical'] ?? null),
                    'total' => $this->nullableNumber($subject['total'] ?? null),
                ];
            })
            ->values()
            ->all();

        $data['subjects'] = $subjects;

        if (empty($data['percentage']) && ! empty($data['total_obtained']) && ! empty($data['maximum_marks'])) {
            $data['percentage'] = round($data['total_obtained'] / $data['maximum_marks'], 4);
        }

        return $data;
    }

    private function nullableNumber(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }
}
