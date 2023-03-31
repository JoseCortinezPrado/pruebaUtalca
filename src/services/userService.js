const config = require('../config/config');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const verificarCorreo = (request, response, next) => {

    const urlSearch = new URL(config.url);
    urlSearch.searchParams.append('email', request.body.email);


    fetch(urlSearch, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    }).then(res => {
        if (res.ok) {
            return res.json();
        }
    }).then(users => {
        if (users.length > 0) {
            return response.json({
                message: 'El correo ya está en uso'
            });
        }
        next();
    }).catch(error => {
        return response.json({
            message: 'A ocurrido un error',
            error: JSON.stringify(error)
        });
    });
}

const createUser = (request, response) => {

    const { id, name, lastname, email, pass, address, phone } = request.body;
    const newuser = new User(id, name, lastname, email, pass, address, phone);

    fetch(config.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newuser)
    }).then(res => {
        if (res.ok) {
            return response.json({
                message: 'Usuario creado correctamente'
            });
        }
        return response.json({
            message: JSON.stringify(res)
        })

    }).catch(error => {
        return response.json({
            message: 'A ocurrido un error',
            error: JSON.stringify(error)
        });
    });

}

const verificarCredenciales = (request, response, next) => {

    const urlSearch = new URL(config.url);
    urlSearch.searchParams.append('email', request.body.email);

    fetch(urlSearch, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    }).then(res => {
        if (res.ok) {
            return res.json();
        }
    }).then(users => {
        if (users.length == 0) {
            return response.json({
                message: 'Correo no registrado en la base de datos'
            });
        } else {
            let user = users[0];
            if (user.pass != request.body.pass) {
                return response.json({
                    message: 'Contraseña incorrecta'
                });
            }

            request.body.user = user;
            next();
        }
    }).catch(error => {
        return response.json({
            message: 'A ocurrido un error',
            error: JSON.stringify(error)
        });
    });

}

const login = (request, response) => {

    jwt.sign(request.body.user, config.secretKey, (err, token) => {
        if (!token) {
            return response.json({
                message: 'A ocurrido un error',
                error: JSON.stringify(err)
            });
        }
        return response.json({
            message: 'Inicio de sesión correcto',
            token: token
        });
    });
};

const verificarToken = (request, response, next) => {
    const bearerHeader = request.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        request.token = bearerHeader;
        next();
    } else {
        return response.sendStatus(403);
    }
}

const me = (request, response) => {
    jwt.verify(request.token, config.secretKey, (error, authData) => {
        if (error) {
            return response.sendStatus(403);
        }
        return response.json({
            message: 'Acceso autorizado',
            authData
        })

    });
}

const update = (request, response) => {
    jwt.verify(request.token, config.secretKey, (error, authData) => {
        if (error) {
            return response.sendStatus(403);
        }
        if (request.body.id !== authData.id) {
            return response.sendStatus(403);
        }

        const urlUpdate = new URL(config.url);
        urlUpdate.pathname = `users/${authData.id}`;

        fetch(urlUpdate, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request.body)
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
        }).then(user => {
            jwt.sign(user, config.secretKey, (err, token) => {
                return response.json({
                    message: 'Usuario actualizado correctamente',
                    token: token
                });
            })
        }).catch(error => {
            return response.json({
                message: 'A ocurrido un error',
                error: JSON.stringify(error)
            });
        });
    });
}

module.exports = {
    createUser: createUser,
    verificarCorreo: verificarCorreo,
    verificarCredenciales: verificarCredenciales,
    login: login,
    verificarToken: verificarToken,
    me: me,
    update: update
}