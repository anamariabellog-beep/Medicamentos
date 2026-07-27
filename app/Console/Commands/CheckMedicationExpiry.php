<?php

namespace App\Console\Commands;

use App\Models\Medication;
use App\Models\User;
use App\Notifications\MedicationExpiryAlert;
use Illuminate\Console\Command;

class CheckMedicationExpiry extends Command
{
    protected $signature = 'medications:check-expiry';
    protected $description = 'Check for expired or soon-to-expire medications and notify users';

    public function handle(): void
    {
        $now = now();
        $users = User::all();

        Medication::whereDate('expiration_date', '<', $now)
            ->chunk(100, function ($medications) use ($users) {
                foreach ($medications as $med) {
                    foreach ($users as $user) {
                        $user->notify(new MedicationExpiryAlert(
                            medication: $med,
                            type: 'expired',
                            daysLeft: 0,
                        ));
                    }
                }
            });

        Medication::whereDate('expiration_date', '>', $now)
            ->whereDate('expiration_date', '<=', $now->addDays(15))
            ->chunk(100, function ($medications) use ($users) {
                foreach ($medications as $med) {
                    $daysLeft = (int) $now->diffInDays($med->expiration_date);
                    foreach ($users as $user) {
                        $user->notify(new MedicationExpiryAlert(
                            medication: $med,
                            type: 'expiring',
                            daysLeft: $daysLeft,
                        ));
                    }
                }
            });

        $this->info('Medication expiry check completed.');
    }
}
