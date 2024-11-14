import { useState } from 'react';

import PropTypes from 'prop-types';

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
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <form onSubmit={onSubmit}>
      <label className="title-login">Login</label>
      <InputText
        placeholder="Username"
        style={{
          width: '100%',
          border: 'none',
        }}
        iconUrl="../../../public/icons/profileIcon.svg"
        minLength={3}
        required={true}
        handleChange={e => {
          setUsername(e.target.value);
          setError(false);
        }}
        error={error}
      />
      <div className="input-container">
        <InputText
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Password"
          style={{
            width: '100%',
          }}
          iconUrl={
            password !== '' ? 'none' : '../../../public/icons/passwordIcon.svg'
          }
          minLength={3}
          required={true}
          handleChange={e => setPassword(e.target.value)} // Gestione dell'input password
        />
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
      <LoginButton type="submit" />
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
};
