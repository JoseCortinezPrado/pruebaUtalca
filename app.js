const express = require('express');
const app = express();
const service = require('./src/services/userService');
const endpoint = require('./src/config/endpoint');

app.use(express.json());

app.listen(3000, () => {
    console.log('App corriendo en puerto 3000');
});

app.post(endpoint.newEndpoint, service.verificarCorreo, service.createUser );

app.post(endpoint.loginEndpoint, service.verificarCredenciales, service.login);

app.post(endpoint.meEndpoint, service.verificarToken, service.me);

app.post(endpoint.updateEndpoint, service.verificarToken, service.update );