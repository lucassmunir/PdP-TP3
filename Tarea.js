// Tarea.js

const EnumsTarea = {
    // Requisitos de Dificultad: fácil (1), medio (2), difícil (3).
    DIFICULTAD: {
        FACIL: { clave: 1, char: 'f', texto: 'fácil', visual: '⭐☆☆' },
        MEDIO: { clave: 2, char: 'm', texto: 'medio', visual: '⭐⭐☆' },
        DIFICIL: { clave: 3, char: 'd', texto: 'difícil', visual: '⭐⭐⭐' },
    },
    // Requisitos de Estado: pendiente (1), en curso (2), terminada (3), cancelada (4).
    ESTADO: {
        PENDIENTE: { clave: 1, char: 'p', texto: 'Pendiente' },
        EN_CURSO: { clave: 2, char: 'e', texto: 'En curso' },
        TERMINADA: { clave: 3, char: 't', texto: 'Terminada' },
        CANCELADA: { clave: 4, char: 'c', texto: 'Cancelada' },
    },
};

/**
 * Función auxiliar para normalizar los valores de Estado o Dificultad ingresados.
 * @param {object} tipoEnum - EnumsTarea.ESTADO o EnumsTarea.DIFICULTAD
 * @param {string|number} valor - El valor de entrada (1, 'p', 'Pendiente', etc.)
 * @returns {object|null} El objeto Enum correspondiente o null si no es válido.
 */
function normalizarEnum(tipoEnum, valor) {
    if (valor === null || valor === undefined) return null;

    const val = String(valor).toLowerCase().trim();

    for (const clave in tipoEnum) {
        const item = tipoEnum[clave];
        // Compara por clave numérica, char, o texto completo
        if (item.clave === Number(val) || item.char === val || item.texto.toLowerCase() === val) {
            return item;
        }
    }
    return null;
}

class Tarea {
    /**
     * @param {string} titulo - Título de la tarea (máx. 100 caracteres).
     * @param {string} [descripcion=''] - Descripción de la tarea (máx. 500 caracteres).
     * @param {string|number} [estado='p'] - Estado inicial ('p', 1, 'Pendiente', etc.).
     * @param {string|number} [dificultad='f'] - Dificultad inicial ('f', 1, 'fácil', etc.).
     * @param {Date|null} [fechaVencimiento=null] - Fecha de vencimiento opcional.
     * @param {number|null} [costo=null] - Costo asociado a la tarea.
     */
    constructor(titulo, descripcion = '', estado = 'f', dificultad = 'f', fechaVencimiento = null, costo = null) {
        const ahora = new Date();

        // 1. Atributos obligatorios y con validación de longitud
        if (!titulo || titulo.length > 100) {
            throw new Error('El título es obligatorio y no debe exceder los 100 caracteres.');
        }

        this.id = Tarea.generarIdUnico(); // Necesario para la gestión
        this.titulo = titulo.trim();
        this.descripcion = descripcion.substring(0, 500);

        // 2. Atributos con valores acotados y por defecto
        // Por defecto: Pendiente (requisito 1)
        this.estado = normalizarEnum(EnumsTarea.ESTADO, estado) || EnumsTarea.ESTADO.PENDIENTE;
        // Por defecto: Fácil (requisito 1)
        this.dificultad = normalizarEnum(EnumsTarea.DIFICULTAD, dificultad) || EnumsTarea.DIFICULTAD.FACIL;

        // 3. Atributos de fecha (auto-cargados)
        this.fechaCreacion = ahora; // Fecha de creación (auto-cargada)
        // Última Edición (inicialmente igual a Creación - BONUS)
        this.fechaUltimaEdicion = ahora; 

        // 4. Atributos opcionales
        this.fechaVencimiento = fechaVencimiento instanceof Date && !isNaN(fechaVencimiento) ? fechaVencimiento : null;
        this.costo = costo; // No se especificó tipo/validación, se guarda como está
    }

    /**
     * Genera un ID simple y único.
     */
    static generarIdUnico() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }

    /**
     * Devuelve una representación de la tarea para la CLI (Detalle - Imagen 6).
     */
    aCadenaDeVisualizacion() {
        const formatoFecha = (fecha) => (fecha ? fecha.toLocaleDateString('es-AR') : 'Sin Datos');
        const formatoFechaHora = (fecha) => (fecha ? fecha.toLocaleString('es-AR') : 'Sin Datos');

        const vencimientoDisplay = formatoFecha(this.fechaVencimiento);
        const descripcionDisplay = this.descripcion || 'Sin Datos';
        const costoDisplay = this.costo !== null ? this.costo : 'Sin Datos';

        return `
Tarea: ${this.titulo}
Descripción: ${descripcionDisplay}
Estado: ${this.estado.texto}
Dificultad: ${this.dificultad.visual}
Costo: ${costoDisplay}
Vencimiento: ${vencimientoDisplay}
Creación: ${formatoFechaHora(this.fechaCreacion)}
Última Edición: ${formatoFechaHora(this.fechaUltimaEdicion)}
        `.trim();
    }
}

// Exportamos la clase y los Enums
module.exports = { Tarea, EnumsTarea, normalizarEnum };