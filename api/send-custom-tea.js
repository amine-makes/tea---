const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      dreamTea,
      quantity,
      lang,
      honeypot
    } = req.body || {};

    // Simple spam honeypot
    if (honeypot) {
      return res.status(200).json({ ok: true });
    }

    // Basic validation
    if (!customerName || !customerEmail || !dreamTea) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Build localized subject/text
    let subject;
    let greeting;
    let detailsLabel;
    let thanks;

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

    const lines = [
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
    ];

    const text = lines.join('\n');

    // SMTP configuration from environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_SECURE,
      SMTP_FROM,
      TO_EMAIL
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !TO_EMAIL) {
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: TO_EMAIL,
      replyTo: customerEmail,
      subject,
      text,
    });

    return res.status(200).json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error('send-custom-tea error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};
