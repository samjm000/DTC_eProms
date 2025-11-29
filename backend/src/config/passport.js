const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);

    if (!user || !user.isActive) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.isActive) {
        return done(null, false, { message: 'Account is inactive' });
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      await user.update({ lastLogin: new Date() });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

if (process.env.NHS_SSO_CERT && process.env.NHS_SSO_ENTRY_POINT && process.env.NHS_SSO_CALLBACK_URL) {
  passport.use('nhs-saml', new SamlStrategy(
    {
      entryPoint: process.env.NHS_SSO_ENTRY_POINT,
      callbackUrl: process.env.NHS_SSO_CALLBACK_URL,
      issuer: 'eproms-system',
      cert: process.env.NHS_SSO_CERT,
      identifierFormat: null
    },
    async (profile, done) => {
      try {
        const nhsSsoId = profile.nameID || profile.id;
        const email = profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const firstName = profile.givenName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
        const lastName = profile.surname || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];

        let user = await User.findOne({ where: { nhsSsoId } });

        if (!user) {
          user = await User.create({
            email: email.toLowerCase(),
            nhsSsoId,
            firstName,
            lastName,
            role: 'clinician',
            isActive: true
          });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is inactive' });
        }

        await user.update({ lastLogin: new Date() });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

module.exports = passport;
