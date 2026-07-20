"use client";

import { useEffect, useState } from "react";

const countdownUnits = [
  { label: "hari", duration: 86_400_000 },
  { label: "jam", duration: 3_600_000 },
  { label: "menit", duration: 60_000 },
] as const;

export function Countdown({ date }: { date: Date }) {
  const target = date.getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const id = window.setInterval(update, 1_000);
    return () => window.clearInterval(id);
  }, [target]);

  const values = remaining === null
    ? [null, null, null]
    : [
        Math.floor(remaining / countdownUnits[0].duration),
        Math.floor((remaining % countdownUnits[0].duration) / countdownUnits[1].duration),
        Math.floor((remaining % countdownUnits[1].duration) / countdownUnits[2].duration),
      ];

  return (
    <div aria-live="polite" className="mt-6 flex justify-center gap-3">
      {countdownUnits.map((unit, index) => (
        <div className="invite-card min-w-18" key={unit.label}>
          <strong className="block text-xl">{values[index] ?? "–"}</strong>
          <span className="text-xs opacity-70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
