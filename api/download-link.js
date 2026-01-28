// /api/download-link.js
import Stripe from 'stripe';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: { accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET }
});

export default async function handler(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ message: 'Pagamento pendente ou não confirmado.' });
    }

    // gera link com expiração (ex.: 15 minutos)
    const cmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: process.env.S3_EBOOK_KEY // ex.: 'ebooks/sabores-do-brasil.pdf'
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 15 * 60 });

    // TODO (opcional): enviar e-mail com o link via Resend
    // await resend.emails.send({ to: session.customer_details.email, ... })

    res.json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro ao gerar link.' });
  }
}
