// =================== Imports and Dependencies ===================
import SignaturePad from 'react-signature-canvas';

// =================== Signature Pad Section Component ===================
export default function SignaturePadSection({
  sigPadRef,
  signatureURL,
  setSignatureURL,
  isPadEmpty,
  setIsPadEmpty,
}) {
  // =================== Render Signature Pad and Controls ===================
  return (
    <div className="mt-0 mb-2">
      <label className="font-bold text-black mb-1 block" style={{ fontSize: '13px' }}>
        SIGNATURE:
      </label>
      {!signatureURL ? (
        <div>
          <div className="bg-white border rounded" style={{ width: 500, height: 100 }}>
            <SignaturePad
              ref={sigPadRef}
              penColor="black"
              canvasProps={{ width: 500, height: 100, className: "signatureCanvas" }}
              backgroundColor="#fff"
              onBegin={() => setIsPadEmpty(false)}
              onEnd={() => {
                if (sigPadRef.current && sigPadRef.current.isEmpty()) {
                  setIsPadEmpty(true);
                }
              }}
              minWidth={0.5}
              maxWidth={2.5}
              velocityFilterWeight={0.7}
              throttle={16}
            />
          </div>
          <div className="flex gap-4 mt-1">
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => {
                sigPadRef.current && sigPadRef.current.clear();
                setIsPadEmpty(true);
              }}
            >
              Clear Signature
            </button>
            <button
              type="button"
              className="text-xs text-green-700 underline"
              disabled={isPadEmpty}
              style={{
                opacity: !isPadEmpty ? 1 : 0.5,
                cursor: !isPadEmpty ? 'pointer' : 'not-allowed'
              }}
              onClick={() => {
                if (sigPadRef.current && !isPadEmpty) {
                  setSignatureURL(sigPadRef.current.getCanvas().toDataURL('image/png'));
                }
              }}
            >
              Use Signature
            </button>
          </div>
        </div>
      ) : (
        <div>
          <img
            src={signatureURL}
            alt="Signature Preview"
            className="mt-2 border border-gray-300"
            style={{ width: 250, height: 70, objectFit: "contain" }}
          />
          <div>
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => {
                setSignatureURL('');
                setTimeout(() => {
                  if (sigPadRef.current) sigPadRef.current.clear();
                  setIsPadEmpty(true);
                }, 50);
              }}
            >
              Clear Signature
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
