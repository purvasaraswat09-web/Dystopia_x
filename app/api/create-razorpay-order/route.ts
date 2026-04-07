import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    const key_id = 'rzp_test_SZu9r2VeGMvtxD';
    const key_secret = 'T4frCCjqwMrVhB9fii1ymnND';
    const credentials = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amount, // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: order }, { status: response.status });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
