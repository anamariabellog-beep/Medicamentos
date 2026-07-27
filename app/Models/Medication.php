<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medication extends Model
{
    protected $fillable = [
        'name',
        'laboratory',
        'presentation',
        'lot_number',
        'quantity',
        'min_stock',
        'unit_price',
        'expiration_date',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'expiration_date' => 'date',
            'is_active' => 'boolean',
            'unit_price' => 'decimal:2',
        ];
    }

    public function removals(): HasMany
    {
        return $this->hasMany(MedicationRemoval::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(MedicationStockAdjustment::class);
    }

    public function scopeOrderByStatusPriority(Builder $query): void
    {
        $query->orderByRaw(
            "CASE
                WHEN expiration_date < CURDATE() OR quantity = 0 THEN 0
                WHEN expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) OR quantity <= min_stock THEN 1
                ELSE 2
            END"
        )->orderBy('name');
    }
}
