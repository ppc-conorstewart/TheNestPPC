// ==============================
// JobUpdateForm.jsx — Main Job Update Fields (No Equipment Section)
// ==============================
import { useEffect, useState } from "react";

export default function JobUpdateForm({
  form,
  handleChange,
  handleSubmit,
  showEquipList,
  selectedJob
}) {
  const [zoneNameStyle, setZoneNameStyle] = useState("alpha");

  // Always up-to-date well count
  const totalWells =
    (selectedJob &&
      (selectedJob.num_wells ||
        selectedJob.totalWells ||
        selectedJob.well_count ||
        selectedJob.wells)) ||
    5;

  // Build zone names dynamically per toggle and well count
  const zoneNames =
    zoneNameStyle === "alpha"
      ? Array.from({ length: totalWells }, (_, i) =>
          String.fromCharCode(65 + i)
        )
      : Array.from({ length: totalWells }, (_, i) => (i + 1).toString());

  const getZoneFieldName = (idx) =>
    zoneNameStyle === "alpha"
      ? `${String.fromCharCode(97 + idx)}Zone`
      : `zone${idx + 1}`;

  // Optionally reset unused fields if well count drops (not required for display logic)
  useEffect(() => {
    // Optional: clean up form state when well count changes.
  }, [totalWells, zoneNameStyle, selectedJob]);

  return (
    <form
      className="flex-1 overflow-y-auto px-6 pb-4 pt-0"
      onSubmit={handleSubmit}
      style={{
        maxHeight: "calc(92vh - 74px)",
        minHeight: 0,
        overscrollBehavior: "contain",
        borderBottomLeftRadius: "15px",
        borderBottomRightRadius: "15px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* OPERATIONAL UPDATE + SHIFT SELECTOR */}
      <div className="mb-2 flex flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-[11px] font-semibold mb-1 uppercase">
            Update Style:
          </label>
          <select
            name="operationalState"
            value={form.operationalState}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 bg-black text-white text-[13px] h-7"
            required
          >
            <option value="">Select Status...</option>
            {["Operational", "Rig IN", "Rig Out", "Standby"].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "145px" }}>
          <label className="block text-[11px] font-semibold mb-1 uppercase">
            Shift:
          </label>
          <select
            name="shift"
            value={form.shift || ""}
            onChange={handleChange}
            className="w-full rounded border px-2 py-1 bg-black text-white text-[13px] h-7"
            required
          >
            <option value="">Select Shift...</option>
            <option value="DayShift">DayShift</option>
            <option value="NightShift">NightShift</option>
          </select>
        </div>
      </div>
      {/* WSM's with INLINE STARS/INCIDENT/HAZARD/OBSERVATIONS */}
      <div className="mb-2 flex flex-row gap-3 items-end">
        <div className="flex flex-row gap-2">
          <input
            name="wsm1"
            value={form.wsm1}
            onChange={handleChange}
            className="rounded border px-2 py-1 bg-black text-white text-[13px] w-28 h-7"
            placeholder="WSM 1"
            type="text"
          />
          <input
            name="wsm2"
            value={form.wsm2}
            onChange={handleChange}
            className="rounded border px-2 py-1 bg-black text-white text-[13px] w-28 h-7"
            placeholder="WSM 2"
            type="text"
          />
          <input
            name="wsm3"
            value={form.wsm3}
            onChange={handleChange}
            className="rounded border px-2 py-1 bg-black text-white text-[13px] w-28 h-7"
            placeholder="WSM 3"
            type="text"
          />
        </div>
        <div className="flex flex-row gap-3 ml-4">
          <div>
            <label className="block text-center text-[10px] font-semibold mb-1 uppercase">
              Stars Site #
            </label>
            <input
              name="stars"
              value={form.stars}
              onChange={handleChange}
              className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
              placeholder="#"
              style={{ minWidth: 48, textAlign: "center" }}
              type="number"
              min={0}
            />
          </div>
          <div>
            <label className="block text-center text-[10px] font-semibold mb-1 uppercase">
              Incident #
            </label>
            <input
              name="incident"
              value={form.incident}
              onChange={handleChange}
              className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
              placeholder="#"
              style={{ minWidth: 48, textAlign: "center" }}
              type="number"
              min={0}
            />
          </div>
          <div>
            <label className="block text-center text-[10px] font-semibold mb-1 uppercase">
              Hazard ID's #
            </label>
            <input
              name="hazardIds"
              value={form.hazardIds}
              onChange={handleChange}
              className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
              placeholder="#"
              style={{ minWidth: 48, textAlign: "center" }}
              type="number"
              min={0}
            />
          </div>
          <div>
            <label className="block text-center text-[10px] font-semibold mb-1 uppercase">
              Observations #
            </label>
            <input
              name="observations"
              value={form.observations}
              onChange={handleChange}
              className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
              placeholder="#"
              style={{ minWidth: 48, textAlign: "center" }}
              type="number"
              min={0}
            />
          </div>
        </div>
      </div>
      {/* FRACS OPENED + ZONES ROW */}
      <div className="flex flex-row gap-3 items-end mb-2">
        <div>
          <label className="block text-[10px] font-semibold mb-1 uppercase">
            Fracs Opened #
          </label>
          <input
            name="fracsOpened"
            value={form.fracsOpened}
            onChange={handleChange}
            className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
            placeholder="#"
            style={{ minWidth: 48, textAlign: "center" }}
            type="number"
            min={0}
          />
        </div>
        <div className="flex flex-col items-center">
          <label
            className="block text-[11px] font-bold uppercase pb-1"
            style={{ minWidth: 60 }}
          >
            Total Zones
          </label>
          <input
            name="totalZones"
            value={form.totalZones}
            onChange={handleChange}
            placeholder="X/X"
            className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-16 h-7"
            style={{ minWidth: 56, textAlign: "center" }}
          />
        </div>
        {/* ZONE LABELS & TOGGLE (INLINE) */}
        <div className="flex flex-row items-end ml-3 gap-0">
          {/* Zone Letters/Numbers */}
          {zoneNames.map((zone, idx) => (
            <div className="flex flex-col items-center" key={zone}>
              <label
                className="block text-[11px] font-bold uppercase pb-1 text-center"
                style={{ width: 44 }}
              >
                {zone}
              </label>
              <input
                name={getZoneFieldName(idx)}
                value={form[getZoneFieldName(idx)] || ""}
                onChange={handleChange}
                placeholder="X/X"
                className="rounded border px-2 py-0.5 bg-black text-white text-[12px] w-12 h-7 text-center"
                style={{ minWidth: 44, textAlign: "center" }}
              />
            </div>
          ))}
          {/* Inline Zone Toggle */}
          <button
            type="button"
            onClick={() =>
              setZoneNameStyle((prev) =>
                prev === "alpha" ? "numeric" : "alpha"
              )
            }
            className="rounded border border-[#6a7257] px-2 py-0 text-white text-[10px] bg-[#23281c] hover:bg-[#35392e] transition ml-4"
            style={{ minWidth: 60, height: 18, alignSelf: "flex-start" }}
            tabIndex={0}
            aria-label="Toggle Naming"
          >
            {zoneNameStyle === "alpha" ? "A/B/C" : "1/2/3"}
          </button>
        </div>
      </div>
      {/* Notes sections - stacked, with much larger textareas */}
      <div className="flex flex-col gap-1 mt-2">
        <div>
          <label className="block text-[11px] font-semibold text-center mb-0 uppercase">
            Operational Notes
          </label>
          <textarea
            name="operationalNotes"
            value={form.operationalNotes}
            onChange={handleChange}
            className="w-full rounded border px-2 py-2 bg-black text-white text-[14px]"
            rows={5}
            placeholder="Notes"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-0 text-center uppercase">
            Paloma Notes
          </label>
          <textarea
            name="palomaNotes"
            value={form.palomaNotes}
            onChange={handleChange}
            className="w-full rounded border px-2 py-0 bg-black text-white text-[14px]"
            rows={5}
            placeholder="Notes"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-center mb-0 uppercase">
            Cross Shift Notes
          </label>
          <textarea
            name="crossShiftNotes"
            value={form.crossShiftNotes}
            onChange={handleChange}
            className="w-full rounded border px-2 py-0 bg-black text-white text-[14px]"
            rows={5}
            placeholder="Notes"
          />
        </div>
      </div>
    </form>
  );
}
