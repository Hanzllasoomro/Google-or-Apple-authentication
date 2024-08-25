import epress from 'epress';
import passport from 'passport';
import './auth';
import session from 'express-session';

const app = express();

app.use(passport.initialize());
app.use(passport.session());

// google routes

app.get('/auth/google', passport.authenticate('google',{
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/'
}));

// Apple routes

app.get ('/auth/apple', passport.authenticate('apple'));

app.post('/auth/apple/callback', passport.authenticate('apple',{
    failureRedirect: '/login',
    successRedirect: '/'
}));

app.listen(3000,() => {
    console.log('serbver started on http://localhost:3000');
});

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));