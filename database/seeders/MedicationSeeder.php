<?php

namespace Database\Seeders;

use App\Models\Medication;
use Illuminate\Database\Seeder;

class MedicationSeeder extends Seeder
{
    public function run(): void
    {
        $medications = [
            ['name' => 'Paracetamol 500mg', 'laboratory' => 'Bayer', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-001', 'quantity' => 200, 'min_stock' => 50, 'unit_price' => 0.50, 'expiration_date' => '2027-06-15'],
            ['name' => 'Ibuprofeno 400mg', 'laboratory' => 'Pfizer', 'presentation' => 'Cápsulas', 'lot_number' => 'LOT-002', 'quantity' => 150, 'min_stock' => 40, 'unit_price' => 0.75, 'expiration_date' => '2026-11-20'],
            ['name' => 'Amoxicilina 500mg', 'laboratory' => 'GSK', 'presentation' => 'Cápsulas', 'lot_number' => 'LOT-003', 'quantity' => 5, 'min_stock' => 30, 'unit_price' => 1.20, 'expiration_date' => '2027-03-10'],
            ['name' => 'Loratadina 10mg', 'laboratory' => 'Schering-Plough', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-004', 'quantity' => 80, 'min_stock' => 20, 'unit_price' => 0.90, 'expiration_date' => '2026-09-05'],
            ['name' => 'Omeprazol 20mg', 'laboratory' => 'AstraZeneca', 'presentation' => 'Cápsulas', 'lot_number' => 'LOT-005', 'quantity' => 3, 'min_stock' => 25, 'unit_price' => 1.10, 'expiration_date' => '2027-01-22'],
            ['name' => 'Salbutamol Inhalador', 'laboratory' => 'GSK', 'presentation' => 'Inhalador 200 dosis', 'lot_number' => 'LOT-006', 'quantity' => 10, 'min_stock' => 15, 'unit_price' => 8.50, 'expiration_date' => '2025-12-01'],
            ['name' => 'Metformina 850mg', 'laboratory' => 'Merck', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-007', 'quantity' => 120, 'min_stock' => 30, 'unit_price' => 0.60, 'expiration_date' => '2027-08-18'],
            ['name' => 'Enapril 10mg', 'laboratory' => 'Roche', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-008', 'quantity' => 0, 'min_stock' => 20, 'unit_price' => 0.85, 'expiration_date' => '2026-05-30'],
            ['name' => 'Diclofenaco 75mg', 'laboratory' => 'Novartis', 'presentation' => 'Ampollas', 'lot_number' => 'LOT-009', 'quantity' => 5, 'min_stock' => 10, 'unit_price' => 1.50, 'expiration_date' => '2024-02-14'],
            ['name' => 'Cetirizina 10mg', 'laboratory' => 'UCB', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-010', 'quantity' => 60, 'min_stock' => 15, 'unit_price' => 0.70, 'expiration_date' => '2026-08-15'],
            ['name' => 'Dexametasona 4mg', 'laboratory' => 'Sanofi', 'presentation' => 'Ampollas', 'lot_number' => 'LOT-011', 'quantity' => 25, 'min_stock' => 10, 'unit_price' => 2.00, 'expiration_date' => '2025-10-10'],
            ['name' => 'Azitromicina 500mg', 'laboratory' => 'Pfizer', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-012', 'quantity' => 40, 'min_stock' => 20, 'unit_price' => 3.50, 'expiration_date' => '2026-08-10'],
            ['name' => 'Hidroxicloroquina 200mg', 'laboratory' => 'Sanofi', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-013', 'quantity' => 2, 'min_stock' => 15, 'unit_price' => 2.80, 'expiration_date' => '2026-02-18'],
            ['name' => 'Losartán 50mg', 'laboratory' => 'Merck', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-014', 'quantity' => 90, 'min_stock' => 25, 'unit_price' => 0.65, 'expiration_date' => '2027-11-30'],
            ['name' => 'Prednisona 20mg', 'laboratory' => 'Roche', 'presentation' => 'Tabletas', 'lot_number' => 'LOT-015', 'quantity' => 0, 'min_stock' => 15, 'unit_price' => 0.95, 'expiration_date' => '2026-04-12'],
        ];

        foreach ($medications as $medication) {
            Medication::create($medication);
        }
    }
}
