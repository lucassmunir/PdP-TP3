// UtilidadesCLI.js

const readline = require('readline');

// Creamos la interfaz de lectura globalmente para que persista
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Muestra un mensaje y espera la entrada del usuario.
 * @param {string} pregunta - El texto a mostrar en el prompt.
 * @returns {Promise<string>} La entrada del usuario.
 */
function preguntar(pregunta) {
    return new Promise(resolve => {
        rl.question(`> ${pregunta} `, (respuesta) => {
            resolve(respuesta.trim());
        });
    });
}

/**
 * Cierra la interfaz de lectura.
 */
function cerrarCLI() {
    rl.close();
}

/**
 * Muestra el menú y valida la opción elegida por el usuario.
 * @param {string} titulo - Título del menú.
 * @param {object} opciones - Objeto {clave: 'Descripción'} con las opciones.
 * @param {boolean} [puedeVolver=true] - Si la opción 0 (Volver/Salir) está disponible.
 * @returns {Promise<string|null>} La clave válida elegida o null si es la opción de volver/salir.
 */
async function mostrarMenu(titulo, opciones, puedeVolver = true) {
    console.clear();
    console.log(`\n--- ${titulo} ---`);

    const clavesValidas = new Set();
    const opcionesMostrar = {};

    // Construir lista de opciones
    for (const clave in opciones) {
        opcionesMostrar[clave] = opciones[clave];
        clavesValidas.add(String(clave));
    }
    
    // Añadir opción de Volver/Salir
    if (puedeVolver) {
        const claveVolver = Object.keys(opciones).includes('0') ? '9' : '0'; // Evita conflicto si ya hay un 0
        opcionesMostrar[claveVolver] = titulo.includes('Principal') ? 'Salir' : 'Volver';
        clavesValidas.add(claveVolver);
    }

    // Mostrar menú al usuario
    for (const clave in opcionesMostrar) {
        console.log(`[${clave}] ${opcionesMostrar[clave]}`);
    }

    let eleccion = await preguntar('¿Qué deseas hacer?');

    // Validación de entrada
    while (!clavesValidas.has(eleccion)) {
        console.log(`\n[ERROR] Opción inválida. Por favor, selecciona una de las opciones disponibles.`);
        eleccion = await preguntar('¿Qué deseas hacer?');
    }

    // Si es la clave de volver/salir
    if (eleccion === '0' && puedeVolver) {
        return null;
    }
    
    return eleccion;
}

/**
 * Pausa la ejecución hasta que el usuario presione una tecla.
 */
async function pausar() {
    console.log('\nPresiona ENTER para continuar...');
    await preguntar('');
}

module.exports = { preguntar, cerrarCLI, mostrarMenu, pausar };