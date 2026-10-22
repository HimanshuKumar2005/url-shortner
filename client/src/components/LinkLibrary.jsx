import { BarChart3, Check, MoreHorizontal, Pencil, Power, Trash2, X } from 'lucide-react';
import { useState } from 'react';

function LinkLibrary({ links, onDeleteLink, onViewAnalytics, onUpdateLink }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [savingKey, setSavingKey] = useState(null);
  const [menuKey, setMenuKey] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  function startEditing(link) {
    setEditingKey(link.shortKey);
    setEditingLabel(link.label || 'label1');
  }

  function cancelEditing() {
    setEditingKey(null);
    setEditingLabel('');
  }

  async function saveLabel(shortKey) {
    if (!editingLabel.trim()) return;
    setSavingKey(shortKey);
    try {
      await onUpdateLink(shortKey, { label: editingLabel });
      cancelEditing();
    } finally {
      setSavingKey(null);
    }
  }

  async function toggleDisabled(link) {
    setSavingKey(link.shortKey);
    try {
      await onUpdateLink(link.shortKey, { disabled: !link.disabled });
    } finally {
      setSavingKey(null);
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;
    setSavingKey(deleteCandidate.shortKey);
    try {
      await onDeleteLink(deleteCandidate.shortKey);
      setDeleteCandidate(null);
    } finally {
      setSavingKey(null);
    }
  }

  const statusStyles = {
    active: 'bg-[#edf4ec] text-[#5b8b73]',
    scheduled: 'bg-[#fff4d6] text-[#9b6b16]',
    expired: 'bg-[#fbe9e6] text-[#bb5d4c]',
    'limit-reached': 'bg-[#fbe9e6] text-[#bb5d4c]',
    disabled: 'bg-[#e9ecea] text-[#64716a]',
  };

  return <section className="border-t border-[#d8dfd7] py-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Analytics dashboard</p><h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Your link library</h2></div><span className="text-sm font-semibold text-[#718078]">{links.length} generated</span></div><div className="overflow-x-auto rounded-xl border border-[#d8dfd7] bg-white"><table className="w-full min-w-250 text-left text-sm"><thead className="border-b border-[#d8dfd7] bg-[#fbfcfa] text-xs tracking-widest text-[#718078] uppercase"><tr><th className="px-5 py-4">Label</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Short link</th><th className="px-5 py-4">Destination</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Clicks</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>{links.map((link) => <tr key={link.shortKey} className="border-b border-[#edf0eb] last:border-0"><td className="px-5 py-4 font-bold text-[#17231f]">{editingKey === link.shortKey ? <div className="flex min-w-52 items-center gap-2"><input autoFocus value={editingLabel} maxLength="80" onChange={(event) => setEditingLabel(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveLabel(link.shortKey); if (event.key === 'Escape') cancelEditing(); }} className="min-w-0 flex-1 rounded-lg border border-[#cfd9cf] px-2.5 py-2 text-sm font-normal outline-none focus:border-[#5b8b73] focus:ring-4 focus:ring-[#5b8b73]/10" /><button title="Save label" aria-label="Save label" disabled={savingKey === link.shortKey || !editingLabel.trim()} onClick={() => saveLabel(link.shortKey)} className="text-[#5b8b73] disabled:opacity-40"><Check size={16} /></button><button title="Cancel editing" aria-label="Cancel editing" onClick={cancelEditing} className="text-[#718078]"><X size={16} /></button></div> : <span>{link.label || 'label1'}</span>}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[link.status || 'active']}`}>{(link.status || 'active').replace('-', ' ')}</span></td><td className="px-5 py-4 font-bold text-[#5b8b73]"><a href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortKey}</a></td><td className="max-w-67.5 truncate px-5 py-4 text-[#64716a]">{link.longUrl}</td><td className="whitespace-nowrap px-5 py-4 text-[#64716a]">{new Date(link.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 font-bold">{link.clicks}{link.maxClicks ? ` / ${link.maxClicks}` : ''}</td><td className="relative px-5 py-4"><button title="Link actions" aria-label={`Actions for ${link.label || link.shortKey}`} aria-expanded={menuKey === link.shortKey} onClick={() => setMenuKey((currentKey) => currentKey === link.shortKey ? null : link.shortKey)} className="rounded-lg p-2 text-[#718078] hover:bg-[#edf4ec] hover:text-[#17231f]"><MoreHorizontal size={18} /></button>{menuKey === link.shortKey && <div className="absolute right-5 z-10 mt-1 w-48 rounded-xl border border-[#d8dfd7] bg-white p-1 shadow-lg"><button onClick={() => { onViewAnalytics(link); setMenuKey(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#edf4ec]"><BarChart3 size={15} /> View analytics</button><button onClick={() => { startEditing(link); setMenuKey(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#edf4ec]"><Pencil size={15} /> Edit label</button><button disabled={savingKey === link.shortKey} onClick={() => { toggleDisabled(link); setMenuKey(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#edf4ec] disabled:opacity-40"><Power size={15} /> {link.disabled ? 'Enable link' : 'Disable link'}</button><button onClick={() => { setDeleteCandidate(link); setMenuKey(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#bb5d4c] hover:bg-[#fbe9e6]"><Trash2 size={15} /> Delete link</button></div>}</td></tr>)}</tbody></table></div>{deleteCandidate && <div className="fixed inset-0 z-20 grid place-items-center bg-[#17231f]/35 px-5" role="dialog" aria-modal="true" aria-labelledby="delete-link-title"><div className="w-full max-w-md rounded-2xl border border-[#d8dfd7] bg-white p-6 shadow-2xl"><p className="text-xs font-bold tracking-[0.14em] text-[#bb5d4c] uppercase">Critical operation</p><h3 id="delete-link-title" className="mt-1 text-2xl font-bold">Delete this short link?</h3><p className="mt-3 text-sm leading-6 text-[#64716a]">This permanently removes <span className="font-bold text-[#17231f]">{deleteCandidate.label || deleteCandidate.shortKey}</span>. The short URL will stop working and cannot be restored.</p><div className="mt-6 flex justify-end gap-3"><button disabled={savingKey === deleteCandidate.shortKey} onClick={() => setDeleteCandidate(null)} className="rounded-lg border border-[#cfd9cf] bg-white px-4 py-2.5 text-sm font-bold disabled:opacity-50">Cancel</button><button disabled={savingKey === deleteCandidate.shortKey} onClick={confirmDelete} className="rounded-lg bg-[#bb5d4c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{savingKey === deleteCandidate.shortKey ? 'Deleting...' : 'Yes, delete link'}</button></div></div></div>}</section>;
}

export default LinkLibrary;
