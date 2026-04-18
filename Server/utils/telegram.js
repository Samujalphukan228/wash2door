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

// ============================================
// NEW BOOKING (Online)
// ============================================
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
🏷️ <b>Type:</b> Online

👤 <b>Customer:</b> ${customer.firstName} ${customer.lastName}
📧 <b>Email:</b> ${customer.email}
📞 <b>Phone:</b> ${booking.phone}

🚗 <b>Service:</b> ${booking.serviceName}
📁 <b>Category:</b> ${booking.categoryName}
💰 <b>Price:</b> ₹${booking.price}
⏱ <b>Duration:</b> ${booking.duration} mins

📅 <b>Date:</b> ${bookingDate}
🕐 <b>Time:</b> ${booking.timeSlot}
${booking.isAdminSlot ? '🔐 <b>Admin Slot:</b> Yes' : ''}

📍 <b>Location:</b>
${booking.location.address}
${booking.location.city}

⏰ <b>Booked At:</b> ${new Date().toLocaleString('en-IN')}
`;

    return await sendTelegramNotification(message);
};

// ============================================
// NEW ADMIN/WALK-IN BOOKING
// ============================================
export const sendAdminBookingTelegram = async (booking) => {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const message = `
🔔 <b>NEW WALK-IN BOOKING!</b>

📋 <b>Booking Code:</b> ${booking.bookingCode}
🏷️ <b>Type:</b> Walk-in / Admin Created

👤 <b>Customer:</b> ${booking.walkInCustomer?.name || 'N/A'}
📞 <b>Phone:</b> ${booking.walkInCustomer?.phone || booking.phone || 'N/A'}

🚗 <b>Service:</b> ${booking.serviceName}
📁 <b>Category:</b> ${booking.categoryName}
💰 <b>Price:</b> ₹${booking.price}
⏱ <b>Duration:</b> ${booking.duration} mins

📅 <b>Date:</b> ${bookingDate}
🕐 <b>Time:</b> ${booking.timeSlot}
${booking.isAdminSlot ? '🔐 <b>Admin Slot:</b> Yes' : ''}

📍 <b>Location:</b>
${booking.location?.address || 'N/A'}
${booking.location?.city || 'N/A'}

💳 <b>Payment:</b> ${booking.paymentMethod || 'Cash'}

⏰ <b>Created At:</b> ${new Date().toLocaleString('en-IN')}
`;

    return await sendTelegramNotification(message);
};

// ============================================
// BOOKING CANCELLED
// ============================================
export const sendBookingCancelledTelegram = async (booking, cancelledBy = 'user') => {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const cancellerLabel = cancelledBy === 'admin' ? '👨‍💼 Admin' : '👤 Customer';

    const message = `
❌ <b>BOOKING CANCELLED!</b>

📋 <b>Booking Code:</b> ${booking.bookingCode}
🚫 <b>Cancelled By:</b> ${cancellerLabel}

👤 <b>Customer:</b> ${
    booking.customerId && typeof booking.customerId === 'object'
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in Customer'
}
📞 <b>Phone:</b> ${booking.phone || booking.walkInCustomer?.phone || 'N/A'}

🚗 <b>Service:</b> ${booking.serviceName}
💰 <b>Price:</b> ₹${booking.price}

📅 <b>Date:</b> ${bookingDate}
🕐 <b>Time:</b> ${booking.timeSlot}

${booking.cancellationReason ? `📝 <b>Reason:</b> ${booking.cancellationReason}` : ''}

⏰ <b>Cancelled At:</b> ${new Date().toLocaleString('en-IN')}
🔓 <b>Slot:</b> Now available for booking
`;

    return await sendTelegramNotification(message);
};

// ============================================
// BOOKING STATUS UPDATE
// ============================================
export const sendBookingStatusTelegram = async (booking, newStatus, updatedBy = 'admin') => {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusEmojis = {
        pending: '⏳',
        confirmed: '✅',
        completed: '🎉',
        cancelled: '❌'
    };

    const statusEmoji = statusEmojis[newStatus] || '📋';

    const message = `
${statusEmoji} <b>BOOKING STATUS UPDATED!</b>

📋 <b>Booking Code:</b> ${booking.bookingCode}
🔄 <b>New Status:</b> ${newStatus.toUpperCase()}

👤 <b>Customer:</b> ${
    booking.customerId && typeof booking.customerId === 'object'
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in Customer'
}
📞 <b>Phone:</b> ${booking.phone || booking.walkInCustomer?.phone || 'N/A'}

🚗 <b>Service:</b> ${booking.serviceName}
💰 <b>Price:</b> ₹${booking.price}

📅 <b>Date:</b> ${bookingDate}
🕐 <b>Time:</b> ${booking.timeSlot}

👨‍💼 <b>Updated By:</b> ${updatedBy}
⏰ <b>Updated At:</b> ${new Date().toLocaleString('en-IN')}
${newStatus === 'completed' ? '\n💵 <b>Revenue Added:</b> ₹' + booking.price : ''}
`;

    return await sendTelegramNotification(message);
};

// ============================================
// BOOKING RESCHEDULED
// ============================================
export const sendBookingRescheduledTelegram = async (booking, oldDate, oldSlot, newDate, newSlot) => {
    const oldDateFormatted = new Date(oldDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const newDateFormatted = new Date(newDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const message = `
📅 <b>BOOKING RESCHEDULED!</b>

📋 <b>Booking Code:</b> ${booking.bookingCode}

👤 <b>Customer:</b> ${
    booking.customerId && typeof booking.customerId === 'object'
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in Customer'
}
📞 <b>Phone:</b> ${booking.phone || booking.walkInCustomer?.phone || 'N/A'}

🚗 <b>Service:</b> ${booking.serviceName}
💰 <b>Price:</b> ₹${booking.price}

<b>Old Schedule:</b>
📅 ${oldDateFormatted}
🕐 ${oldSlot}

<b>New Schedule:</b>
📅 ${newDateFormatted}
🕐 ${newSlot}
${booking.isAdminSlot ? '🔐 <b>Admin Slot:</b> Yes' : ''}

⏰ <b>Rescheduled At:</b> ${new Date().toLocaleString('en-IN')}
`;

    return await sendTelegramNotification(message);
};

export default sendTelegramNotification;