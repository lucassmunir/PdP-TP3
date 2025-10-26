// app.js

const SistemaToDo = require('./SistemaToDo');
const { cerrarCLI } = require('./UtilidadesCLI');

const sistema = new SistemaToDo();

// Función de inicio
async function iniciar() {
    try {
        await sistema.menuPrincipal();
    } catch (error) {
        console.error('Ocurrió un error inesperado:', error);
    } finally {
        cerrarCLI();
    }
}

iniciar();