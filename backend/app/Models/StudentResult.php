<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentResult extends Model
{
    protected $fillable = [
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
        'subjects',
        'total_obtained',
        'maximum_marks',
        'percentage',
        'division',
        'result_status',
        'serial_number',
        'issue_date',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'subjects' => 'array',
        'school_code' => 'integer',
        'examination_year' => 'integer',
        'total_obtained' => 'integer',
        'maximum_marks' => 'integer',
        'percentage' => 'float',
        'serial_number' => 'integer',
    ];

    public static function normalizeRoll(?string $value): string
    {
        return ltrim(trim((string) $value), '0') ?: '0';
    }

    public function toFrontendArray(): array
    {
        return [
            'rollNumber' => $this->roll_number,
            'dateOfBirth' => $this->date_of_birth?->format('Y-m-d'),
            'class' => $this->class,
            'enrollmentNumber' => $this->enrollment_number,
            'studentName' => $this->student_name,
            'fatherName' => $this->father_name,
            'motherName' => $this->mother_name,
            'schoolName' => $this->school_name,
            'schoolCode' => $this->school_code,
            'examinationYear' => $this->examination_year,
            'subjects' => $this->subjects ?? [],
            'totalObtained' => $this->total_obtained,
            'maximumMarks' => $this->maximum_marks,
            'percentage' => $this->percentage,
            'division' => $this->division,
            'resultStatus' => $this->result_status,
            'serialNumber' => $this->serial_number,
            'issueDate' => $this->issue_date,
        ];
    }

    public static function findByRollAndDob(string $rollNumber, string $dateOfBirth): ?self
    {
        $normalizedRoll = self::normalizeRoll($rollNumber);

        return self::query()
            ->whereDate('date_of_birth', $dateOfBirth)
            ->get()
            ->first(fn (self $student) => self::normalizeRoll($student->roll_number) === $normalizedRoll);
    }
}
