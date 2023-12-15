/*

Ce script Node.js utilise le framework Express pour créer un serveur web avec des fonctionnalités d'inscription, 
de connexion et de gestion d'authentification. Voici une explication ligne par ligne :

*/


const express = require('express'); // Utilisation de la bibliothèque Express
const mongoose = require('mongoose'); // Utilisation de la bibliothèque Mongoose pour l'interaction avec MongoDB
const bcrypt = require('bcrypt'); // Importation de la méthode pour crypter le mot de passe
const passport = require('passport'); // Utilisation de Passport pour l'authentification
const Users = require('../models/users'); // Importation du schéma User depuis le fichier models/users.js
const router = express.Router(); // Création d'une instance de routeur Express



router.use(passport.initialize()); // Initialisation de Passport
router.use(passport.session()); // Utilisation de sessions Passport



// Route de déconnexion
router.post('/logout', (req, res) => {  // Définition de la route POST pour la déconnexion
    req.logout((err) => {  // Utilisation de la fonction logout de Passport avec un callback pour gérer la déconnexion
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);  // Affichage d'une erreur en cas de problème lors de la déconnexion
        }
        req.session.destroy((err) => {  // Destruction de la session utilisateur
            if (err) {
                console.error('Erreur lors de la destruction de la session :', err);  // Affichage d'une erreur en cas de problème lors de la destruction de la session
            }
            res.redirect('/');  // Redirection vers la page d'accueil après la déconnexion
        });
    });
});



router.get('/inscription', (req, res) => {
    res.render('inscription'); // Rend la page d'inscription
});


router.post('/inscription', async (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;

        // Vérifier si l'email existe déjà dans la base de données
        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            // L'email existe déjà, renvoyer une erreur
            res.render('inscription', { erreur: 'email_existe_deja' });
        } else {
            // Hashage du mot de passe avec bcrypt
            const passwordHache = await bcrypt.hash(password, 11);

            // Création d'une nouvelle instance de Users (utilisateur)
            const newUser = new Users({
                nom,
                prenom,
                email,
                password: passwordHache
            });

            // Sauvegarde de l'utilisateur dans la base de données
            await newUser.save();

            // Connexion réussie à la base de données
            console.log('Connexion réussie à la base de données');

            // Redirection vers la page d'accueil ou autre page appropriée
            res.redirect('/');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur :', error);
        // Réponse JSON en cas d'erreur
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});



router.get('/connexion', (req, res) => {
    res.render('connexion'); // Rend la page de connexion
});


router.post('/connexion', async (req, res) => {  // Route de gestion de la connexion (POST)

    const { email, password } = req.body;  // Extraction des données d'identification depuis le corps de la requête



    try {

        const user = await Users.findOne({ email });  // Recherche de l'utilisateur dans la base de données par email

        if (user) {  // Si l'utilisateur est trouvé
            const correspondance = await bcrypt.compare(password, user.password);  // Vérification de la correspondance du mot de passe

            if (correspondance) {  // Si le mot de passe correspond
                req.login(user, (err) => {  // Connexion de l'utilisateur à la session
                    if (err) {
                        res.render('connexion', { erreur: 'utilisateur_incorrect' });  // Rendu de la page de connexion avec une erreur en cas d'échec de connexion
                    }
                    res.redirect('/');  // Redirection vers la page d'accueil après une connexion réussie
                });
            } else {
                res.render('connexion', { erreur: 'mot_de_passe_incorrect' });  // Rendu de la page de connexion avec une erreur en cas de mot de passe incorrect
            }
        } else {
            res.render('connexion', { erreur: 'utilisateur_non_trouve' });  // Rendu de la page de connexion avec une erreur en cas d'utilisateur non trouvé
        }
    } catch (err) {
        console.error("Erreur lors de la recherche de l'utilisateur :", err);  // Affichage de l'erreur dans la console
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });  // Réponse JSON en cas d'erreur interne du serveur
    }

});



router.get('/api/authenticated', (req, res) => {
    // Route pour récupérer l'état d'authentification au format JSON
    if (req.isAuthenticated()) {
        // L'utilisateur est authentifié, vous pouvez envoyer les données dont vous avez besoin
        res.json({ authenticated: true, user: req.user });
    } else {
        // L'utilisateur n'est pas authentifié
        res.json({ authenticated: false, message: 'Non authentifié' });
    }
});



router.get('/', (req, res) => {  // Route pour afficher la page d'accueil (accueil.ejs) lors de la requête GET sur '/'
    res.render('accueil', {  // Rendu de la page d'accueil avec des variables locales
        isAuthenticated: req.isAuthenticated(),  // Indique si l'utilisateur est authentifié
        utilisateurPrenom: req.isAuthenticated() ? req.user.prenom : null  // Récupère le prénom de l'utilisateur si authentifié, sinon null
    });
});



router.use((err, req, res, next) => {  // Middleware d'erreur pour toutes les routes
    console.error(err.stack);  // Affiche la pile d'erreurs dans la console
    res.status(500).send('Erreur interne du serveur');  // Renvoie une réponse avec un statut 500 en cas d'erreur interne du serveur
});



// Middleware pour rendre certaines variables disponibles dans tous les modèles
router.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.utilisateurPrenom = req.isAuthenticated() ? req.user.prenom : null;
    next();
});



module.exports = router; // Exportation du routeur pour l'utiliser dans d'autres fichiers