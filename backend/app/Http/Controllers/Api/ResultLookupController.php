<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultLookupController extends Controller
{
    public function lookup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rollNumber' => ['required', 'string', 'max:20'],
            'dateOfBirth' => ['required', 'date'],
        ]);

        $student = StudentResult::findByRollAndDob(
            $validated['rollNumber'],
            $validated['dateOfBirth']
        );

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'No marksheet found for the given Roll Number and Date of Birth.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student->toFrontendArray(),
        ]);
    }
}
