// ==============================
// DiscordIDModal.jsx
// Modal for Assigning Discord Channel ID
// ==============================

import { useEffect, useRef, useState } from "react";

export default function DiscordIDModal({
  isOpen,
  onClose,
  onSave,
  existingId = "",
  job,
  getCustomerLogo
}) {
  const [channelId, setChannelId] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setChannelId(existingId || "");
      setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    }
  }, [isOpen, existingId]);

  if (!isOpen) return null;

  const customerLogoPath = job?.customer
    ? (getCustomerLogo ? getCustomerLogo(job.customer) : `/assets/logos/${job.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-black border-4 border-[#6a7257] rounded-2xl p-8 w-[380px] shadow-2xl flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-3xl text-[#6a7257] hover:text-red-600 font-bold focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col items-center w-full">
          {/* Discord Icon */}
          <img
            src="/assets/discord.png"
            alt="Discord"
            className="mb-3"
            style={{ width: "60px", height: "50px" }}
          />

          <h2 className="text-base font-erbaum text-[#6a7257] mb-3 mt-1 uppercase text-center">
            Assign Discord Channel:
          </h2>

          {/* Customer Info */}
          {customerLogoPath && (
            <img
              src={customerLogoPath}
              alt={`${job.customer} logo`}
              className="h-10 w-auto object-contain rounded mb-2"
              style={{ maxWidth: "96px", background: "transparent" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div className="text-white font-bold text-[1.05rem] text-center">
            {job?.customer || ""}
          </div>
          <div className="text-white/70 text-sm mb-4 text-center">
            {job?.surface_lsd || ""}
          </div>

          {/* Label */}
          <label
            className="w-full text-center text-sm mb-1 text-white/80 font-erbaum"
            htmlFor="discord-id-input"
          >
            Discord Channel ID
          </label>

          {/* Input */}
          <input
            id="discord-id-input"
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 mb-3 rounded bg-[#232429] text-[#b6b6b6] border border-[#353a3f] focus:outline-none focus:border-[#6a7257] font-mono font-bold text-base"
            placeholder="e.g. 122959480021529601"
            value={channelId}
            onChange={(e) =>
              setChannelId(e.target.value.replace(/[^0-9]/g, ""))
            }
            maxLength={32}
            autoFocus
            spellCheck={false}
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-2 w-full justify-center">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-zinc-800 text-white font-erbaum font-bold hover:bg-zinc-900 border border-zinc-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!channelId) return;
                onSave(channelId);
              }}
              className="px-4 py-1.5 rounded bg-[#6a7257] text-black font-erbaum font-bold hover:bg-[#79835e] border border-[#6a7257] transition disabled:bg-[#444] disabled:text-gray-400"
              disabled={!channelId}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
