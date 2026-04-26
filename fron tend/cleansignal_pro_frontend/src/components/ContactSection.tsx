import React, { useState } from 'react';
import SectionTitle from './SectionTitle';
import { Contact } from '../types';
import { sendContact } from '../api';

interface ContactSectionProps {
  contact: Contact;
  setContact: (contact: Partial<Contact>) => void;
}

function ContactSection({ contact, setContact }: ContactSectionProps) {
  const [sent, setSent] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await sendContact(contact);
      setSent('Xabar qabul qilindi.');
    } catch {
      setSent('Demo: xabar local ko\'rinishda qabul qilindi.');
    }
  }

  const faqs = [
    'Is my identity safe?',
    'Can I stay anonymous?',
    'What evidence is valid?',
    'Can I get a reward?',
    'How long does it take?',
  ];

  return (
    <section>
      <SectionTitle icon="☎️" eyebrow="Contact & FAQ" title="Savollar uchun aloqa" subtitle="Foydalanuvchi reward, xavfsizlik, dalil va tracking bo'yicha javob olishi kerak." />
      <div className="contact-layout">
        <div>
          {faqs.map(q => (
            <details key={q}>
              <summary>{q}</summary>
              <p>CleanSignal anonim report, evidence safety va human review prinsiplariga asoslanadi. AI faqat yordamchi tahlil qiladi.</p>
            </details>
          ))}
        </div>
        <form onSubmit={submit}>
          <input
            placeholder="Name optional"
            value={contact.name}
            onChange={e => setContact({ ...contact, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={contact.email}
            onChange={e => setContact({ ...contact, email: e.target.value })}
          />
          <select
            value={contact.question_type}
            onChange={e => setContact({ ...contact, question_type: e.target.value })}
          >
            <option>technical issue</option>
            <option>report question</option>
            <option>reward question</option>
            <option>safety concern</option>
            <option>other</option>
          </select>
          <textarea
            placeholder="Message"
            value={contact.message}
            onChange={e => setContact({ ...contact, message: e.target.value })}
          />
          <button>Send message</button>
          {sent && <div className="success">{sent}</div>}
          <p className="contact-info">
            Hotline: +998 XX XXX XX XX<br />
            Email: support@cleansignal.uz
          </p>
        </form>
      </div>
    </section>
  );
}

export default ContactSection;