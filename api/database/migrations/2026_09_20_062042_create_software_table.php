<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('software', function (Blueprint $table) {
            $table->id();

            $table->string('pc_name');
            $table->string('name');
            $table->string('version')->nullable();
            $table->string('category')->default('Unknown');

            $table->timestamps();

            $table->index('pc_name');
            $table->index('category');

            $table->foreign('pc_name')
                ->references('pc_name')
                ->on('machines')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('software');
    }
};