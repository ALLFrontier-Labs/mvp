const { DodoPayments } = require('dodopayments');
const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'test_sk_abc123',
  environment: 'test_mode',
});

async function run() {
  try {
    const payment = await dodo.payments.create({
      billing: { email: 'test@example.com' },
      payment_link: true,
      total_amount: 1000,
      currency: 'USD',
      return_url: `http://localhost:5173/billing?success=1`,
    });
    console.log(JSON.stringify(payment, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
