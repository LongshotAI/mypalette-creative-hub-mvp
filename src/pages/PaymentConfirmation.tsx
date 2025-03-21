
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import PaymentConfirmationComponent from '@/components/payment/PaymentConfirmation';

const PaymentConfirmationPage = () => {
  return (
    <DefaultLayout>
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Payment Confirmation</h1>
        <PaymentConfirmationComponent />
      </div>
    </DefaultLayout>
  );
};

export default PaymentConfirmationPage;
