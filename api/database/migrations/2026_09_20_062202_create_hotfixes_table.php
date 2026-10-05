<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotfixes', function (Blueprint $table) {
            $table->id();

            $table->string('pc_name');
            $table->string('hotfix_id');
            $table->date('installed_date')->nullable();

            $table->timestamps();

            $table->index('pc_name');
            $table->index('hotfix_id');

            $table->foreign('pc_name')
                ->references('pc_name')
                ->on('machines')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotfixes');
    }
};