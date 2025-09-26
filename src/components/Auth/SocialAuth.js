import React from 'react';

const SocialAuth = () => {
  const handleSocialLogin = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/login/${provider}`;
  };

  return (
    <div className="social-auth">
      <div className="social-buttons">
        <button 
          onClick={() => handleSocialLogin('google')}
          className="btn btn-google"
        >
          Login with Google
        </button>
        <button 
          onClick={() => handleSocialLogin('facebook')}
          className="btn btn-facebook"
        >
          Login with Facebook
        </button>
      </div>
    </div>
  );
};

export default SocialAuth;