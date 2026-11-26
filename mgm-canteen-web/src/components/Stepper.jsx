// The − 2 + control used on the menu and in the cart.
export default function Stepper({ value, onChange, max = 20, label }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Remove one ${label}`}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Add one ${label}`}>+</button>
    </div>
  );
}
