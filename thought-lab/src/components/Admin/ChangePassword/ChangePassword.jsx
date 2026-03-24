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
    InputAdornment,
    IconButton
} from '@mui/material';

// Importing icons for a richer UI
import LockIcon from '@mui/icons-material/Lock';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useAuth } from '../../../Context/auth';
import { changeUserPassword } from '../../../http'; // Import the axios function

const ChangePasswordForm = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [auth] = useAuth();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleClickShowPassword = () => setShowPassword((show) => !show);

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
            const response = await changeUserPassword({ email, newPassword });

            setSnackbar({
                open: true,
                message: response.data.message || 'Password successfully changed!',
                severity: 'success'
            });
            setEmail('');
            setNewPassword('');

        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to change password.',
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
                <VpnKeyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                    <Typography variant="h5" component="h1" fontWeight="600">
                        Change User Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Reset the password for any user account.
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
                    <TextField
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<VpnKeyIcon />}
                            disabled={loading || !email || !newPassword}
                            fullWidth
                            sx={{
                                py: 1.5,
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(45deg, #FF5722 30%, #FF8A65 90%)',
                                boxShadow: '0 3px 5px 2px rgba(255, 87, 34, .3)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 10px 4px rgba(255, 87, 34, .3)',
                                }
                            }}
                        >
                            {loading ? 'Processing...' : 'Change Password'}
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

export default ChangePasswordForm;
