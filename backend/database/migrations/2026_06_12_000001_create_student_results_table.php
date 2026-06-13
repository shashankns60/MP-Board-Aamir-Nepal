<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_results', function (Blueprint $table) {
            $table->id();
            $table->string('roll_number', 20);
            $table->date('date_of_birth');
            $table->string('class', 10)->nullable();
            $table->string('enrollment_number')->nullable();
            $table->string('student_name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('school_name')->nullable();
            $table->unsignedInteger('school_code')->nullable();
            $table->unsignedSmallInteger('examination_year')->nullable();
            $table->json('subjects')->nullable();
            $table->unsignedSmallInteger('total_obtained')->nullable();
            $table->unsignedSmallInteger('maximum_marks')->default(600);
            $table->decimal('percentage', 8, 4)->nullable();
            $table->string('division')->nullable();
            $table->string('result_status')->default('PASS');
            $table->unsignedInteger('serial_number')->nullable();
            $table->string('issue_date')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['roll_number', 'date_of_birth'], 'student_results_roll_dob_unique');
            $table->index('roll_number');
            $table->index('student_name');
            $table->index('class');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_results');
    }
};
