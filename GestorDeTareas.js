// GestorDeTareas.js

const fs = require('fs');
const path = require('path');
const { Tarea, EnumsTarea, normalizarEnum } = require('./Tarea'); // Importamos la clase y enums

const RUTA_ARCHIVO = path.join(__dirname, 'tareas.json');

class GestorDeTareas {
    constructor() {
        this.tareas = []; // Colección de objetos Tarea
        this.cargarTareas();
    }

    /**
     * Carga las tareas desde el archivo JSON.
     */
    cargarTareas() {
        if (fs.existsSync(RUTA_ARCHIVO)) {
            try {
                const data = fs.readFileSync(RUTA_ARCHIVO, 'utf8');
                const tareasCrudas = JSON.parse(data);

                // Recreamos las instancias de Tarea con los datos cargados
                this.tareas = tareasCrudas.map(raw => {
                    // Recreamos la clase Tarea a partir de los datos crudos
                    const tarea = new Tarea(raw.titulo, raw.descripcion, raw.estado.char, raw.dificultad.char, raw.fechaVencimiento ? new Date(raw.fechaVencimiento) : null, raw.costo);
                    
                    // Aseguramos que las fechas y el ID se mantengan como estaban
                    Object.assign(tarea, {
                        id: raw.id,
                        fechaCreacion: new Date(raw.fechaCreacion),
                        fechaUltimaEdicion: new Date(raw.fechaUltimaEdicion),
                    });
                    return tarea;
                });
            } catch (error) {
                console.error("[Sistema] Error al cargar o parsear el archivo de tareas:", error.message);
                this.tareas = [];
            }
        }
    }

    /**
     * Guarda la colección actual de tareas en el archivo JSON.
     */
    guardarTareas() {
        try {
            // Se serializa la colección
            const data = JSON.stringify(this.tareas, null, 2);
            fs.writeFileSync(RUTA_ARCHIVO, data, 'utf8');
        } catch (error) {
            console.error("[Sistema] Error al guardar las tareas:", error.message);
        }
    }

    // --- MÉTODOS CRUD Y LÓGICA DE NEGOCIO ---

    /**
     * Agrega una nueva tarea a la colección y guarda.
     * @param {Tarea} tarea - Una instancia de la clase Tarea.
     */
    agregarTarea(tarea) {
        this.tareas.push(tarea);
        this.guardarTareas();
    }
    
    /**
     * Encuentra una tarea por su índice en la lista filtrada actual.
     * @param {number} indice - El índice (base 1) en la lista que se está mostrando.
     * @param {Tarea[]} lista - La lista filtrada actual.
     * @returns {Tarea|undefined}
     */
    obtenerTareaPorIndice(indice, lista) {
        if (indice > 0 && indice <= lista.length) {
            return lista[indice - 1];
        }
        return undefined;
    }


    /**
     * Modifica los atributos editables de una tarea. (Imágenes 8 y 9)
     * @param {Tarea} tarea - La instancia de Tarea a modificar.
     * @param {object} actualizaciones - Objeto con los nuevos valores.
     */
    editarTarea(tarea, actualizaciones) {
        // [BONUS] Actualizar Última Edición
        tarea.fechaUltimaEdicion = new Date(); 

        // Actualizar Título 
        if (actualizaciones.titulo !== undefined) {
            const nuevoTitulo = actualizaciones.titulo.trim();
            if (nuevoTitulo !== '') { // Requisito: Si se deja en blanco, no se modifica
                tarea.titulo = nuevoTitulo.substring(0, 100);
            }
        }

        // Actualizar Descripción (Requisito: Espacio para vaciar, blanco para no modificar)
        if (actualizaciones.descripcion !== undefined) {
            if (actualizaciones.descripcion === ' ') { // Si es un espacio, se convierte en string vacío (vaciar)
                tarea.descripcion = ''; 
            } else if (actualizaciones.descripcion !== '') { // Si tiene texto, se actualiza
                tarea.descripcion = actualizaciones.descripcion.substring(0, 500);
            }
        }
        
        // Actualizar Estado
        if (actualizaciones.estado) {
            const nuevoEstado = normalizarEnum(EnumsTarea.ESTADO, actualizaciones.estado);
            if (nuevoEstado) {
                tarea.estado = nuevoEstado;
            }
        }

        // Actualizar Dificultad
        if (actualizaciones.dificultad) {
            const nuevaDificultad = normalizarEnum(EnumsTarea.DIFICULTAD, actualizaciones.dificultad);
            if (nuevaDificultad) {
                tarea.dificultad = nuevaDificultad;
            }
        }

        // Actualizar Vencimiento (Fecha)
        if (actualizaciones.fechaVencimiento !== undefined) {
            tarea.fechaVencimiento = actualizaciones.fechaVencimiento;
        }

        // Actualizar Costo
        if (actualizaciones.costo !== undefined) {
            tarea.costo = actualizaciones.costo;
        }

        this.guardarTareas();
    }

    /**
     * Filtra las tareas por estado. (Imagen 4)
     * @param {string|number|null} claveEstado - La clave de estado ('p', 'e', 't', 'c', 1, 2, 3, 4) o null para todas.
     * @returns {Tarea[]} Lista de tareas filtradas.
     */
    filtrarTareas(claveEstado = null) {
        if (!claveEstado) {
            return [...this.tareas]; // Devuelve todas las tareas
        }
        
        const enumEstado = normalizarEnum(EnumsTarea.ESTADO, claveEstado);

        if (enumEstado) {
            return this.tareas.filter(tarea => tarea.estado.clave === enumEstado.clave);
        }

        return []; 
    }

    /**
     * Busca tareas por una clave contenida en el Título. (Imagen 10)
     * @param {string} cadenaBusqueda - String a buscar.
     * @returns {Tarea[]} Lista de tareas que coinciden.
     */
    buscarTareasPorTitulo(cadenaBusqueda) {
        if (!cadenaBusqueda || cadenaBusqueda.trim() === '') return [];
        const busquedaNormalizada = cadenaBusqueda.toLowerCase().trim();

        return this.tareas.filter(tarea => 
            tarea.titulo.toLowerCase().includes(busquedaNormalizada)
        );
    }
    
    /**
     * Ordena las tareas según un criterio. (Imagen 5 - BONUS)
     * @param {Tarea[]} lista - Lista de tareas a ordenar.
     * @param {string} criterio - Criterio ('titulo', 'vencimiento', 'creacion').
     * @returns {Tarea[]} Lista ordenada.
     */
    ordenarTareas(lista, criterio) {
        let listaOrdenada = [...lista]; // Copia para no modificar el original

        listaOrdenada.sort((a, b) => {
            switch (criterio) {
                case 'titulo':
                    return a.titulo.localeCompare(b.titulo); // Alfabético ascendente
                case 'vencimiento':
                    // Fechas nulas se envían al final (Infinito)
                    const fechaA = a.fechaVencimiento ? a.fechaVencimiento.getTime() : Infinity;
                    const fechaB = b.fechaVencimiento ? b.fechaVencimiento.getTime() : Infinity;
                    return fechaA - fechaB; // Ascendente (más cercana primero)
                case 'creacion':
                    return a.fechaCreacion.getTime() - b.fechaCreacion.getTime(); // Ascendente
                default:
                    return 0;
            }
        });
        return listaOrdenada;
    }
}

module.exports = GestorDeTareas;