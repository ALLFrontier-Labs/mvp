const { DodoPayments } = require('dodopayments');
const dodo = new DodoPayments({
  bearerToken: 'nUCHDWMGW4NXVmvX.cbGqYTXZOgYrSFp4KAAOoELWUuX4wuGQSbvW5y2FDc_8ZPBj',
  environment: 'test_mode',
});

async function run() {
  try {
    const payment = await dodo.payments.create({
      payment_link: true,
      customer: {
        email: 'test@example.com',
        name: 'Test Customer'
      },
      product_cart: [{ product_id: 'prod_test', amount: 1000, quantity: 1 }],
      currency: 'USD',
      return_url: `http://localhost:5173/billing?success=1`,
    });
    console.log(JSON.stringify(payment, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
