import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';

//Routers
import productoRoutes from './routes/producto.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import helloRoutes from './routes/hello.routes.js';
import carritoRoutes from './routes/carrito.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: './public/imagenes/temp'
}));
app.use('/public', express.static('public'));
// use routes
app.use(productoRoutes);
app.use(usuarioRoutes);
app.use(helloRoutes);
app.use(carritoRoutes);
app.use(pedidoRoutes);

app.listen(process.env.PORT || 4000);
console.log('Server on port', process.env.PORT || 4000);