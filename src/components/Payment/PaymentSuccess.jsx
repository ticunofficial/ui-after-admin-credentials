import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-success text-center">
      <div className="success-icon">✓</div>
      <h2>Payment Successful!</h2>
      <p>Your payment has been processed successfully.</p>
      <p>Redirecting to dashboard...</p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="btn btn-primary"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccess;