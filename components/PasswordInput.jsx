'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Şifre / admin anahtarı alanı + göster-gizle düğmesi.
// Etiketler dışarıdan gelebilir: müşteri ekranları çeviriden geçer,
// yalnız Türkçe olan yönetim ekranları varsayılanı kullanır.
export default function PasswordInput({
  className = '',
  showLabel = 'Şifreyi göster',
  hideLabel = 'Şifreyi gizle',
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const label = visible ? hideLabel : showLabel;

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className} pr-11`} />
      {/* type="button": form içindeyken göze basmak formu göndermesin. */}
      <button type="button" onClick={() => setVisible((v) => !v)}
        aria-label={label} aria-pressed={visible} title={label} tabIndex={-1}
        className="absolute right-0 top-0 h-full px-3 flex items-center text-textmut hover:text-charcoal">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
