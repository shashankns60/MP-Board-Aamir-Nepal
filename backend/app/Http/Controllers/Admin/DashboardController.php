<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentResult;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $totalStudents = StudentResult::count();
        $recentStudents = StudentResult::query()
            ->latest()
            ->limit(8)
            ->get();

        return view('admin.dashboard', compact('totalStudents', 'recentStudents'));
    }
}
