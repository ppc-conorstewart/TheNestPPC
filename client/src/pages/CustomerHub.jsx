// ==============================
// CustomerHub.jsx — Customer Hub • Full-Page Glass Conversion
// Sections: Imports • Constants • State • Effects • Handlers • Render
// ==============================

// ===== IMPORTS =====
import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import GlassBackdrop from '../components/ui/GlassBackdrop';
import '../styles/glass.css';

import AddCustomerModal from '../components/Customer Hub Components/AddCustomerModal';
import CustomerFieldContacts from '../components/Customer Hub Components/CustomerFieldContacts';
import CustomerGeneralInfoPanel from '../components/Customer Hub Components/CustomerGeneralInfoPanel';
import CustomerListPanel from '../components/Customer Hub Components/CustomerListPanel';
import CustomerLogoCard from '../components/Customer Hub Components/CustomerLogoCard';
import CustomerProgramInfo from '../components/Customer Hub Components/CustomerProgramInfo';

// ===== CONSTANTS =====
const API_URL = '/api/customers';
const IMG_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : '';

// ===== COMPONENT =====
export default function CustomerHub() {
  // ----- STATE -----
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingCategory, setPendingCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', logo_url: '', logoFile: null, category: '',
    head_office_address: '', head_of_completions: '', head_office_phone: ''
  });
  const logoInputRef = useRef(null);

  // ----- EFFECTS -----
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  // ----- HANDLERS -----
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
      if (selected) {
        const stillExists = data.find(c => c.id === selected.id);
        if (!stillExists) setSelected(null);
        else setSelected(data.find(c => c.id === selected.id));
      }
    } catch {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    setSelected(customer);
    setEditMode(false);
    setForm({
      name: customer.name,
      logo_url: customer.logo_url,
      logoFile: null,
      category: customer.category || '',
      head_office_address: customer.head_office_address || '',
      head_of_completions: customer.head_of_completions || '',
      head_office_phone: customer.head_office_phone || ''
    });
  };

  const startEdit = () => {
    setEditMode(true);
    setForm({
      name: selected.name,
      logo_url: selected.logo_url,
      logoFile: null,
      category: selected.category || '',
      head_office_address: selected.head_office_address || '',
      head_of_completions: selected.head_of_completions || '',
      head_office_phone: selected.head_office_phone || ''
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setForm({
      name: selected.name,
      logo_url: selected.logo_url,
      logoFile: null,
      category: selected.category || '',
      head_office_address: selected.head_office_address || '',
      head_of_completions: selected.head_of_completions || '',
      head_office_phone: selected.head_office_phone || ''
    });
  };

  const saveEdit = async () => {
    const data = new FormData();
    data.append('name', form.name);
    if (form.logoFile) data.append('logo', form.logoFile);
    else data.append('logo_url', form.logo_url || '');
    data.append('head_office_address', form.head_office_address || '');
    data.append('head_of_completions', form.head_of_completions || '');
    data.append('head_office_phone', form.head_office_phone || '');
    data.append('category', form.category || '');

    const res = await fetch(`${API_URL}/${selected.id}`, {
      method: 'PUT',
      body: data,
    });
    if (res.ok) {
      const updatedCustomers = await fetch(API_URL).then(r => r.json());
      setCustomers(updatedCustomers);
      const updated = updatedCustomers.find(c => c.id === selected.id);
      setSelected(updated || null);
      setEditMode(false);
      setForm({
        name: updated?.name || '',
        logo_url: updated?.logo_url || '',
        logoFile: null,
        category: updated?.category || '',
        head_office_address: updated?.head_office_address || '',
        head_of_completions: updated?.head_of_completions || '',
        head_office_phone: updated?.head_office_phone || '',
      });
    }
  };

  const addCustomer = async () => {
    const data = new FormData();
    data.append('name', form.name);
    if (form.logoFile) data.append('logo', form.logoFile);
    data.append('head_office_address', form.head_office_address || '');
    data.append('head_of_completions', form.head_of_completions || '');
    data.append('head_office_phone', form.head_office_phone || '');
    data.append('category', form.category || pendingCategory || '');

    const res = await fetch(API_URL, {
      method: 'POST',
      body: data,
    });
    if (res.ok) {
      const updatedCustomers = await fetch(API_URL).then(r => r.json());
      setCustomers(updatedCustomers);
      const updated = updatedCustomers.find(c => c.name === form.name);
      setSelected(updated || null);
      setShowAdd(false);
      setEditMode(false);
      setPendingCategory('');
      setForm({
        name: '', logo_url: '', logoFile: null, category: '',
        head_office_address: '', head_of_completions: '', head_office_phone: ''
      });
    }
  };

  const deleteCustomer = async () => {
    if (!selected) return;
    if (!window.confirm('Delete this customer?')) return;
    await fetch(`${API_URL}/${selected.id}`, { method: 'DELETE' });
    setSelected(null);
    setEditMode(false);
    fetchCustomers();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setForm(f => ({
      ...f,
      logoFile: file || null,
      logo_url: file ? URL.createObjectURL(file) : f.logo_url
    }));
  };

  const handleLogoDelete = async () => {
    await fetch(`${API_URL}/${selected.id}/logo`, { method: 'DELETE' });
    setForm(f => ({ ...f, logo_url: '', logoFile: null }));
    fetchCustomers();
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const getSelectedCard = () => {
    if (!selected) return null;
    if (form.logoFile && form.logo_url) {
      return { ...selected, logo_url: form.logo_url };
    }
    return {
      ...selected,
      logo_url: selected.logo_url
        ? (selected.logo_url.startsWith('http')
          ? selected.logo_url
          : IMG_BASE + selected.logo_url)
        : null
    };
  };

  const handleShowAddModal = () => {
    setShowAdd(true);
    setPendingCategory('');
    setForm({
      name: '',
      logo_url: '',
      logoFile: null,
      category: '',
      head_office_address: '',
      head_of_completions: '',
      head_office_phone: ''
    });
  };

  // ----- RENDER -----
  return (
    <div className='relative h-full min-h-screen w-full text-white' style={{ fontFamily: 'Erbaum, sans-serif' }}>
      <GlassBackdrop blur={6} opacity={0.08} />
      <div className='w-full h-full flex flex-row ml-10 relative z-10'>
        <Sidebar />
        <div className='flex-1 flex flex-col p-6'>
          <div className='flex flex-row gap-4 h-full'>
            {/* Left: Customer List */}
            <CustomerListPanel
              customers={customers.map(c => ({
                ...c,
                logo_url: c.logo_url
                  ? (c.logo_url.startsWith('http')
                      ? c.logo_url
                      : IMG_BASE + c.logo_url)
                  : null
              }))}
              selected={selected}
              loading={loading}
              onSelect={handleSelect}
              onAdd={handleShowAddModal}
            />

            {/* Right: Customer Info + Program Info */}
            <div className='flex flex-col flex-1 gap-4'>
              <div className='flex flex-row gap-4'>
                <div className='glass-card p-6 flex flex-row items-start min-h-[210px] justify-start relative w-full'>
                  <CustomerLogoCard
                    selected={getSelectedCard()}
                    form={form}
                    editMode={editMode}
                    onEdit={startEdit}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    onDelete={deleteCustomer}
                    onLogoChange={handleLogoChange}
                    onLogoDelete={handleLogoDelete}
                  />
                  <div className='mx-6 w-[2px] bg-[#949C7F] h-full opacity-40 rounded' />
                  <CustomerGeneralInfoPanel
                    selected={selected}
                    editMode={editMode}
                    form={form}
                    onFormChange={handleFormChange}
                  />
                </div>
              </div>

              <div className='flex flex-row gap-4 flex-1'>
                {/* If missile, show assigned missiles; else show field contacts */}
                {selected && selected.category === 'missile' ? (
                  <div className='glass-card p-6 min-h-[210px] flex-1'>
                    <div className='text-xl text-center mb-4 text-[#b3b99a]' style={{ fontFamily: 'var(--font-varien, varien, sans-serif)' }}>
                      Assigned Missile/s
                    </div>
                    <div className='text-base text-[#e6e8df] opacity-70'>
                      [Coming soon: List of assigned missiles for this customer]
                    </div>
                  </div>
                ) : (
                  <div className='flex-1'>
                    <div className='glass-card p-4 h-full'>
                      <CustomerFieldContacts />
                    </div>
                  </div>
                )}
                <CustomerProgramInfo />
              </div>
            </div>
          </div>

          <AddCustomerModal
            open={showAdd}
            onClose={() => setShowAdd(false)}
            onSubmit={addCustomer}
            form={form}
            setForm={setForm}
            logoInputRef={logoInputRef}
            handleLogoChange={handleLogoChange}
            pendingCategory={pendingCategory}
            setPendingCategory={setPendingCategory}
          />
        </div>
      </div>
    </div>
  );
}
