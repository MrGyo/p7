// Dans le routeur on ne veut QUE la logique de routing ainsi la logique métier sera enregistrée dans le controller sauce.js

// On a besoin d'Express
const express = require('express');
// On crée un router avec la méthode mise à disposition par Express
const router = express.Router();
// On associe les fonctions aux différentes routes, on importe le controller
const messageCtrl = require('../controllers/message');
// On importe le process d'identification
const auth = require('../middleware/auth');
// On importe multer pour la gestion des images
const multer = require('../middleware/multer-config');

// Route qui permet de créer "un topic" ou de "répondre à un topic"
router.post('/', auth, multer, messageCtrl.createTopic);
// Route qui permet de modifier "un message"
router.post('/:id', auth, multer, messageCtrl.modifyMessage);
// Route qui permet de récupérer tous les messages
router.get('/', auth, messageCtrl.getAllTopics);
// Route qui permet de supprimer "un message"
router.delete('/:id', auth, messageCtrl.deleteMessage);

module.exports = router;