<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();

            $table->string('pc_name')->unique();
            $table->string('department')->nullable();
            $table->string('os_name')->nullable();
            $table->string('cpu')->nullable();

            $table->unsignedInteger('cpu_cores')->nullable();
            $table->unsignedInteger('ram_gb')->nullable();
            $table->unsignedInteger('storage_gb')->nullable();

            $table->unsignedInteger('hotfix_count')->default(0);
            $table->unsignedInteger('software_count')->default(0);
            $table->unsignedInteger('vuln_count')->default(0);

            $table->boolean('has_critical_vuln')->default(false);
            $table->string('patch_status')->nullable();
            $table->boolean('risky_software_present')->default(false);

            $table->timestamps();

            $table->index('department');
            $table->index('patch_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};