import fs from 'fs-extra';
const carpetaRaiz = 'public/imagenes';
const extencionesValidas = ['png', 'jpg', 'jpeg', 'svg', 'webp'];

export const guardarImagen = async (carpeta, imagen, nombre, pathAnterior) => {
    const extension = imagen.name.split('.').pop();
    const path = `${carpetaRaiz}/${carpeta}/${nombre}.${extension}`;
    const pathCarpeta = `${carpetaRaiz}/${carpeta}`;
    
    if (!extencionesValidas.includes(extension)){
        throw new Error(`La extension ${extension} no es permitida, solo se permiten ${extencionesValidas.join(', ')}`);
    }

    if (carpeta.includes('/')) {
        await crearCarpetas(carpeta.split('/'));
    }else if (!fs.existsSync(pathCarpeta)) await fs.mkdir(pathCarpeta);
    
    if (pathAnterior) await eliminarImagen(pathAnterior);
    await imagen.mv(path);
    return path;
}

export const eliminarImagen = async (path) => {
    if (fs.existsSync(path)) await fs.unlink(path);
}

export const crearCarpetas = async (carpetas) => {
    let carpetaPadre = carpetaRaiz;
    if(carpetas.length === 0) return;
    for (const carpeta of carpetas) {
        if (!fs.existsSync(`${carpetaPadre}/${carpeta}`)){
            await fs.mkdir(`${carpetaPadre}/${carpeta}`);
        }
        carpetaPadre = `${carpetaPadre}/${carpeta}`;
    }
}

export const eliminarArchivosTemporales = async () => {
    const carpetaTemp = 'public/imagenes/temp';
    if (fs.existsSync(carpetaTemp)) {
        await fs.rmdir(carpetaTemp, { recursive: true });
    }
}

