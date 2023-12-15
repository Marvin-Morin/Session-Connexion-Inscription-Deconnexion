const mongoose = require('mongoose'); // Importation de la bibliothèque Mongoose pour l'interaction avec MongoDB
const express = require('express'); // Importation de la bibliothèque Express
const bodyParser = require('body-parser'); // Middleware pour analyser le corps des requêtes
const path = require('path'); // Gestion des chemins de fichiers
const users = require('./models/users'); // Importation du modèle User
const bcrypt = require('bcrypt'); // Bibliothèque pour le hachage des mots de passe
const session = require('express-session'); // Middleware pour la gestion des sessions
const flash = require('connect-flash'); // Middleware pour la gestion des messages flash
const passport = require('passport'); // Middleware d'authentification
const LocalStrategy = require('passport-local').Strategy; // Stratégie locale d'authentification
const app = express(); // Création d'une instance d'Express



app.use(bodyParser.json()); // Activation de l'analyse du corps des requêtes en JSON
app.use(bodyParser.urlencoded({ extended: true })); // Activation de l'analyse des données encodées dans l'URL



// Importation du modèle User
require('./models/users');

// Importation des routes
const usersRoute = require('./routes/users');



// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/testSeul')
    .then(() => {
        console.log('Connexion réussie');
    })
    .catch((err) => {
        console.error("Erreur de connexion :" + err);
    });



// Configuration de la session utilisateur
app.use(session({
    secret: 'secretUnique',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));



// Initialisation de connect-flash
app.use(flash());



// Configuration du passeport et des stratégies d'authentification
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
    { usernameField: 'email' },  // Stratégie locale d'authentification en utilisant l'email comme nom d'utilisateur
    async (email, password, done) => {  // Fonction asynchrone pour gérer l'authentification
        try {
            const user = await users.findOne({ email });  // Recherche de l'utilisateur dans la base de données par son email

            if (user) {  // Si l'utilisateur est trouvé
                const correspondance = await bcrypt.compare(password, user.password);  // Comparaison du mot de passe fourni avec le mot de passe haché stocké

                if (correspondance) {  // Si les mots de passe correspondent
                    return done(null, user);  // Authentification réussie, retourne l'utilisateur
                } else {
                    return done(null, false, { message: 'Mot de passe incorrect' });  // Mot de passe incorrect, retourne une erreur
                }
            } else {
                return done(null, false, { message: 'Email ou mot de passe incorrect' });  // Email ou mot de passe incorrect, retourne une erreur
            }
        } catch (error) {
            return done(error);  // En cas d'erreur lors du processus d'authentification, retourne l'erreur
        }
    }
));



passport.serializeUser((utilisateur, done) => {  // Configuration de la sérialisation de l'utilisateur
    done(null, utilisateur.id);  // Sérialisation de l'utilisateur en utilisant son identifiant unique
});



passport.deserializeUser(async (id, done) => {  // Configuration de la désérialisation de l'utilisateur
    try {
        const utilisateur = await users.findById(id);  // Recherche de l'utilisateur dans la base de données par son identifiant
        done(null, utilisateur);  // Appelle le callback avec l'objet utilisateur désérialisé
    } catch (err) {
        done(err);  // En cas d'erreur, appelle le callback avec l'erreur
    }
});



// Configuration de la stratégie locale d'authentification pour Passport
passport.use(new LocalStrategy(
    { usernameField: 'email' },  // Spécifie que le champ d'identification est l'email
    async (email, password, done) => {  // Fonction asynchrone pour gérer l'authentification
        try {
            const user = await Users.findOne({ email });  // Recherche de l'utilisateur dans la base de données par son email
            if (user) {  // Si l'utilisateur est trouvé
                const correspondance = await bcrypt.compare(password, user.password);  // Comparaison du mot de passe fourni avec le mot de passe haché stocké
                if (correspondance) {  // Si les mots de passe correspondent
                    return done(null, user);  // Authentification réussie, retourne l'utilisateur
                } else {
                    return done(null, false, { message: 'Mot de passe incorrect' });  // Mot de passe incorrect, retourne une erreur
                }
            } else {
                return done(null, false, { message: 'Email ou mot de passe incorrect' });  // Email ou mot de passe incorrect, retourne une erreur
            }
        } catch (error) {
            return done(error);  // En cas d'erreur lors du processus d'authentification, retourne l'erreur
        }
    }
));




// Middleware pour rendre certaines variables disponibles dans tous les modèles
app.use((req, res, next) => {  // Utilisation d'un middleware pour définir des variables globales pour toutes les vues
    res.locals.isAuthenticated = req.isAuthenticated();  // Variable locale indiquant si l'utilisateur est authentifié
    res.locals.utilisateurPrenom = req.isAuthenticated() ? req.user.prenom : null;  // Variable locale contenant le prénom de l'utilisateur s'il est authentifié, sinon null
    next();  // Passe au middleware suivant dans la chaîne de traitement
});




// Route pour afficher la page d'accueil (accueil.ejs)
app.get('/', (req, res) => {  // Définition d'une route pour la page d'accueil
    res.render('accueil', {  // Rendu du fichier de modèle 'accueil.ejs' avec des données supplémentaires
        isAuthenticated: req.isAuthenticated(),  // Variable indiquant si l'utilisateur est authentifié
        utilisateurPrenom: req.isAuthenticated() ? req.user.prenom : null  // Nom du prénom de l'utilisateur si authentifié, sinon null
    });
});



// Route pour afficher la page d'inscription
app.get('/inscription', (req, res) => {
    res.render('inscription');
});



// Utilisation des routes définies dans usersRoute
app.use('/users', usersRoute);



// Route pour afficher la page de connexion
app.get('/connexion', (req, res) => {
    res.render('connexion');
});



// Route de connexion
app.post('/connexion', passport.authenticate('local', {
    successRedirect: '/',  // Redirection après une connexion réussie
    failureRedirect: '/connexion',  // Redirection après un échec de connexion
    failureFlash: true
}));



// Configuration rendu côté client
app.set('view engine', 'ejs'); // Moteur de modèle EJS
app.set('views', path.join(__dirname, 'views')); // Dossier des fichiers de modèle
app.use(express.static(__dirname + '/public')); // Dossier des fichiers statiques



const PORT = 3000; // Port d'écoute du serveur


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// Middleware d'erreur
app.use((err, req, res, next) => {  // Utilisation d'un middleware pour gérer les erreurs
    console.error(err.stack);  // Affichage de la pile d'erreurs dans la console du serveur
    res.status(500).send('Erreur interne du serveur');  // Réponse avec un statut HTTP 500 (Erreur interne du serveur) et un message générique
});




module.exports = app; // Exportation de l'application Express
