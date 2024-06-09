import { eliminarArchivosTemporales } from './image.js';
export default async function response(res, status, data, message = '', success = true) {
    await eliminarArchivosTemporales();
    return res.status(status).json({
        success,
        message,
        data,
    });
}