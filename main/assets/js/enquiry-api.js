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
      throw new Error(data.error || 'Enquiries are temporarily unavailable. Please try WhatsApp or contact MACHO directly.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Please check before submitting again to avoid duplicates.');
    if (error instanceof TypeError) throw new Error('Connection failed. Your message is still in the form; please retry when connected.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
