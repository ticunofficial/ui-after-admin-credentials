import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const response = await api.post('/callback', params);
        
        if (response.data.success) {
          setStatus('success');
          setTimeout(() => navigate('/app/dashboard'), 2000);
        } else {
          setStatus('failed');
        }
      } catch (err) {
        setStatus('failed');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="payment-callback text-center">
      {status === 'processing' && <p>Processing payment...</p>}
      {status === 'success' && (
        <div>
          <h2>Payment Successful!</h2>
          <p>Redirecting to dashboard...</p>
        </div>
      )}
      {status === 'failed' && (
        <div>
          <h2>Payment Failed</h2>
          <button onClick={() => navigate('/app/payments')}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;