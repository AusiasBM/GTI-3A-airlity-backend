
Este backend utiliza NodeJS con la librería Express.
Como Base de datos utiliza MongoBD, y como ORM Mongoose.

Para iniciar el servidor he creado un script:
    $ npm run dev

Para inciar mongoDB
    $ brew services start mongodb-community@5.0

Para parar MongoDB
    $ brew services stop mongodb-community@5.0

#
# @Autor Ausias Bañuls
#
DOCKER:

    Para crear una imagen de docker-compose: 
        $ docker-compose build
    Para ver las imagenes que tenemos: 
        $ docker images
    Para arrancar una imagen de docker-compose: 
        $ docker-compose up
    Para parar los contenedores de docker-compose: 
        $ docker-compose stop
    Para eliminar los contenedores de docker-compose: 
        $ docker-compose rm
    Para eliminar una imagen: 
        $ docker rmi id_imagen ( con los tres primeros dígitos sobra )

    Al iniciar docker-compose ya se está iniciando el servidor express y mongodb al mismo tiempo.

    Puertos:
        - express: 3500
        - mongo: 27080
    
    Contenedores creados por docker-compose:
        - backend ( Contiene el servidor express )
        - backend-mongo ( Contiene mongodb )

    En caso de no arrancar docker se puede trabajar igual con todo pero hay que iniciar el servidor por un lado y mongo por otro.
        - En este caso mongo escucha por el puerto de serie
        - Para arrancar express en modo prueva es con $ npm run dev
        - Para arrancar express en modo producción es con $ npm start ó $ npm run start

    En caso de modificaciones del código del servidor, no hay que modificar ningún fichero de docker.

    En caso de no utilizar docker se puede utilizar un contenedor de mongo que está alojado en 217.76.155.97:27080 de esta forma no hay que estar arrancando y parando docker cuando
    estamos haciendo pruebas o queremos que los datos que provemos aquí se reflejen en la web desde otros ordenadores.

    SUBIR EL CONTENEDOR AL SERVIDOR EN PRODUCCIÓN:
        - Cambiar la conexión a la BBDD