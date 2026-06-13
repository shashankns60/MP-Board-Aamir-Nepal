<?php

namespace Database\Seeders;

use App\Models\StudentResult;
use Illuminate\Database\Seeder;

class StudentResultSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = env(
            'MPBSE_JSON_SEED_PATH',
            dirname(base_path(), 2).DIRECTORY_SEPARATOR.'mpbse.org'.DIRECTORY_SEPARATOR.'resources'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'results-2026-jun.json'
        );

        if (! is_file($jsonPath)) {
            $jsonPath = dirname(base_path()).'/resources/data/results-2026-jun.json';
        }

        if (! is_file($jsonPath)) {
            return;
        }

        $records = json_decode(file_get_contents($jsonPath), true);

        if (! is_array($records)) {
            return;
        }

        foreach ($records as $record) {
            StudentResult::query()->updateOrCreate(
                [
                    'roll_number' => (string) ($record['rollNumber'] ?? ''),
                    'date_of_birth' => $record['dateOfBirth'] ?? null,
                ],
                [
                    'class' => $record['class'] ?? null,
                    'enrollment_number' => $record['enrollmentNumber'] ?? null,
                    'student_name' => $record['studentName'] ?? 'Unknown',
                    'father_name' => $record['fatherName'] ?? null,
                    'mother_name' => $record['motherName'] ?? null,
                    'school_name' => $record['schoolName'] ?? null,
                    'school_code' => $record['schoolCode'] ?? null,
                    'examination_year' => $record['examinationYear'] ?? null,
                    'subjects' => $record['subjects'] ?? [],
                    'total_obtained' => $record['totalObtained'] ?? null,
                    'maximum_marks' => $record['maximumMarks'] ?? 600,
                    'percentage' => $record['percentage'] ?? null,
                    'division' => $record['division'] ?? null,
                    'result_status' => $record['resultStatus'] ?? 'PASS',
                    'serial_number' => $record['serialNumber'] ?? null,
                    'issue_date' => $record['issueDate'] ?? null,
                    'status' => 'active',
                ]
            );
        }
    }
}
