export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={`h-1 flex-1 rounded-full ${index < step ? "bg-auwn-accent" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}
