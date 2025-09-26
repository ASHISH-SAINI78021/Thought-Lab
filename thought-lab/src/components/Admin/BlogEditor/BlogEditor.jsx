import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment
} from '@mui/material';

// Importing icons for a richer UI
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { useAuth } from '../../../Context/auth';
import { promoteToAdmin } from '../../../http'; // Import the axios function

const PromoteUserForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useAuth();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Guard clause: Ensure user is authenticated before sending request
    if (!auth?.token) {
        setSnackbar({ open: true, message: 'Authentication error: No token found. Please log in.', severity: 'error' });
        setLoading(false);
        return;
    }

    try {
      // Use axios instead of fetch
      const response = await promoteToAdmin({ email });

      setSnackbar({
        open: true,
        message: response.data.message || 'User successfully promoted to Admin!',
        severity: 'success'
      });
      setEmail('');

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to promote user.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 4, 
        maxWidth: 500, 
        margin: 'auto', 
        mt: 5,
        borderRadius: '12px',
        background: 'linear-gradient(to top right, #ffffff, #f4f6f8)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h5" component="h1" fontWeight="600">
            Admin Promotion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Grant administrative privileges to a user.
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="User Email Address"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<UpgradeIcon />}
              disabled={loading || !email}
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
                }
              }}
            >
              {loading ? 'Processing...' : 'Promote User'}
            </Button>
            {loading && (
              <CircularProgress
                size={28}
                sx={{
                  color: 'white',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-14px',
                  marginLeft: '-14px',
                }}
              />
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PromoteUserForm;