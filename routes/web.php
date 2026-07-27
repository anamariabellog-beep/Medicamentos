<?php

use App\Http\Controllers\MedicationController;
use App\Models\Medication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $meds = Medication::all();
        $now = now();
        return Inertia::render('dashboard', [
            'medicationStats' => [
                'total' => $meds->count(),
                'expired' => $meds->filter(fn($m) => $m->expiration_date?->isPast())->count(),
                'expiring' => $meds->filter(fn($m) => $m->expiration_date?->isFuture() && $m->expiration_date->diffInDays($now) <= 30)->count(),
                'low_stock' => $meds->filter(fn($m) => $m->quantity > 0 && $m->quantity <= $m->min_stock)->count(),
                'out_of_stock' => $meds->filter(fn($m) => $m->quantity === 0)->count(),
            ],
        ]);
    })->name('dashboard');

    Route::prefix('farmacia')->name('farmacia.')->group(function () {
        Route::get('/', [MedicationController::class, 'index'])->name('index');
        Route::post('/', [MedicationController::class, 'store'])->name('store');
        Route::put('/{medication}', [MedicationController::class, 'update'])->name('update');
        Route::delete('/{medication}', [MedicationController::class, 'destroy'])->name('destroy');
        Route::post('/{medication}/remove', [MedicationController::class, 'remove'])->name('remove');
        Route::get('/exportar', [MedicationController::class, 'export'])->name('export');
        Route::post('/{medication}/ajustar-stock', [MedicationController::class, 'adjustStock'])->name('adjustStock');
        Route::get('/bajas', [MedicationController::class, 'history'])->name('history');
    });
});

require __DIR__.'/settings.php';
