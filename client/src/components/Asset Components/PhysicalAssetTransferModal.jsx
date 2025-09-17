// =================== Imports and Dependencies ===================
import { QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../api';
import AssetSelector from './Physical Transfer Components/AssetSelector';
import QRScanModal from './Physical Transfer Components/QRScanModal';
import SignaturePadSection from './Physical Transfer Components/SignaturePadSection';

// =================== Constants and Utility Functions ===================
const palomaLogo = require('../../assets/Paloma_Icon_Black_large.png');
const API_BASE = API_BASE_URL || '';

function getCurrentBOLNumber() {
  let n = parseInt(localStorage.getItem('paloma_bol_no') || '1', 10);
  return n.toString().padStart(4, '0');
}
function incrementBOLNumber() {
  let n = parseInt(localStorage.getItem('paloma_bol_no') || '1', 10);
  localStorage.setItem('paloma_bol_no', (n + 1));
}

// =================== Physical Asset Transfer Modal Component ===================
export default function PhysicalAssetTransferModal({
  isOpen,
  assets,
  selectedAssets,
  onClose,
}) {
  // --------- State Management ---------
  const [bolNo, setBolNo] = useState(getCurrentBOLNumber());
  useEffect(() => {
    if (isOpen) setBolNo(getCurrentBOLNumber());
  }, [isOpen]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAssetName, setSelectedAssetName] = useState(null);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [selectedByName, setSelectedByName] = useState({});
  const [nonSerialized, setNonSerialized] = useState([]);
  const [showAddNonSerialized, setShowAddNonSerialized] = useState(false);
  const [nonSerForm, setNonSerForm] = useState({
    qty: '',
    name: '',
    weight: ''
  });
  const [form, setForm] = useState({
    shipper: '',
    address: '',
    deliverTo: '',
    deliverToManual: '',
    date: new Date().toISOString().slice(0, 10),
    poNumber: '',
    comments: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    driverName: '',
    driverTime: '',
    bolTotal: '',
    truckingProvider: '',
  });

  const sigPadRef = useRef();
  const [signatureURL, setSignatureURL] = useState('');
  const [isPadEmpty, setIsPadEmpty] = useState(true);

  const [showQRScan, setShowQRScan] = useState(false);
  const [qrScanResult, setQrScanResult] = useState('');

  // --------- Asset Selection Helpers ---------
  function isChecked(assetName, id) {
    return selectedByName[assetName]?.includes(id);
  }
  function handleCheckbox(assetName, id) {
    setSelectedByName(prev => {
      const arr = prev[assetName] || [];
      if (arr.includes(id)) {
        return { ...prev, [assetName]: arr.filter(x => x !== id) };
      }
      return { ...prev, [assetName]: [...arr, id] };
    });
  }
  function handleRemovePPC(assetName, id) {
    setSelectedByName(prev => {
      const arr = prev[assetName] || [];
      const filtered = arr.filter(x => x !== id);
      if (filtered.length === 0) {
        const { [assetName]: omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [assetName]: filtered };
    });
  }
  function handleRemoveAssetGroup(assetName) {
    setSelectedByName(prev => {
      const { [assetName]: omit, ...rest } = prev;
      return rest;
    });
  }
  function addAssetByScannedQR(qr) {
    let clean = String(qr).replace(/PPC\s*/i, '').replace(/^0+/, '').replace(/\D/g, '');
    let found = assets.find(a =>
      String(a.id).replace(/^0+/, '') === clean ||
      String(a.id).replace(/^PPC/i, '').replace(/^0+/, '') === clean
    );
    if (found) {
      setSelectedByName(prev => {
        const arr = prev[found.name] || [];
        if (!arr.includes(found.id)) {
          return { ...prev, [found.name]: [...arr, found.id] };
        }
        return prev;
      });
    }
  }

  // --------- Non-Serialized Asset Handlers ---------
  const handleNonSerInput = (e) => {
    setNonSerForm({ ...nonSerForm, [e.target.name]: e.target.value });
  };
  const handleAddNonSerialized = () => {
    if (nonSerForm.qty && nonSerForm.name) {
      setNonSerialized((prev) => [
        ...prev,
        {
          ...nonSerForm,
          qty: parseInt(nonSerForm.qty, 10) || 1,
          weight: nonSerForm.weight || '-',
          _id: Date.now() + '-' + Math.random(),
        },
      ]);
      setNonSerForm({ qty: '', name: '', weight: '' });
      setShowAddNonSerialized(false);
    }
  };
  const handleRemoveNonSerialized = (_id) => {
    setNonSerialized((prev) => prev.filter((item) => item._id !== _id));
  };

  // --------- Form Field Change Handler ---------
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --------- Reset State on Modal Close ---------
  useEffect(() => {
    if (!isOpen) {
      setShowNameDropdown(false);
      setSearch('');
      setSelectedAssetName(null);
      setShowAddNonSerialized(false);
      setNonSerForm({ qty: '', name: '', weight: '' });
      setNonSerialized([]);
      setSelectedByName({});
      if (sigPadRef.current) sigPadRef.current.clear();
      setSignatureURL('');
      setIsPadEmpty(true);
      setShowQRScan(false);
      setQrScanResult('');
      setForm({
        shipper: '',
        address: '',
        deliverTo: '',
        deliverToManual: '',
        date: new Date().toISOString().slice(0, 10),
        poNumber: '',
        comments: '',
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        driverName: '',
        driverTime: '',
        bolTotal: '',
        truckingProvider: '',
      });
    }
  }, [isOpen]);

  // --------- Asset Table Summary ---------
  const assetSummaryRows = Object.entries(selectedByName)
    .filter(([name, ppcs]) => ppcs.length > 0)
    .map(([name, ppcs]) => {
      const assetObjs = assets.filter(a => a.name === name && ppcs.includes(a.id));
      const allWeights = assetObjs.map(a => a.weight || '-');
      const uniqueWeights = Array.from(new Set(allWeights));
      return {
        name,
        qty: ppcs.length,
        ppcs,
        ppcDisplay: ppcs.join(', '),
        weight: uniqueWeights.length === 1 ? uniqueWeights[0] : uniqueWeights.join(', '),
      };
    });

  function padTicketNumber(id, length = 4) {
    return String(id).padStart(length, '0');
  }

  // --------- Submit Handler ---------
  async function handleSubmitTransferTicket() {
    try {
      const assetsArray = [];
      Object.values(selectedByName).forEach(arr => assetsArray.push(...arr));
      const deliveryAddress = form.deliverTo === 'Other' ? form.deliverToManual : form.deliverTo;
      const transferData = {
        delivery_address: deliveryAddress,
        trucking_provider: form.truckingProvider,
        status: 'In Transit',
        assets: assetsArray.map(id =>
          assets.find(a => a.id === id)
            ? {
                id,
                name: assets.find(a => a.id === id).name,
                weight: assets.find(a => a.id === id).weight,
              }
            : id
        ),
        non_serialized_items: nonSerialized,
        shipper: form.shipper,
        address: form.address,
        date: form.date,
        po_number: form.poNumber,
        comments: form.comments,
        receiver_name: form.receiverName,
        receiver_phone: form.receiverPhone,
        receiver_email: form.receiverEmail,
        driver_name: form.driverName,
        driver_time: form.driverTime,
        bol_total: form.bolTotal,
        signature: signatureURL,
      };

      const response = await fetch(`${API_BASE}/api/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Transfer submitted:', data);

      incrementBOLNumber();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      alert('Failed to submit transfer ticket. Please try again.');
    }
  }

  // =================== Modal Rendering ===================
  if (!isOpen) return null;

  return (
    <>
      {/* --------- Success Message --------- */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#6a7257',
          color: '#fff',
          padding: '14px 38px',
          borderRadius: 12,
          boxShadow: '0 3px 18px #0006',
          zIndex: 9999,
          fontWeight: 'bold',
          fontSize: 20,
          letterSpacing: 1.1
        }}>
          ✅ Transfer submitted successfully!
        </div>
      )}

      {/* --------- Main Modal Window --------- */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center overflow-y-auto">
        <div
          className="rounded-xl shadow-2xl w-full max-w-3xl relative p-8"
          style={{ background: 'white' }}
        >
          {/* --------- Close Button --------- */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 font-bold"
          >
            ×
          </button>
          {/* --------- Modal Header Section --------- */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-1">
            <img src={palomaLogo} alt="Paloma Logo" className="w-20 h-20 object-contain" />
            <div className="text-center flex-1">
              <h1 className="font-bold text-2xl tracking-wider text-black mb-1">PALOMA PRESSURE CONTROL</h1>
              <p className="text-xs text-black">#210-129 Queens Drive, Red Deer, AB T4P 0R8</p>
              <p className="text-xs text-black">403-598-7342</p>
            </div>
            <img src={palomaLogo} alt="Paloma Logo" className="w-20 h-20 object-contain" />
          </div>
          <div
            className="flex items-center justify-between font-bold text-black border-b-2 border-black tracking-wider uppercase"
            style={{
              letterSpacing: '0.08em',
              fontSize: '1rem',
              padding: '0.35rem 0 0.3rem 0',
              marginBottom: '0.4rem',
              marginTop: '-0.6rem'
            }}
          >
            <span>BILL OF LADING</span>
            <span>PROOF OF DELIVERY</span>
            <span className="font-bold">
              NO. <span style={{ color: 'red' }}>{bolNo}</span>
            </span>
          </div>

          {/* --------- Main Form Inputs --------- */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            <div className="flex flex-col">
              <label className="font-bold text-black text-xs mb-0" style={{fontSize:'12px'}}>SHIPPER:</label>
              <select
                name="shipper"
                value={form.shipper}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black text-xs"
                style={{ minHeight: '22px', fontSize: '12.5px' }}
              >
                <option value="">Select...</option>
                <option value="Red Deer">Red Deer</option>
                <option value="Grande Prairie">Grande Prairie</option>
                <option value="Nisku">Nisku</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black text-xs mb-0" style={{fontSize:'12px'}}>ADDRESS:</label>
              <input name="address" value={form.address} onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black text-xs" style={{ minHeight: '22px', fontSize: '12.5px' }} />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black text-xs mb-0" style={{fontSize:'12px'}}>DELIVER TO (LSD):</label>
              <select
                name="deliverTo"
                value={
                  form.deliverTo === "Red Deer" ||
                  form.deliverTo === "Grande Prairie" ||
                  form.deliverTo === "Nisku"
                    ? form.deliverTo
                    : ""
                }
                onChange={e => {
                  if (e.target.value === "Other") {
                    setForm({ ...form, deliverTo: "Other" });
                  } else {
                    setForm({ ...form, deliverTo: e.target.value });
                  }
                }}
                className="w-full border rounded px-2 py-0.5 text-black text-xs"
                style={{ minHeight: '22px', fontSize: '12.5px' }}
              >
                <option value="">Select...</option>
                <option value="Red Deer">Red Deer</option>
                <option value="Grande Prairie">Grande Prairie</option>
                <option value="Nisku">Nisku</option>
                <option value="Other">Other (Manual Entry)</option>
              </select>
              {form.deliverTo === "Other" && (
                <input
                  name="deliverToManual"
                  value={form.deliverToManual || ""}
                  onChange={e => setForm({ ...form, deliverToManual: e.target.value })}
                  className="w-full border rounded px-2 py-0.5 text-black text-xs mt-1"
                  style={{ minHeight: '22px', fontSize: '12.5px' }}
                  placeholder="Enter delivery location"
                />
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black text-xs mb-0" style={{fontSize:'12px'}}>DATE:</label>
              <input name="date" value={form.date} type="date" onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black text-xs" style={{ minHeight: '22px', fontSize: '12.5px' }} />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black text-xs mb-0" style={{fontSize:'12px'}}>PO #:</label>
              <input name="poNumber" value={form.poNumber} onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black text-xs" style={{ minHeight: '22px', fontSize: '12.5px' }} />
            </div>
          </div>

          {/* --------- Asset Selector Section --------- */}
          <AssetSelector
            assets={assets}
            search={search}
            setSearch={setSearch}
            selectedAssetName={selectedAssetName}
            setSelectedAssetName={setSelectedAssetName}
            selectedByName={selectedByName}
            handleCheckbox={handleCheckbox}
            showNameDropdown={showNameDropdown}
            setShowNameDropdown={setShowNameDropdown}
          />

          {/* --------- Add Non-Serialized Items and QR Scan Section --------- */}
          <div className="flex gap-2 mb-2 mt-1">
            <button
              className="bg-black text-white px-3 py-1 rounded text-xs font-bold border border-[#6a7257] hover:bg-[#494f3c] transition"
              style={{ fontSize: '8px', minHeight: '22px' }}
              onClick={() => setShowAddNonSerialized(v => !v)}
            >
              {showAddNonSerialized ? "Cancel" : "+ Add Non Serialized Item"}
            </button>
            <button
              className="bg-black text-white px-2 py-1 rounded text-xs font-bold border border-[#6a7257] hover:bg-[#494f3c] transition flex items-center"
              style={{ fontSize: '12px', minHeight: '22px' }}
              onClick={() => setShowQRScan(true)}
              title="Scan QR"
            >
              <QrCode size={16} className="mr-1" />
              <span className="hidden sm:inline">Add Via QR</span>
            </button>
          </div>

          {/* --------- Add Non-Serialized Items Form --------- */}
          {showAddNonSerialized && (
            <div className="mb-2 flex gap-3 flex-nowrap items-end bg-[#e6e8df] p-2 rounded">
              <div className="flex flex-col flex-1 max-w-[60px]">
                <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>QTY</label>
                <input
                  type="number"
                  min="1"
                  name="qty"
                  value={nonSerForm.qty}
                  onChange={handleNonSerInput}
                  className="border rounded px-2 py-1 text-black w-full"
                  style={{ minHeight: '20px', fontSize: '10px' }}
                  placeholder="QTY"
                />
              </div>
              <div className="flex flex-col flex-[2_2_0%] min-w-[170px]">
                <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>ITEM DESCRIPTION</label>
                <input
                  type="text"
                  name="name"
                  value={nonSerForm.name}
                  onChange={handleNonSerInput}
                  className="border rounded px-2 py-1 text-black w-full"
                  style={{ minHeight: '20px', fontSize: '10px' }}
                  placeholder="Item Description"
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[80px]">
                <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>WEIGHT</label>
                <input
                  type="text"
                  name="weight"
                  value={nonSerForm.weight}
                  onChange={handleNonSerInput}
                  className="border rounded px-2 py-1 text-black w-full"
                  style={{ minHeight: '20px', fontSize: '10px' }}
                  placeholder="Weight"
                />
              </div>
              <button
                className="bg-[#6a7257] text-black font-bold rounded px-3 py-1 border-2 border-black hover:bg-[#35392e] hover:text-white transition"
                style={{ minHeight: '22px', fontSize: '10px' }}
                onClick={handleAddNonSerialized}
              >
                Add
              </button>
              <button
                className="bg-black text-white px-2 py-1 rounded font-bold border ml-1 border-[#6a7257] hover:bg-[#494f3c] transition"
                style={{ minHeight: '22px', fontSize: '10px' }}
                onClick={() => setShowAddNonSerialized(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* --------- Asset & Non-Serialized Item Table --------- */}
          <table className="w-full border mt-2" style={{ fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#e6e8df', lineHeight: '1', height: '28px' }}>
                <th className="border text-black font-bold text-center" style={{ fontSize: '9px', fontWeight: 700, width: '40px', padding: '4px 6px', whiteSpace: 'nowrap' }}>QTY</th>
                <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>ASSET NAME</th>
                <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>PPC#</th>
                <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>WEIGHT (LBS)</th>
                <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}></th>
              </tr>
            </thead>
            <tbody>
              {assetSummaryRows.length === 0 && nonSerialized.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-2" style={{ color: '#111', background: '#f3f4f1', fontSize: '10px' }}>
                    NO ASSETS SELECTED
                  </td>
                </tr>
              )}
              {assetSummaryRows.map(row => (
                <tr key={row.name} style={{ height: '24px', lineHeight: '1' }}>
                  <td className="border text-black text-center font-bold" style={{ fontSize: '9px', padding: '2px 6px', width: '40px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    {row.qty}
                  </td>
                  <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>
                    {row.name}
                  </td>
                  <td className="border px-2 py-1 text-black align-top font-bold" style={{ fontSize: '10px' }}>
                    {row.ppcs.map(ppc =>
                      <span
                        key={ppc}
                        className="inline-block mr-[2px] mb-[2px] bg-gray-100 rounded px-1 py-[1px] font-bold"
                        style={{ fontSize: '10px', lineHeight: '1.1' }}
                      >
                        {ppc}
                        <button
                          className="ml-1 text-red-600"
                          style={{ fontWeight: 'bold', fontSize: '10px', verticalAlign: 'middle', padding: 0 }}
                          onClick={() => handleRemovePPC(row.name, ppc)}
                          title="Remove this PPC# from group"
                        >×</button>
                      </span>
                    )}
                  </td>
                  <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>
                    {row.weight}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="text-red-600 font-bold px-1 py-0.5 rounded hover:underline"
                      style={{ fontSize: '10px' }}
                      onClick={() => handleRemoveAssetGroup(row.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {nonSerialized.map((item) => (
                <tr key={item._id}>
                  <td className="border text-black text-center font-bold" style={{ fontSize: '9px', padding: '2px 6px', width: '40px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    {item.qty}
                  </td>
                  <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>
                    {item.name}
                  </td>
                  <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>-</td>
                  <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>
                    {item.weight || '-'}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="text-red-600 font-bold px-1 py-0.5 rounded hover:underline"
                      style={{ fontSize: '10px' }}
                      onClick={() => handleRemoveNonSerialized(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --------- Comments Section --------- */}
          <div className="flex flex-col mt-3 mb-1">
            <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>ROAD, WEATHER, OTHER COMMENTS:</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleFormChange}
              className="w-full border rounded px-2 py-0.5 text-black"
              style={{ minHeight: '36px', fontSize: '12.5px' }}
            />
          </div>

          {/* --------- Receiver and Driver Info --------- */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 mb-2 mt-3">
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>RECEIVER NAME:</label>
              <input
                name="receiverName"
                value={form.receiverName}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>PHONE:</label>
              <input
                name="receiverPhone"
                value={form.receiverPhone}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>EMAIL:</label>
              <input
                name="receiverEmail"
                value={form.receiverEmail}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>DRIVER NAME:</label>
              <input
                name="driverName"
                value={form.driverName}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>TIME:</label>
              <input
                name="driverTime"
                value={form.driverTime}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>TRUCKING PROVIDER:</label>
              <input
                name="truckingProvider"
                value={form.truckingProvider}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>BOL TOTAL:</label>
              <input
                name="bolTotal"
                value={form.bolTotal}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-0.5 text-black"
                style={{ minHeight: '20px', fontSize: '12.5px' }}
              />
            </div>
            <div></div>
            <div></div>
          </div>

          {/* --------- Signature Pad Section --------- */}
          <SignaturePadSection
            sigPadRef={sigPadRef}
            signatureURL={signatureURL}
            setSignatureURL={setSignatureURL}
            isPadEmpty={isPadEmpty}
            setIsPadEmpty={setIsPadEmpty}
          />

          {/* --------- Action Buttons --------- */}
          <div className="flex justify-end gap-2 mt-3">
            <button
              className="px-2 py-0.5 rounded bg-black text-white font-bold border border-[#6a7257] hover:bg-[#35392e] transition text-xs"
              style={{ fontSize: '11px', minWidth: '60px', minHeight: '28px' }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-3 py-0.5 rounded bg-[#6a7257] text-black font-bold border border-[#23241b] hover:bg-[#949c7f] transition text-xs"
              style={{ fontSize: '11px', minWidth: '135px', minHeight: '28px' }}
              onClick={handleSubmitTransferTicket}
            >
              Submit Asset Transfer Ticket
            </button>
          </div>

          {/* --------- QR Scan Modal --------- */}
          <QRScanModal
            show={showQRScan}
            setShow={setShowQRScan}
            qrScanResult={qrScanResult}
            setQrScanResult={setQrScanResult}
            addAssetByScannedQR={addAssetByScannedQR}
          />
        </div>
      </div>
    </>
  );
}
