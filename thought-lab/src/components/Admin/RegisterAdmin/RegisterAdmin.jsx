import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete
} from '@mui/material';

// Importing icons for a richer UI
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';

const PromoteUserForm = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('mentor');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [auth] = useAuth();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token) return;
      try {
        const response = await fetch(`${url}/users`, {
          headers: { 'Authorization': auth.token }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    fetchUsers();
  }, [auth?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!auth?.token) {
      setSnackbar({ open: true, message: 'Authentication error: No token found. Please log in.', severity: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${url}/admin/change-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth?.token
        },
        body: JSON.stringify({ email, role })
      });
      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message || `User successfully updated to ${role}!`,
          severity: 'success'
        });
        setEmail('');
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to update user role.',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Network error occurred. Failed to process role change.',
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
        p: { xs: 3, sm: 4 },
        maxWidth: 500,
        mx: { xs: 2, sm: 'auto' },
        mt: 5,
        borderRadius: '12px',
        background: 'linear-gradient(to top right, #ffffff, #f4f6f8)',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h5" component="h1" fontWeight="600" sx={{ fontSize: { xs: '22px', sm: '28px' } }}>
            User Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
            Assign roles to existing users.
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            isOptionEqualToValue={(option, value) => option.email === value.email}
            onChange={(event, newValue) => {
              setEmail(newValue ? newValue.email : '');
            }}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search User by Name or Email"
                variant="outlined"
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <AlternateEmailIcon color="action" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  sx: { fontSize: '16px' }
                }}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  sx: { fontSize: '16px' }
                }}
              />
            )}
            noOptionsText="No users found"
          />

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Select Role"
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="student">Student / Default User</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<UpgradeIcon />}
              disabled={loading || !email}
              fullWidth
              sx={{
                py: '16px',
                fontSize: '18px',
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
              {loading ? 'Processing...' : 'Apply Role'}
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