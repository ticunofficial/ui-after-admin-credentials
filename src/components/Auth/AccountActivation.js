import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const AccountActivation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const token = searchParams.get('token');
        const response = await api.get(`/activate?token=${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Account activated successfully!');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Activation failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Account activation failed');
      }
    };

    activateAccount();
  }, [searchParams]);

  return (
    <div className="account-activation text-center">
      {status === 'loading' && <p>Activating your account...</p>}
      {status === 'success' && (
        <div className="success">
          <div className="success-icon">✓</div>
          <h2>Account Activated!</h2>
          <p>{message}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="error">
          <div className="error-icon">✗</div>
          <h2>Activation Failed</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default AccountActivation;