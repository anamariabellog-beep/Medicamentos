<?php

namespace App\Exports;

use App\Models\Medication;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class MedicationsExport implements FromView, WithTitle, ShouldAutoSize
{
    public function view(): View
    {
        return view('exports.medications', [
            'medications' => Medication::orderByStatusPriority()->get(),
        ]);
    }

    public function title(): string
    {
        return 'Medicamentos';
    }
}
