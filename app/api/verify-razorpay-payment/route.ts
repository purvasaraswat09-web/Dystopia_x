import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const key_secret = 'T4frCCjqwMrVhB9fii1ymnND';
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
