// ==============================
// CustomerProgramInfo.jsx
// ==============================

export default function CustomerProgramInfo() {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex flex-col bg-[#191a1b] border border-[#949C7F] rounded-lg p-6 min-h-[70px] h-full">
        <div className="text-xl text-white font-bold mb-4 text-center w-full">Program Information</div>
        <div className="flex flex-row gap-4 w-full flex-1">
          <div className="flex-1 bg-[#161616] rounded-lg border border-[#949C7F] p-4 text-left min-h-[70px] flex flex-col justify-start">
            <div className="text-lg text-white font-bold mb-2">CONFIRMED<br />PADS</div>
            <div className="text-gray-400 text-sm">[Coming Soon]</div>
          </div>
          <div className="flex-1 bg-[#161616] rounded-lg border border-[#949C7F] p-4 text-left min-h-[70px] flex flex-col justify-start">
            <div className="text-lg text-white font-bold mb-2">UN-CONFIRMED<br />PADS</div>
            <div className="text-gray-400 text-sm">[Coming Soon]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
