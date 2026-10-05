<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vulnerabilities', function (Blueprint $table) {
            $table->id();

            $table->string('pc_name');
            $table->string('cve_id');
            $table->string('severity');
            $table->string('status');

            $table->timestamps();

            $table->index('pc_name');
            $table->index('cve_id');
            $table->index('severity');
            $table->index('status');

            $table->foreign('pc_name')
                ->references('pc_name')
                ->on('machines')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vulnerabilities');
    }
};