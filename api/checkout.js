// /api/checkout.js
import Stripe from 'stripe';

export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { lang = 'pt', provider } = req.query;

  if (provider === 'paypal') {
    // redirecione para seu botão/checkout PayPal criado no dashboard
    return res.redirect(302, process.env.PAYPAL_CHECKOUT_URL);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'pix'], // Pix ativo no BR
    line_items: [{
      price_data: {
        currency: (lang === 'pt' ? 'brl' : 'usd'),
        unit_amount: (lang === 'pt' ? 4900 : 1200), // R$49 / $12
        product_data: { name: (lang==='pt'?'E-book Sabores do Brasil':'Flavors of Brazil e-book') }
      },
      quantity: 1
    }],
    success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/#cancel`,
    locale: (lang === 'pt' ? 'pt-BR' : 'en'),
  });

  return res.redirect(303, session.url);
}
