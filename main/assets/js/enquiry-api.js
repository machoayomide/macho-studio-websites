/* MACHO enquiry delivery — no mail client, no third-party scripts. */
export async function sendEnquiry(values) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const result = await fetch('/api/enquiry', {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify(values),
      signal: controller.signal
    });
    let data = {};
    try { data = await result.json(); } catch (_) { /* Misconfigured backend. */ }
    if (!result.ok || data.ok !== true) {
      throw new Error(data.error || 'The contact form is not working right now. Please use WhatsApp to reach MACHO.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('This took too long. Please check if your message arrived before trying again.');
    if (error instanceof TypeError) throw new Error('There is no connection. Your message is still here. Try again when you are online.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
