import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.model';
import { env } from './env';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.FRONTEND_URL}/api/v1/auth/google/callback`, // This should point to our express backend URL, updating to env.API_URL or similar later
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found from Google'), false);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;
        const fullName = profile.displayName;
        const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined;

        let user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have a googleId, link it
          if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profilePicture && profilePicture) {
              user.profilePicture = profilePicture;
            }
            await user.save();
          }
          return done(null, user);
        }

        // Generate a random username base
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = await User.create({
          googleId,
          email,
          fullName,
          username,
          profilePicture,
          isEmailVerified: true, // Google emails are already verified
        });

        done(null, user);
      } catch (error) {
        done(error as Error, false);
      }
    }
  ));
}

export default passport;
