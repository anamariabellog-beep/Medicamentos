<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity_adjusted');
            $table->string('type'); // entry, adjustment
            $table->string('reason')->nullable();
            $table->timestamp('adjusted_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_stock_adjustments');
    }
};
