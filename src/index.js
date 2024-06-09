import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';

//Routers
import productoRoutes from './routes/producto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: './public/imagenes/temp'
}));
app.use(express.static('public'));
app.use('/public', express.static('public'));
// use routes
app.use(productoRoutes);
app.use(categoriaRoutes);
app.use(usuarioRoutes);

app.listen(process.env.PORT || 4000);
console.log('Server on port', process.env.PORT || 4000);