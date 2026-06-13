<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\StudentResultsImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function create(): View
    {
        return view('admin.import.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $import = new StudentResultsImport;
        Excel::import($import, $request->file('file'));

        return redirect()
            ->route('admin.students.index')
            ->with('success', sprintf(
                'Import finished. %d imported, %d skipped (duplicates).',
                $import->importedCount,
                $import->skippedCount
            ));
    }
}
