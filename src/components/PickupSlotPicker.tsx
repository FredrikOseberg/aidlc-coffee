import type { PickupSlot } from '../lib/pickupSlots';

type Props = { slots: PickupSlot[]; selected: string | null; onSelect: (startIso: string) => void };

export function PickupSlotPicker({ slots, selected, onSelect }: Props) {
  return (
    <fieldset className="pickup-slots">
      <legend>Pickup time</legend>
      <div className="pickup-slots-row">
        {slots.map((slot) => (
          <button
            key={slot.startIso}
            type="button"
            className={`pickup-slot ${selected === slot.startIso ? 'selected' : ''}`}
            aria-pressed={selected === slot.startIso}
            onClick={() => onSelect(slot.startIso)}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
