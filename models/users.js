const mongoose = require('mongoose') // Utilisation de la bibliothèque mongoose pour créer un schéma

const usersSchema = new mongoose.Schema( { // Création du schéma de ma collection users
    nom : String, // Champ "nom" de type String
    prenom : String, // Champ "prenom" de type String
    email : { type :String, required : true, unique : true }, // Champ "email" avec type String, requis et unique
    password : String // Champ "password" de type String
});

module.exports = mongoose.model('Users', usersSchema); // Exporte le modèle associé au schéma sous le nom 'Users'
