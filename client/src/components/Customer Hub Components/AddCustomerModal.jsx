// =====================================================
// AddCustomerModal.jsx — Customer Hub Add Modal • Glass
// Sections: Component
// =====================================================

export default function AddCustomerModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  logoInputRef,
  handleLogoChange,
  pendingCategory,
  setPendingCategory
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="glass-card px-8 py-8 flex flex-col items-center min-w-[370px] max-w-[97vw] shadow-2xl relative">
        <button
          className="absolute top-3 right-5 text-3xl text-[#949C7F] hover:text-red-600 font-bold focus:outline-none transition"
          onClick={onClose}
          tabIndex={0}
          aria-label="Close"
          style={{ lineHeight: 1 }}
        >✕</button>

        <h2 className="text-2xl font-extrabold mb-6 text-[#b3b99a] tracking-wider" style={{ fontFamily: 'var(--font-varien, varien, sans-serif)' }}>
          Add New Customer
        </h2>

        <form
          onSubmit={e => { e.preventDefault(); onSubmit(); }}
          className="w-full"
          autoComplete="off"
        >
          <div className="flex flex-col gap-4 w-full mb-2">
            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-category">
                Category
              </label>
              <select
                id="customer-category"
                value={form.category || ''}
                onChange={e => {
                  setForm(f => ({ ...f, category: e.target.value }));
                  setPendingCategory && setPendingCategory(e.target.value);
                }}
                className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="fracstack">Fracstack</option>
                <option value="missile">Missile</option>
              </select>
            </div>

            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-name">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
                style={{ fontFamily: 'Erbaum, sans-serif' }}
                autoFocus
                required
              />
            </div>

            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-logo">
                Logo
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  id="customer-logo"
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#949C7F] file:text-black file:font-bold"
                  style={{ background: 'transparent' }}
                />
                {form.logo_url && (
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="w-10 h-10 object-contain bg-white rounded border border-[#949C7F] ml-2"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-address">
                Head Office Address
              </label>
              <input
                id="customer-address"
                type="text"
                value={form.head_office_address}
                onChange={e => setForm(f => ({ ...f, head_office_address: e.target.value }))}
                className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] focus:ring-2 focus:ring-[#6a7257] outline-none transition"
                style={{ fontFamily: 'Erbaum, sans-serif' }}
              />
            </div>

            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-completions">
                Head of Completions
              </label>
              <input
                id="customer-completions"
                type="text"
                value={form.head_of_completions}
                onChange={e => setForm(f => ({ ...f, head_of_completions: e.target.value }))}
                className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
                style={{ fontFamily: 'Erbaum, sans-serif' }}
              />
            </div>

            <div className="flex flex-row items-center gap-2">
              <label className="w-40 text-right text-[#b3b99a] text-sm font-bold pr-2" htmlFor="customer-phone">
                Head Office Phone
              </label>
              <input
                id="customer-phone"
                type="text"
                value={form.head_office_phone}
                onChange={e => setForm(f => ({ ...f, head_office_phone: e.target.value }))}
                className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] focus:ring-2 focus:ring-[#6a7257] outline-none transition"
                style={{ fontFamily: 'Erbaum, sans-serif' }}
              />
            </div>
          </div>

          <div className="flex flex-row justify-center mt-6">
            <button
              type="submit"
              className="px-10 py-2 rounded bg-[#949C7F] hover:bg-[#b3b99a] text-black font-extrabold text-lg shadow-md transition tracking-widest"
              style={{ fontFamily: 'var(--font-varien, varien, sans-serif)' }}
              disabled={!form.name || !form.category}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
