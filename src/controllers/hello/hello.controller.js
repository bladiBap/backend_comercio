import db from '../../db.js';
import response from '../../utils/response.js';

export async function getHello(req, res) {
    return response(res, 200, null, 'Hello World');
}

export async function getDataToDB(req, res) {
    try {
        const data = await db.pedido.findMany();
        return response(res, 200, data, 'Datos obtenidos correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener los datos: ${error}`, false);
    }
}