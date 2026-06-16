import { NextRequest, NextResponse } from 'next/server';

const ECOMAIL_API = 'https://api2.ecomailapp.cz';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; gender?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, name, gender, lang } = body;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const apiKey = process.env.ECOMAIL_API_KEY;
  const listId = process.env.ECOMAIL_LIST_ID;

  if (!apiKey || !listId) {
    console.error('[subscribe] Missing ECOMAIL_API_KEY or ECOMAIL_LIST_ID env vars');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const subscriberData: Record<string, unknown> = { email };

  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    subscriberData.name = parts[0];
    if (parts.length > 1) subscriberData.surname = parts.slice(1).join(' ');
  }

  const tags = ['pride2026'];
  if (gender) tags.push(gender); // 'guy' | 'girl' | 'queer'
  subscriberData.tags = tags;

  if (lang) {
    subscriberData.language = lang;
  }

  const payload = {
    subscriber_data: subscriberData,
    trigger_autoresponders: true,
    update_existing: true,
  };

  try {
    const res = await fetch(`${ECOMAIL_API}/lists/${listId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        key: apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[subscribe] Ecomail error ${res.status}:`, text);
      return NextResponse.json({ error: 'Subscription failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] Ecomail fetch error:', err);
    return NextResponse.json({ error: 'Network error' }, { status: 502 });
  }
}
