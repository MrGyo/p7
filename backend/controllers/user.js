// On retrouve ici la logique métier en lien avec nos utilisateurs

// On utilise bcrypt pour hasher le MDP des utilisateurs
const bcrypt = require('bcrypt');
// On utilise jsonwebtoken pour attribuer un token à l'utilisateur au moment de la connexion
const jwt = require('jsonwebtoken');
// On récupère la clef pour le TOKEN
const config = require('../config/auth.config');
// On importe la base de données MySQL
const db = require('../mysqlConfig');

// fonction signup
exports.signup = (req, res, next) => {
    let user = req.body;
    if (user.password == "" || user.password == undefined)
        return res.status(200).json({message:'No data !'});   
    bcrypt.hash(user.password, 10)
        .then(hash => {
        user.password = hash;
        let query= "INSERT INTO user SET ?";
        db.query(query, user, function (error, results, fields){
            console.log("error sql:"); 
            console.log(error);
            if (error) {
                console.log(error);
                return res.status(400).json(error.sqlMessage);
            } 
            return res.status(201).json({message: 'Your account has been created !'});
            });     
        }
    );
};

// fonction login
exports.login = (req, res, next) => {
    let user = req.body.username;
    let password = req.body.password;
    if (!user || !password)
       return res.status(500).json({ message: "Enter a username and a password" });
       // on autorise les gens à se connecter si ils ne sont pas effacés
    let query = "SELECT * FROM user WHERE username=? AND fl_delete = 0";
    db.query(query, user, function (error, results, fields) {
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password).then((valid) => {
                if (valid) 
                {
                    console.log(user, "is connected to the chatroom");
                    console.log(results[0]);
                    return res.status(200).json({
                        token: jwt.sign(
                        { userId: results[0].id, role: results[0].user_right },
                        config.secret,
                        { expiresIn: '24h' }
                        )
                    });
                }
                else{
                    console.log("Erreur log/pass!")
                    return res.status(401).json({ message: 'Username or password unknown'});
                }
            });
        } 
        else{
            console.log("Erreur log/pass!")
            return res.status(401).json({ message: 'Username or password unknown'});
        }        
    });
};

exports.getAllusers = (req, res, next) => {
    let query = "SELECT id, username, email, user_right FROM db_test.user WHERE fl_delete = 0 ORDER BY user_right ASC";
    db.query(query, function (error, results, fields) {
        if (error) {
          return res.status(400).json(error)
        }
        return res.status(200).json({ results })
      }
    );
};

  exports.deleteUser = (req, res, next) => {
    let query = "UPDATE user SET fl_delete=1 WHERE id=?";
    db.query(query, req.params.id, function (error, results, fields) {
        if (error) {
          return res.status(400).json(error)
        };
        let query2 = "UPDATE user SET email=NULL WHERE id=?";
        db.query(query2, req.params.id, function (error, results, fields) {
            if (error) {
              return res.status(400).json(error)
            }
            return res
              .status(200)
              .json({ message: 'Your account has been deleted !' })
          }
        );
      }
    );
  };

exports.checkAuth = (req, res, next) => {

    let token = req.headers.authorization.split(' ')[1];
    let decodedToken = jwt.verify(token, config.secret);
    let userId = decodedToken.userId;
    let role = decodedToken.role;
    
    console.log(decodedToken);

    let query = "SELECT username FROM user WHERE id=? AND fl_delete = 0";
    db.query(query, userId, function (error, results, fields) {
        if (error) {
            return res.status(400).json(error)
          }
          else
            return res.status(200).json({ 
                'userId': userId, 
                'userRight': role,
                'token': token, 
                'username': results[0].username 
            });
    });
};