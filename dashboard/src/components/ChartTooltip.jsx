function formatValue(value) {
    if (typeof value === 'number') {
        return value.toLocaleString();
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue)
        ? String(value ?? '')
        : numericValue.toLocaleString();
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];
    const displayLabel =
        label ||
        item?.payload?.name ||
        item?.payload?.severity ||
        item?.payload?.patch_status ||
        item?.payload?.department ||
        item?.payload?.os_name ||
        item?.name ||
        'Value';

    return (
        <div className="chart-tooltip">
            <span>{displayLabel}</span>
            <strong>{formatValue(item.value)}</strong>
        </div>
    );
}

export default ChartTooltip;
