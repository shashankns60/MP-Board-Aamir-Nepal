<?php

namespace App\Imports;

use App\Models\StudentResult;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentResultsImport implements ToCollection, WithHeadingRow
{
    public int $importedCount = 0;

    public int $skippedCount = 0;

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $payload = $this->mapRow($row->toArray());

            if (empty($payload['roll_number']) || empty($payload['date_of_birth']) || empty($payload['student_name'])) {
                continue;
            }

            $exists = StudentResult::query()
                ->where('roll_number', $payload['roll_number'])
                ->whereDate('date_of_birth', $payload['date_of_birth'])
                ->exists();

            if ($exists) {
                $this->skippedCount++;
                continue;
            }

            StudentResult::create($payload);
            $this->importedCount++;
        }
    }

    private function mapRow(array $row): array
    {
        $subjects = $this->parseSubjects($row);

        $dob = $this->parseDate($this->firstValue($row, [
            'date_of_birth',
            'dateofbirth',
            'dob',
            'date_of_birth_yyyy_mm_dd',
        ]));

        return [
            'roll_number' => (string) $this->firstValue($row, ['roll_number', 'rollnumber', 'roll_no', 'rollno']),
            'date_of_birth' => $dob,
            'class' => $this->firstValue($row, ['class', 'class_name']),
            'enrollment_number' => $this->firstValue($row, ['enrollment_number', 'enrollmentnumber']),
            'student_name' => $this->firstValue($row, ['student_name', 'studentname', 'name']),
            'father_name' => $this->firstValue($row, ['father_name', 'fathername']),
            'mother_name' => $this->firstValue($row, ['mother_name', 'mothername']),
            'school_name' => $this->firstValue($row, ['school_name', 'schoolname']),
            'school_code' => $this->toInt($this->firstValue($row, ['school_code', 'schoolcode'])),
            'examination_year' => $this->toInt($this->firstValue($row, ['examination_year', 'examinationyear', 'exam_year'])),
            'subjects' => $subjects,
            'total_obtained' => $this->toInt($this->firstValue($row, ['total_obtained', 'totalobtained', 'total_marks'])),
            'maximum_marks' => $this->toInt($this->firstValue($row, ['maximum_marks', 'maximummarks', 'max_marks'])) ?: 600,
            'percentage' => $this->toFloat($this->firstValue($row, ['percentage', 'percent'])),
            'division' => $this->firstValue($row, ['division']),
            'result_status' => $this->firstValue($row, ['result_status', 'resultstatus', 'status_result']) ?: 'PASS',
            'serial_number' => $this->toInt($this->firstValue($row, ['serial_number', 'serialnumber', 's_no'])),
            'issue_date' => $this->firstValue($row, ['issue_date', 'issuedate']),
            'status' => $this->firstValue($row, ['status', 'record_status']) ?: 'active',
        ];
    }

    private function parseSubjects(array $row): array
    {
        $json = $this->firstValue($row, ['subjects_json', 'subjects', 'subject_json']);
        if (is_string($json) && $json !== '') {
            $decoded = json_decode($json, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        $subjects = [];
        for ($i = 1; $i <= 8; $i++) {
            $name = $this->firstValue($row, ["subject{$i}_name", "subject_{$i}_name"]);
            if (! $name) {
                continue;
            }

            $subjects[] = [
                'name' => $name,
                'theory' => $this->toInt($this->firstValue($row, ["subject{$i}_theory", "subject_{$i}_theory"])),
                'practical' => $this->toInt($this->firstValue($row, ["subject{$i}_practical", "subject_{$i}_practical"])),
                'total' => $this->toInt($this->firstValue($row, ["subject{$i}_total", "subject_{$i}_total"])),
            ];
        }

        return $subjects;
    }

    private function firstValue(array $row, array $keys): mixed
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $row) && $row[$key] !== null && $row[$key] !== '') {
                return $row[$key];
            }
        }

        return null;
    }

    private function parseDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return Carbon::createFromTimestampUTC(((int) $value - 25569) * 86400)->format('Y-m-d');
        }

        try {
            return Carbon::parse((string) $value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function toInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function toFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }
}
