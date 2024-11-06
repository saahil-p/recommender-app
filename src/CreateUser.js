// CreateUser.js
import React, { useState } from 'react';
import axios from 'axios';

function CreateUser({ onUserCreated }) {
  const [srn, setSrn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSRNChange = (e) => {
    setSrn(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://127.0.0.1:5001/signup', {
        SRN: srn,          // Use the key "SRN" with the value from the variable `srn`
        password: password // Use the key "password" with the value from the variable `password`
      }, {
        headers: {
          'Content-Type': 'application/json' // Explicitly set the Content-Type header
        }
      });
      

      if (response.status === 201) {
        setSuccess('User created successfully!');
        onUserCreated(); // Call parent function to refresh state
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error creating user. Please try again.');
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={srn}
          onChange={handleSRNChange}
          placeholder="Enter SRN"
          required
          style={{ padding: '8px', width: '60%' }}
        />
        <br /><br />
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter Password"
          required
          style={{ padding: '8px', width: '60%' }}
        />
        <br /><br />
        <button type="submit" style={{ padding: '10px' }}>Create User</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default CreateUser;
