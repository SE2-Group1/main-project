import { useState } from 'react';

import PropTypes from 'prop-types';

import { Button } from '../../../components/Button.jsx';
import { InputText } from '../../../components/InputText.jsx';
import { LoginButton } from './LoginButton.jsx';
import './style.css';

export const LoginForm = ({
  setUsername,
  setPassword,
  password,
  onSubmit,
  error,
  setError,
  onBack, // New prop for handling the Back button
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <form>
      <label className="title-login">Login</label>
      <div className="input-container">
        <InputText
          placeholder="Username"
          style={{
            width: '100%',
            border: 'none',
          }}
          minLength={3}
          required={true}
          handleChange={e => {
            setUsername(e.target.value);
            setError(false);
          }}
          error={error}
        />
        <img
          className="icon-button"
          src="/icons/profileIcon.svg"
          alt="profileIcon"
          style={{ cursor: 'default' }}
        />
      </div>

      <div className="input-container">
        <InputText
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Password"
          style={{
            width: '100%',
          }}
          minLength={3}
          required={true}
          handleChange={e => setPassword(e.target.value)} // Handle password input
        />
        {password === '' && (
          <img
            className="icon-button"
            src="/icons/passwordIcon.svg"
            alt="profileIcon"
          />
        )}
        {password !== '' && (
          <button
            type="button"
            className="icon-button"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <i style={{ width: 40 }} className="bi bi-eye-slash-fill h4"></i>
            ) : (
              <i className="bi bi-eye-fill h4"></i>
            )}
          </button>
        )}
      </div>

      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          marginTop: '60px',
          paddingLeft: '40px',
          paddingRight: '40px',
          gap: '40px',
        }}
      >
        {/* Back button */}

        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          style={{ width: '100%' }}
        >
          Back
        </Button>

        <LoginButton submit={onSubmit} />
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  error: PropTypes.bool,
  setError: PropTypes.func,
  onBack: PropTypes.func,
};
