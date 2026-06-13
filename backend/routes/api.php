<?php

use App\Http\Controllers\Api\ResultLookupController;
use Illuminate\Support\Facades\Route;

Route::post('/results/lookup', [ResultLookupController::class, 'lookup']);
