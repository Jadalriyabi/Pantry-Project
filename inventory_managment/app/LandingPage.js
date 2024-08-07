// components/LandingPage.js
import { useState } from 'react';
import { Box, Button, TextField, Typography, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LandingPage = ({ onSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleToggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSignUp = async () => {
    const auth = getAuth();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSignIn();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignIn = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSignIn();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ backgroundImage: 'url(background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Typography variant="h2" color="primary" gutterBottom>
        PantryPal
      </Typography>
      <Typography variant="h6" color="secondary" gutterBottom>
        Manage your pantry with ease
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {isSignUp && (
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={isSignUp ? handleSignUp : handleSignIn}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </Box>
      <Link href="#" onClick={handleToggleForm} underline="hover" color="primary">
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </Link>
    </Box>
  );
};

export default LandingPage;