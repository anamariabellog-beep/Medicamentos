<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('laboratory')->nullable();
            $table->string('presentation')->nullable();
            $table->string('lot_number')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('min_stock')->default(5);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->date('expiration_date')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};
