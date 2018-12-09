# Webhook para Chatbot

## Proyecto final C.F.G.S Desarrollo de Aplicaciones Web

Esta aplicación está desarrollada en Node.js y permite conectar la plataforma *Dialogflow* (v1) con diferentes APIs de terceros.

El proyecto está conformado además por [este](https://github.com/Proyecto-chatbot/panel-administracion-chatbot) repositorio donde se encuentra el panel de configuración para el chatbot conversacional desarrollado para el centro.

El Webhook realiza llamadas a la API de *Giphy* para la obtención de gifs de forma aleatoria. Por motivos de seguridad no se ha incluido ningún fichero de almacenamiento de tokens o api keys, por lo que es necesario generarlo o almacenarlo como variable de sesión en el servidor o plataforma en que despleguemos la aplicación.

Si el Webhook es desplegado como una aplicación en Heroku, es necesario crear un buildpack de node.js que nos permita lanzar el fichero *package.json* en cada deploy.

Cargar los módulos requeridos
```javascript
 npm install
```

Lanzar el servicio
```javascript
 node index.js
```

## Authors

* [Nieves Borrero](https://github.com/NievesBorrero)
* [Pablo León](https://github.com/pabloleonalcaide)

## Deployment
  El Webhook se despliega actualmente en *Heroku* [Enlace](https://grancapibot.herokuapp.com/)

## Built with

* [Express](http://expressjs.com/es/) - como framework para Node.js
* [GIPHY API](https://developers.giphy.com/)
* [Dialogflow](https://dialogflow.com/docs/reference/agent/)

## License
[GNU General Public License v3.0](../master/LICENSE)

## Acknowledgments
