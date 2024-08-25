import passport from 'passport';
import { Strategy as GoogleStrategy , Profile} from 'passport-google-oauth20';
import { User } from './models/user'; 
// assume user that you have a user model with fiels like googleId, displayName , firstName, lastname, email and avatar.
// you might need to adapt this code depending on your database and ORM (e.g. Mongoose for MongoDB , TypeORM for SQL database).

import { Strategy as AppleStrategy, Profile } from 'passport-apple';

passport.use( new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/auth/google/callback'
},async function (accessToken, refreshToken, profile: Profile, done) {
    try{
        let user = await User.findOne({ googleId: profile.id});

    if(!user){
        user = new User({ googleID: profile.id,
                         displayId: profile.displayName,
                         firstName: profile.name?.givenName,
                         lastName: profile.name?.familyName,
                         email: profile.email?.[0].value,
                         avatar: profile.photo?.[0].value
                        });
            await user.save(user);
    }
    
    return done(null, profile);
    } catch (err) {
        
        console.error(err);
        return done(err, null);
}
}
));

passport.use(new AppleStrategy({

    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    privateKeyString: process.env.APPLE_PRIVATE_KEY_STRING!,
    callbackURL: '/auth/apple/callback'
},

async function (accessToken, refreshToken,idToken: string, profile: Profile, done) {
    
    try {

        const decodedToken = JSON.parse(Buffer.from(idToken.split('.')[1],
                            'base64').toString());
        const {
            sub: appleId, email, emailVerified
        }    = decodedToken ;

        if( ! emailVerified ) {
            return done(new Error('Email not verification'),null);
        }

        let user = await User.findOne({ appleId});

        if( !user) {
        
            user = new User({ appleId, email: email, 
                firstName: profile?.name?.givenName,
                lastName: profile?.name?.familyName
            });

            await user.save();
        }
        return done(null, user);
        }
        catch(err) {
            console.error(err);
            return done(err, null);
        }

    }));


passport.serializeUser((user: any, done) => {   

    done(null, user.id);
});

passport.deserializeUser(async (id: string , done) => {
    
    try{       
        const user = await User.findById(id);
        done(null, user);
        
    } catch (err) {

        done(err, null);
                 }
    });
