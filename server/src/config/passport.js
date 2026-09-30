const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Employee = require('../models/Employee');
const { resolveRole } = require('./roles');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const role = await resolveRole(email);

        if (!role) {
          // Ninguém cadastrou esse e-mail na tela de Funcionários (e não é o admin semente)
          return done(null, false, { message: 'E-mail não cadastrado no sistema' });
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            role,
          });
        } else if (user.role !== role) {
          user.role = role;
          await user.save();
        }

        // Guarda o nome no cadastro de funcionário, ajuda o admin a reconhecer quem é quem na lista
        await Employee.findOneAndUpdate({ email }, { name: user.name });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
