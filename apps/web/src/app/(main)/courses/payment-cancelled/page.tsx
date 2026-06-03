import { Suspense } from 'react';
import PaymentCancelledClient from './payment-cancelled-client';

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCancelledClient />
    </Suspense>
  );
}
