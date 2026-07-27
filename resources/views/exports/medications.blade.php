<table>
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Laboratorio</th>
            <th>Presentación</th>
            <th>Lote</th>
            <th>Stock</th>
            <th>Stock Mínimo</th>
            <th>Precio Unitario</th>
            <th>Vencimiento</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($medications as $med)
            <tr>
                <td>{{ $med->name }}</td>
                <td>{{ $med->laboratory ?? '—' }}</td>
                <td>{{ $med->presentation ?? '—' }}</td>
                <td>{{ $med->lot_number ?? '—' }}</td>
                <td>{{ $med->quantity }}</td>
                <td>{{ $med->min_stock }}</td>
                <td>{{ $med->unit_price ? '$' . number_format($med->unit_price, 2) : '—' }}</td>
                <td>{{ $med->expiration_date?->format('d/m/Y') ?? '—' }}</td>
                <td>
                    @php
                        $expired = $med->expiration_date?->isPast() ?? false;
                        $expiringSoon = $med->expiration_date?->isFuture() && $med->expiration_date->diffInDays(now()) <= 30;
                        $lowStock = $med->quantity <= $med->min_stock;
                    @endphp
                    {{ match (true) {
                        $expired || $med->quantity === 0 => 'Vencido / Sin stock',
                        $lowStock && $expiringSoon => 'Stock bajo / Por vencer',
                        $lowStock => 'Stock bajo',
                        $expiringSoon => 'Por vencer',
                        default => 'Disponible',
                    } }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>
