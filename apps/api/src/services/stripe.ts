import Stripe from 'stripe';

// Stripe client - only initialize if we have a valid key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey && stripeSecretKey.length > 0
  ? new (Stripe as any)(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia' as any,
    })
  : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

export interface CoursePaymentData {
  courseId: string;
  courseTitle: string;
  price: number; // in cents
  userId: string;
  userEmail: string;
}

// Create a Stripe checkout session for course purchase
export async function createCourseCheckoutSession(data: CoursePaymentData): Promise<{ sessionId: string; url: string }> {
  const { courseId, courseTitle, price, userId, userEmail } = data;

  if (!isStripeConfigured()) {
    throw new Error('Stripe no está configurado. Agrega STRIPE_SECRET_KEY al .env');
  }

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Curso PRO: ${courseTitle}`,
            description: 'Acceso completo al curso con contenido premium',
            images: ['https://duobijac.com/logo.png'],
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId,
      userId,
    },
    success_url: `${FRONTEND_URL}/dashboard?course_purchased=${courseId}&payment=success`,
    cancel_url: `${FRONTEND_URL}/courses?payment=cancelled`,
  });

  return { sessionId: session.id, url: session.url! };
}

// Verify and process payment success (called from webhook)
export async function verifyPaymentSession(sessionId: string): Promise<{
  success: boolean;
  courseId?: string;
  userId?: string;
  paymentId?: string;
  amount?: number;
}> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return {
        success: true,
        courseId: session.metadata?.courseId,
        userId: session.metadata?.userId,
        paymentId: session.id,
        amount: session.amount_total || 0,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    return { success: false };
  }
}

// Create refund for a payment
export async function createRefund(paymentId: string): Promise<{ success: boolean; refundId?: string }> {
  try {
    const refund = await getStripe().refunds.create({
      payment_intent: paymentId,
    });

    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Error creating refund:', error);
    return { success: false };
  }
}

// Verify Stripe webhook signature
export function constructWebhookEvent(payload: string, signature: string): any {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurado');
  }

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(stripeSecretKey && stripeSecretKey.length > 0);
}

// Get stripe instance or throw if not configured
function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe no está configurado. Agrega STRIPE_SECRET_KEY al .env');
  }
  return stripe as Stripe;
}

export { stripe };