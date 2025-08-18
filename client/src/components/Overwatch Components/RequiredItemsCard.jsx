//==============================
//components/Overwatch Components/RequiredItemsCard.jsx — Live Required Items (Context-Backed)
//==============================

import Lottie from 'lottie-react';
import { useMemo, useState } from 'react';
import AddIcon from '../../assets/Fly-HQ Icons/AddIcon.json';
import { useJobContext } from '../../context/JobContext';
import AddRequiredItemModal from './AddRequiredItemModal';

const cardStyle = {
background: '#10110f',
borderRadius: 0,
border: '1.5px solid #949C7F',
padding: 0,
minHeight: 152,
display: 'flex',
flexDirection: 'column',
justifyContent: 'flex-start',
alignItems: 'stretch',
height: '100%',
boxSizing: 'border-box',
minWidth: 0,
minHeight: 0,
overflow: 'hidden',
position: 'relative'
};

const cardHeaderStyle = {
background: '#000',
color: '#b0b79f',
borderBottom: '2.5px solid #35392e',
padding: '13px 0 8px 0',
fontSize: '1.17rem',
fontWeight: 'bold',
letterSpacing: '1.13px',
margin: 0,
textAlign: 'center',
width: '100%',
textTransform: 'uppercase',
lineHeight: 1.1,
boxShadow: '0 2px 10px #22291e25',
position: 'relative'
};

const addItemButtonStyle = {
position: 'absolute',
top: 2,
right: 3,
background: 'transparent',
border: 'none',
borderRadius: '50%',
width: 40,
height: 40,
cursor: 'pointer',
zIndex: 9,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: 0,
boxShadow: 'none',
transition: 'box-shadow 0.2s'
};

const listWrap = {
color: '#E6E8DF',
fontSize: '.76rem',
fontWeight: 600,
padding: '12px 14px 12px 18px',
textAlign: 'left',
display: 'flex',
flexDirection: 'column',
gap: 8,
overflowY: 'auto',
minHeight: 0,
flex: 1
};

const sectionHeader = {
fontSize: '0.7rem',
textTransform: 'uppercase',
fontWeight: 800,
letterSpacing: '0.13em',
color: '#A1CE81',
display: 'flex',
alignItems: 'center',
gap: 8,
marginTop: 2
};

const sectionUnderline = {
display: 'inline-block',
height: 6,
width: 44,
borderRadius: 4,
background: 'linear-gradient(90deg, #6a7257 60%, #35392E 100%)'
};

const itemRow = {
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
gap: 10,
background: '#0f110e',
border: '1px solid #2a2f24',
borderRadius: 8,
padding: '8px 10px'
};

const itemLeft = { display: 'flex', alignItems: 'center', gap: 8 };
const qtyPill = (color = '#A5E850') => ({
color,
fontWeight: 900,
padding: '2px 8px',
borderRadius: 999,
border: '1px solid ${color}55',
background: '#0b0c0a'
});

const delBtn = {
background: 'transparent',
border: '1px solid #444',
color: '#bbb',
padding: '2px 8px',
borderRadius: 6,
cursor: 'pointer'
};

export default function RequiredItemsCard({ job, items, onAddItem }) {
const { addRequiredItem, deleteRequiredItem } = useJobContext();
const [showAddModal, setShowAddModal] = useState(false);
const [isHovered, setIsHovered] = useState(false);

const jobId = job?.id;
const data = useMemo(() => items || job?.requiredItems || [], [items, job]);

const grouped = useMemo(() => {
const res = { pending: [], ready: [], received: [] };
(Array.isArray(data) ? data : []).forEach(it => {
const key = (it.status || 'pending').toLowerCase();
if (key === 'ready') res.ready.push(it);
else if (key === 'received') res.received.push(it);
else res.pending.push(it);
});
return res;
}, [data]);

async function handleAdd(newItem) {
if (onAddItem) {
await onAddItem(newItem);
} else if (jobId) {
await addRequiredItem(jobId, {
item_text: newItem.item_text,
qty: Number(newItem.qty) || 1,
status: newItem.status || 'pending'
});
}
setShowAddModal(false);
}

async function handleDelete(id) {
if (!jobId || !id) return;
await deleteRequiredItem(jobId, id);
}

return (
<div style={cardStyle}>
<div style={cardHeaderStyle}>
Required Items
<button
style={{
...addItemButtonStyle,
boxShadow: isHovered ? '0 0 0px #84ff45' : 'none',
background: isHovered ? '#23281c' : 'transparent',
outline: isHovered ? '0px solid #84ff45' : 'none'
}}
title="Add Required Item"
onClick={() => setShowAddModal(true)}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
>
<Lottie
animationData={AddIcon}
loop={isHovered}
autoplay={false}
style={{ width: 34, height: 34, display: 'block' }}
rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
play={isHovered}
/>
</button>
</div>
 <div style={listWrap}>
    <div style={sectionHeader}>
      Pending <span style={sectionUnderline} />
    </div>
    {(grouped.pending.length ? grouped.pending : []).map((it) => (
      <div key={it.id || `${it.item_text}-${it.qty}`} style={itemRow}>
        <div style={itemLeft}>
          <span style={qtyPill('#A5E850')}>QTY x {it.qty || 1}</span>
          <span>{it.item_text}</span>
        </div>
        <button style={delBtn} onClick={() => handleDelete(it.id)}>Remove</button>
      </div>
    ))}

    <div style={sectionHeader}>
      Ready <span style={sectionUnderline} />
    </div>
    {(grouped.ready.length ? grouped.ready : []).map((it) => (
      <div key={it.id || `${it.item_text}-${it.qty}-r`} style={itemRow}>
        <div style={itemLeft}>
          <span style={qtyPill('#54d7ed')}>QTY x {it.qty || 1}</span>
          <span>{it.item_text}</span>
        </div>
        <button style={delBtn} onClick={() => handleDelete(it.id)}>Remove</button>
      </div>
    ))}

    <div style={sectionHeader}>
      Received <span style={sectionUnderline} />
    </div>
    {(grouped.received.length ? grouped.received : []).map((it) => (
      <div key={it.id || `${it.item_text}-${it.qty}-rcv`} style={itemRow}>
        <div style={itemLeft}>
          <span style={qtyPill('#c2c2c2')}>QTY x {it.qty || 1}</span>
          <span>{it.item_text}</span>
        </div>
        <button style={delBtn} onClick={() => handleDelete(it.id)}>Remove</button>
      </div>
    ))}
  </div>

  {showAddModal && (
    <AddRequiredItemModal
      onClose={() => setShowAddModal(false)}
      onAdd={handleAdd}
    />
  )}
</div>
);
}