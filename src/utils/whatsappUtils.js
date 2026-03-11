/**
 * Formats a phone number for WhatsApp and opens the chat with a predefined message.
 * @param {string} phone - The raw phone number
 * @param {string} message - Optional message to send
 */
export function openWhatsApp(phone, message = "שלום ראיתי שפנית אלינו") {
  if (!phone) return;
  
  // Clean the phone number from non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format to international 972
  let formatted = cleaned;
  if (cleaned.startsWith('0')) {
    formatted = '972' + cleaned.substring(1);
  } else if (!cleaned.startsWith('972') && cleaned.length === 9) {
    formatted = '972' + cleaned;
  }
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formatted}?text=${encodedMessage}`, '_blank');
}
