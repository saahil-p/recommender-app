import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import CreateUser from './CreateUser';
import ForgotPassword from './ForgotPassword';

function App() {
  // Initialize auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken');
    return !!token;
  });
  const [studentInput, setStudentInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationType, setRecommendationType] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Check token validity on mount and refresh
  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:5001/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      handleLogout();
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log("")
      const response = await axios.delete('http://127.0.0.1:5001/delete-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        handleLogout();
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteError('Failed to delete account. Please try again later.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setRecommendations([]);
    setStudentInput('');
  };

  const handleInputChange = (e) => {
    setStudentInput(e.target.value);
  };

  const getRecommendations = async (type) => {
    setRecommendationType(type);
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('authToken');
      console.log("")
      const response = await fetch(`http://127.0.0.1:5001/recommend/${type}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ student_input: studentInput })
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error.message || 'Error fetching recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:5001/login', 
        { SRN: username, password: password }, 
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.access_token);
        setIsAuthenticated(true);
        setLoginError('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Invalid username or password. Please try again.');
    }
  };
  const navigate = useNavigate();

  const handleUserCreated = () => {
    setIsAuthenticated(false);
    navigate("/login")
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  // Delete Account Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      borderRadius: '5px',
      zIndex: 1000
    }}>
      <h3>Confirm Account Deletion</h3>
      <p>Are you sure you want to delete your account? This action cannot be undone.</p>
      <div>
        <button 
          onClick={handleDeleteAccount}
          style={{ backgroundColor: 'red', color: 'white', marginRight: '10px', padding: '5px 10px' }}
        >
          Delete Account
        </button>
        <button 
          onClick={() => setShowDeleteConfirm(false)}
          style={{ padding: '5px 10px' }}
        >
          Cancel
        </button>
      </div>
      {deleteError && <p style={{ color: 'red', marginTop: '10px' }}>{deleteError}</p>}
    </div>
  );

  return (

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Course and Job Recommender</h1>
        
        {/* Navigation Links */}
        <nav>
          {isAuthenticated ? (
            <>
              <Link to="/recommendations" style={{ margin: '0 10px' }}>Recommendations</Link>
              <button onClick={handleLogout} style={{ marginRight: '10px' }}>Logout</button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
              >
                Delete Account
              </button>
            </>
          ) : 
          (
            <>
              {/* <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
              <Link to="/signup" style={{ margin: '0 10px' }}>Sign Up</Link> */}
            </>
          )}
        </nav>

        {showDeleteConfirm && <DeleteConfirmationModal />}

        <Routes>
          {/* Redirect to login if not authenticated */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/recommendations" : "/login"} />} />
          
          {/* Login Route */}
          <Route path="/login" element={!isAuthenticated ? (
            <div>
              <h1>Login</h1>
              <Login onLogin={handleLogin} />
              {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
            </div>
          ) : (
            <Navigate to="/recommendations" />
          )} />

          {/* Sign Up Route */}
          <Route path="/signup" element={!isAuthenticated ? (
            <div>
              <h1>Sign Up</h1>
              <CreateUser onUserCreated={handleUserCreated} />
            </div>
          ) : (
            <Navigate to="/login"/>
          )} />

          {/* Recommendations Route */}
          <Route path="/recommendations" element={isAuthenticated ? (
            <div>
              <input
                type="text"
                value={studentInput}
                onChange={handleInputChange}
                placeholder="Enter your skills"
                style={{ padding: '8px', width: '60%' }}
              />
              <br /><br />
              <button onClick={() => getRecommendations('courses')} style={{ padding: '10px', marginRight: '10px' }}>
                Recommend Courses
              </button>
              <button onClick={() => getRecommendations('jobs')} style={{ padding: '10px' }}>
                Recommend Jobs
              </button>

              {loading && <p>Loading recommendations...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}

              <h2>Recommendations</h2>
              <ul>
                {recommendations.length > 0 ? (
                  recommendations.map((item, index) => (
                    <li key={index}>
                      {recommendationType === 'courses' ? item.course_title : item.job_title}
                    </li>
                  ))
                ) : (
                  !loading && <p>No recommendations found.</p>
                )}
              </ul>
            </div>
          ) : (
            <Navigate to="/login" />
          )} />
          <Route path="/forgot-password" element={!isAuthenticated ? (
            <ForgotPassword />
          ) : (
            <Navigate to="/recommendations" />
          )} />
        </Routes>
      </div>

  );
}

export default App;