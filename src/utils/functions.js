export const generarTicketPedido = () => {
    const letras = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
    const numeros = '0123456789';
    let ticket = '';
    for (let i = 0; i < 3; i++) {
        ticket += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    ticket += '-';
    for (let i = 0; i < 3; i++) {
        ticket += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }

    return ticket;
}

