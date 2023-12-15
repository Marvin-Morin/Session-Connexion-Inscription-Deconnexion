/*

Ce script effectue une vérification d'authentification au chargement de la page 
et modifie dynamiquement le contenu en fonction de l'état d'authentification. 
Il utilise les fonctions asynchrones pour effectuer des requêtes 
HTTP asynchrones vers un serveur local et met à jour le contenu de la page en conséquence.

*/



document.addEventListener('DOMContentLoaded', async function () {
    
    const isAuthenticated = await checkAuthentication();
    const lienContainer = document.getElementById('lien');

    if (isAuthenticated) {
        lienContainer.style.display = 'none';

        const prenom = await getUtilisateurPrenom();

        // Crée un élément de paragraphe pour afficher le message de bienvenue
        const welcomeMessage = document.createElement('p');
        welcomeMessage.textContent = `Bonjour ${prenom}`;

        // Crée un lien de déconnexion
        const logoutLink = document.createElement('a');
        logoutLink.textContent = 'Déconnexion';
        logoutLink.href = '#'; // Définire l'URL de déconnexion 

        logoutLink.addEventListener('click', async function (event) {
            event.preventDefault(); // Empêche le lien de suivre le lien hypertexte (déconnexion via JavaScript)
            
            // Effectue une requête de déconnexion lorsque le lien est cliqué
            await logout();
            window.location.reload(); // Recharge la page après la déconnexion
        });

        // Ajoute le message de bienvenue et le lien à la navigation
        document.querySelector('nav').appendChild(welcomeMessage);
        document.querySelector('nav').appendChild(logoutLink);

    } else {
        lienContainer.style.display = 'block';
    }
    
});



async function logout() {
    try {
        // Effectue une requête HTTP POST asynchrone vers l'URL de déconnexion
        const response = await fetch('http://localhost:3000/users/logout', {
            method: 'POST',
            credentials: 'include' // Inclut les informations d'authentification dans la requête
        });

        const data = await response.json(); // Convertit la réponse en JSON

        if (data.success) {
            console.log('Déconnexion réussie');
        } else {
            console.error('Échec de la déconnexion');
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
}



async function getUtilisateurPrenom() {
    try {
        const response = await fetch('http://localhost:3000/users/api/authenticated');
        // Effectue une requête HTTP GET asynchrone vers l'URL pour récupérer les informations d'authentification
        const data = await response.json(); // Convertit la réponse en JSON
        if (data.authenticated) {
            // Si l'utilisateur est authentifié
            return data.user ? data.user.prenom : '';
            // Retourne le prénom de l'utilisateur s'il existe, sinon une chaîne vide
        } else {
            console.error("L'utilisateur n'est pas authentifié.");
            // Affiche un message d'erreur dans la console si l'utilisateur n'est pas authentifié
            return '';
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du prénom de l'utilisateur :", error);
        // Affiche un message d'erreur dans la console en cas d'erreur lors de la récupération du prénom
        return '';
    }
}

async function checkAuthentication() {
    try {
        const response = await fetch('http://localhost:3000/users/api/authenticated');
        // Effectue une requête HTTP GET asynchrone vers l'URL pour vérifier l'état d'authentification
        const data = await response.json(); // Convertit la réponse en JSON
        return data.authenticated;
        // Retourne true si l'utilisateur est authentifié, sinon false
    } catch (error) {
        console.error("Erreur lors de la récupération de l'état d'authentification :", error);
        // Affiche un message d'erreur dans la console en cas d'erreur lors de la vérification de l'authentification
        return false;
    }
}
