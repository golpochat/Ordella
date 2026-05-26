'use client';

import { useState } from 'react';
import { Button, Input } from '@shared-ui';
import { createSupportChatTicket } from '@/lib/api';

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const ticket = await createSupportChatTicket({
      name,
      email,
      subject,
      category: 'general',
      priority: 'medium',
      message,
    });
    setStatus(`Ticket ${ticket.id.slice(0, 8)} created.`);
    setSubject('');
    setMessage('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 w-80 max-w-[calc(100vw-2rem)]">
      {open ? (
        <div className="rounded-xl border bg-background p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-semibold">Need help?</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          {status ? <p className="mb-2 text-sm text-muted-foreground">{status}</p> : null}
          <form className="space-y-2" onSubmit={(event) => void submit(event)}>
            <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
            <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="How can we help?" value={message} onChange={(event) => setMessage(event.target.value)} required />
            <Button type="submit" className="w-full">Start support ticket</Button>
          </form>
        </div>
      ) : (
        <Button type="button" className="w-full shadow-lg" onClick={() => setOpen(true)}>
          Support
        </Button>
      )}
    </div>
  );
}
