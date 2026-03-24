// utils/telegram.js

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Base function to send any message
export const sendTelegramNotification = async (message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

// New Booking Notification for Admin
export const sendNewBookingTelegram = async (booking, customer) => {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

const message = `
🔔 <b>NEW BOOKING!</b>

📋 <b>Booking Code:</b> ${booking.bookingCode}

👤 <b>Customer:</b> ${customer.firstName} ${customer.lastName}
📧 <b>Email:</b> ${customer.email}
📞 <b>Phone:</b> ${booking.phone}

🚗 <b>Service:</b> ${booking.serviceName}
📁 <b>Category:</b> ${booking.categoryName}
💰 <b>Price:</b> Rs. ${booking.price}
⏱ <b>Duration:</b> ${booking.duration} mins

📅 <b>Date:</b> ${bookingDate}
🕐 <b>Time:</b> ${booking.timeSlot}

📍 <b>Location:</b>
${booking.location.address}
${booking.location.city}

⏰ ${new Date().toLocaleString('en-IN')}
`;

    return await sendTelegramNotification(message);
};

export default sendTelegramNotification;