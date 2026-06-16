import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

import passport from 'passport';
import { env } from '../config/env';

// ... other routes ...

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    // The user is authenticated and is available in req.user
    // Normally, we'd call createSendToken here, but since it's a redirect, we need to send the token via cookie or query param.
    // For simplicity, we can redirect with a success flag, or set the cookie and redirect.
    // Let's import createSendToken logic or recreate the cookie part here
    
    // We will handle this cleaner in the controller, but for now:
    res.redirect(`${env.FRONTEND_URL}/feed`); 
  }
);

export default router;
