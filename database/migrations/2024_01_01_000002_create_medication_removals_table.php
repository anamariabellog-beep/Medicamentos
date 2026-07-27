<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_removals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
            $table->string('reason');
            $table->integer('quantity_removed')->default(0);
            $table->timestamp('removed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_removals');
    }
};
