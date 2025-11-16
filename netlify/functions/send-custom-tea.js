const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Allow': 'POST', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { customerName, customerEmail, customerPhone, dreamTea, quantity, lang, honeypot } = body;

    // Honeypot check for bots
    if (honeypot) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    }

    if (!customerName || !customerEmail || !dreamTea) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing required fields.' }) };
    }

    // Localized email content
    let subject, greeting, detailsLabel, thanks;
    switch (lang) {
      case 'ar':
        subject = `طلب شاي مخصص من ${customerName}`;
        greeting = 'مرحباً،\n\nتم إرسال طلب شاي مخصص جديد بالمواصفات التالية:';
        detailsLabel = 'التفاصيل';
        thanks = 'مع التحية';
        break;
      case 'fr':
        subject = `Demande de thé personnalisé de ${customerName}`;
        greeting = 'Bonjour,\n\nUne nouvelle demande de thé personnalisé a été soumise avec les détails suivants:';
        detailsLabel = 'Détails';
        thanks = 'Cordialement';
        break;
      default:
        subject = `Custom Tea Request from ${customerName}`;
        greeting = 'Hello,\n\nA new custom tea request was submitted with the following details:';
        detailsLabel = 'Details';
        thanks = 'Regards';
    }

    const text = [
      greeting,
      '',
      `${detailsLabel}:`,
      `Name: ${customerName}`,
      `Email: ${customerEmail}`,
      `Phone: ${customerPhone || 'Not provided'}`,
      `Quantity: ${quantity || 'N/A'}`,
      '',
      'Dream Tea Description:',
      dreamTea,
      '',
      thanks,
      'Naghma Tea Website'
    ].join('\n');

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, TO_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !TO_EMAIL) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Email service not configured.' }) };
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: TO_EMAIL,
      replyTo: customerEmail,
      subject,
      text,
    });

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, id: info.messageId }) };
  } catch (err) {
    console.error('netlify send-custom-tea error:', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Failed to send message.' }) };
  }
};
