// =====================================================
// CustomerProgramInfo.jsx — Customer Hub Program Information Panel • Glass
// Sections: Component
// =====================================================

export default function CustomerProgramInfo() {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="glass-card p-6 min-h-[70px] h-full">
        <div className="text-xl text-white font-bold mb-4 text-center w-full">Program Information</div>
        <div className="flex flex-row gap-4 w-full flex-1">
          <div className="glass-card p-4 text-left min-h-[70px] flex flex-col justify-start flex-1">
            <div className="text-lg text-white font-bold mb-2">CONFIRMED<br />PADS</div>
            <div className="text-gray-400 text-sm">[Coming Soon]</div>
          </div>
          <div className="glass-card p-4 text-left min-h-[70px] flex flex-col justify-start flex-1">
            <div className="text-lg text-white font-bold mb-2">UN-CONFIRMED<br />PADS</div>
            <div className="text-gray-400 text-sm">[Coming Soon]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
