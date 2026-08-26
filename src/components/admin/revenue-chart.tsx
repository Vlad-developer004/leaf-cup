export function RevenueChart({
  data,
  title,
}: {
  data: { date: string; amount: number }[];
  title: string;
}) {
  const width = 640;
  const height = 160;
  const padding = 8;
  const max = Math.max(1, ...data.map((d) => d.amount));
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding + i * step;
    const y = height - padding - (d.amount / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${height - padding} L${points[0].x},${height - padding} Z`
      : "";

  return (
    <div className="rounded-xl border p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{title}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        {areaPath && <path d={areaPath} fill="var(--primary)" opacity={0.08} />}
        {linePath && (
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} />
        )}
        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r={2.5} fill="var(--primary)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
