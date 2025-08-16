// ==============================
// ImageUploadRow.jsx — Attach Images & Submit Row
// ==============================
export default function ImageUploadRow({
  form,
  fileInputRef,
  handleFileChange,
  removeImage,
  handleSubmit
}) {
  return (
    <>
      <div className="flex flex-row items-center mt-0">
        <div className="flex flex-row ml-6 items-center gap-2 flex-1">
          <label className="block text-[11px] font-semibold mb-1 uppercase">
            Attach Images
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-4 py-0 rounded bg-black text-[#6a7257] text-xs font-bold border border-[#6a7257] hover:bg-[#23281c] hover:text-[#b0b79f] shadow transition"
            style={{ letterSpacing: ".04em", marginLeft: 8 }}
          >
            Attach Images
          </button>
          <span className="text-[#6a7257] text-sm">
            {form.images.length === 0 ? "No Images Attached" : `${form.images.length} Image${form.images.length > 1 ? "s" : ""} Attached`}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="flex-shrink-0">
          <button
            type="submit"
            className="bg-[#6a7257] text-black font-bold px-4 mr-6 py-0 rounded-lg shadow-lg hover:bg-[#b0b79f] transition ml-2"
            style={{ fontSize: 16, letterSpacing: "0.04em" }}
            onClick={handleSubmit}
          >
            ☑ Submit Update
          </button>
        </div>
      </div>
      {/* Image thumbnails */}
      <div className="flex flex-wrap gap-2 mt-1">
        {form.images.map((file, idx) => (
          <div key={idx} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={`img-${idx}`}
              className="w-16 h-16 object-cover rounded shadow border"
              style={{ borderColor: "#6a7257" }}
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center"
              style={{ fontSize: 16 }}
              onClick={() => removeImage(idx)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
