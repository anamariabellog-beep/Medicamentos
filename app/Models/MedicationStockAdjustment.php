<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicationStockAdjustment extends Model
{
    protected $fillable = [
        'medication_id',
        'quantity_adjusted',
        'type',
        'reason',
        'adjusted_at',
    ];

    protected function casts(): array
    {
        return [
            'adjusted_at' => 'datetime',
        ];
    }

    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }
}
