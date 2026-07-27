<?php

namespace App\Notifications;

use App\Models\Medication;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MedicationExpiryAlert extends Notification
{
    use Queueable;

    public function __construct(
        public Medication $medication,
        public string $type,
        public int $daysLeft,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'medication_id' => $this->medication->id,
            'medication_name' => $this->medication->name,
            'type' => $this->type,
            'days_left' => $this->daysLeft,
            'expiration_date' => $this->medication->expiration_date?->format('d/m/Y'),
            'message' => $this->type === 'expired'
                ? "El medicamento {$this->medication->name} ha vencido."
                : "El medicamento {$this->medication->name} vence en {$this->daysLeft} días.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
