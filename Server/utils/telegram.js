// utils/telegram.js

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const sendTelegramNotification = async (message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (data.ok) {
            console.log('✅ Telegram notification sent!');
            return { success: true, data };
        } else {
            console.error('❌ Telegram Error:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ Telegram Error:', error.message);
        return { success: false, error: error.message };
    }
};

export const sendNewBookingTelegram = async (booking, customer) => {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const now = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const landmark = booking.location.landmark
        ? `\n┃  <i>📌 ${booking.location.landmark}</i>`
        : '';

    const notes = booking.specialNotes
        ? `\n┃\n┃  📝 <b>Notes</b>\n┃  <i>${booking.specialNotes}</i>`
        : '';

    const message = `
╔═══════════════════════╗
  🚿 <b>WASH2DOOR</b> · New Booking
╚═══════════════════════╝

🆔  <code>${booking.bookingCode}</code>

┌─ 👤 <b>CUSTOMER</b>
┃  ${customer.firstName} ${customer.lastName}
┃  <code>${customer.email}</code>
┃  <code>${customer.phone ?? 'N/A'}</code>

┌─ 🧹 <b>SERVICE</b>
┃  ${booking.serviceName}
┃  <i>${booking.categoryName}</i>
┃  💰 <b>Rs. ${booking.price}</b>  ·  ⏱ ${booking.duration} mins

┌─ 📅 <b>SCHEDULE</b>
┃  ${bookingDate}
┃  🕐 ${booking.timeSlot}

┌─ 📍 <b>LOCATION</b>
┃  ${booking.location.address}
┃  ${booking.location.city}${landmark}
${notes}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🟢 <b>Status:</b> Awaiting Confirmation
🕰 Received: <i>${now}</i>
`;

    return await sendTelegramNotification(message);
};

// Booking confirmed notification
export const sendBookingConfirmedTelegram = async (booking, customer) => {
    const message = `
✅ <b>BOOKING CONFIRMED</b>

🆔 <code>${booking.bookingCode}</code>
👤 ${customer.firstName} ${customer.lastName}
🧹 ${booking.serviceName}
📅 ${new Date(booking.bookingDate).toLocaleDateString('en-IN')} · 🕐 ${booking.timeSlot}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
Customer has been notified.
`;
    return await sendTelegramNotification(message);
};

// Booking cancelled notification
export const sendBookingCancelledTelegram = async (booking, customer, reason = '') => {
    const message = `
❌ <b>BOOKING CANCELLED</b>

🆔 <code>${booking.bookingCode}</code>
👤 ${customer.firstName} ${customer.lastName}
🧹 ${booking.serviceName}
📅 ${new Date(booking.bookingDate).toLocaleDateString('en-IN')} · 🕐 ${booking.timeSlot}
${reason ? `\n📋 <b>Reason:</b> <i>${reason}</i>` : ''}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
Customer has been notified.
`;
    return await sendTelegramNotification(message);
};

export default sendTelegramNotification;