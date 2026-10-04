import React, { useState } from 'react';
import { X, Receipt, CheckCircle, Smartphone, CreditCard, DollarSign } from 'lucide-react';
import { InvoiceDetails } from '../../../types';

interface InChatInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvoice: (invoice: InvoiceDetails, noteMessage: string) => void;
  recipientName: string;
}

export const InChatInvoiceModal: React.FC<InChatInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSendInvoice,
  recipientName,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TZS');
  const [description, setDescription] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    'M-Pesa',
    'Airtel Money',
    'Tigo Pesa',
    'Kadi (Card)',
  ]);
  const [noteMessage, setNoteMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInvoice: InvoiceDetails = {
      invoiceNumber,
      title: title.trim(),
      amount: numAmount,
      currency,
      description: description.trim() || undefined,
      status: 'pending',
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toLocaleDateString(),
      acceptedMethods: selectedMethods,
    };

    onSendInvoice(
      newInvoice,
      noteMessage.trim() || `Tafadhali kamilisha malipo ya ${currency} ${numAmount.toLocaleString()} kwa ajili ya "${title.trim()}".`
    );
    onClose();
  };

  const toggleMethod = (method: string) => {
    if (selectedMethods.includes(method)) {
      if (selectedMethods.length > 1) {
        setSelectedMethods(selectedMethods.filter((m) => m !== method));
      }
    } else {
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#111728] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Tuma Ankara / Ombi la Malipo</h3>
              <p className="text-xs text-cyan-300">Kwa mteja: {recipientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Jina la Bidhaa au Huduma <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mf. Wireless Earbuds Pro / Usafirishaji / Huduma ya Ushauri"
              className="w-full bg-[#171F36] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Amount & Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kiasi cha Malipo <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#171F36] border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-bold focus:outline-none shrink-0"
              >
                <option value="TZS">TZS (Tanzania)</option>
                <option value="KES">KES (Kenya)</option>
                <option value="USD">USD ($)</option>
                <option value="UGX">UGX (Uganda)</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Mf. 45000"
                  className="w-full bg-[#171F36] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Maelezo ya Ziada (Hiari)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mf. Mzigo utawasilishwa kesho saa 5 asubuhi baada ya uthibitisho wa malipo..."
              className="w-full bg-[#171F36] border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Njia za Malipo Zinazokubalika
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['M-Pesa', 'Airtel Money', 'Tigo Pesa', 'Kadi (Card)'].map((method) => {
                const isSelected = selectedMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleMethod(method)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {method.includes('Kadi') ? (
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {method}
                    </span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 transition-colors"
            >
              Ghairi (Cancel)
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !amount}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              Tuma Ankara (Send Invoice)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
