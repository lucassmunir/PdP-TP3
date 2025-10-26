// SistemaToDo.js

const GestorDeTareas = require('./GestorDeTareas');
const { Tarea, EnumsTarea, normalizarEnum } = require('./Tarea');
const { preguntar, cerrarCLI, mostrarMenu, pausar } = require('./UtilidadesCLI');

class SistemaToDo {
    constructor() {
        this.gestor = new GestorDeTareas();
    }

    // --- MENÚ PRINCIPAL ---
    async menuPrincipal() {
        while (true) {
            console.clear();
            console.log('¡Hola Lucas!');

            const opciones = {
                1: 'Ver Mis Tareas.',
                2: 'Buscar una Tarea.',
                3: 'Agregar una Tarea.',
            };

            const opcion = await mostrarMenu('Menú Principal', opciones, true); // true = 0 para Salir

            if (opcion === null) {
                console.log('\n¡Gracias por usar el sistema! Hasta pronto.');
                return; // Salir
            }

            switch (opcion) {
                case '1':
                    await this.menuVerTareas();
                    break;
                case '2':
                    await this.menuBuscarTarea();
                    break;
                case '3':
                    await this.menuAgregarTarea();
                    break;
                default:
                    // Ya validado, pero por seguridad
                    break;
            }
        }
    }

    // --- MENÚ AGREGAR TAREA (Opción 4) ---
    async menuAgregarTarea() {
        console.clear();
        console.log('--- Creando una nueva tarea ---');

        try {
            // 1. Título (Obligatorio)
            let titulo = await preguntar('1. Ingresa el Título');
            while (!titulo || titulo.length > 100) {
                console.log('[ERROR] Título inválido. Debe ser un texto corto (máx 100 caracteres).');
                titulo = await preguntar('1. Ingresa el Título');
            }

            // 2. Descripción (Opcional)
            const descripcion = await preguntar('2. Ingresa la descripción (Opcional)');

            // 3. Estado (Por defecto: Pendiente)
            const opcionesEstado = Object.values(EnumsTarea.ESTADO).map(e => `[${e.char}] ${e.texto}`).join(' / ');
            const estadoInput = await preguntar(`3. Estado (${opcionesEstado}) [P] `) || 'p'; // Por defecto 'p'
            const estado = normalizarEnum(EnumsTarea.ESTADO, estadoInput);

            // 4. Dificultad (Por defecto: Fácil)
            const opcionesDificultad = Object.values(EnumsTarea.DIFICULTAD).map(e => `[${e.clave}] ${e.texto}`).join(' / ');
            const dificultadInput = await preguntar(`4. Dificultad (${opcionesDificultad}) [1] `) || '1'; // Por defecto '1'
            const dificultad = normalizarEnum(EnumsTarea.DIFICULTAD, dificultadInput);
            
            // 5. Vencimiento 
            let fechaVencimiento = null;
            const vencimientoInput = await preguntar('5. Vencimiento (dd/mm/aaaa) (Opcional)');
            if (vencimientoInput) {
                const parts = vencimientoInput.split('/');
                // Intento de parsear la fecha (Date(año, mes-1, día))
                const tempDate = new Date(parts[2], parts[1] - 1, parts[0]);
                if (!isNaN(tempDate)) {
                    fechaVencimiento = tempDate;
                } else {
                    console.log('[AVISO] Formato de fecha de vencimiento inválido. Se omite.');
                }
            }

            // 6. Costo (Requisito 1)
            let costo = await preguntar('6. Ingresa el Costo (Opcional)');
            costo = costo ? parseFloat(costo) : null;
            if (isNaN(costo)) costo = null;


            // Creación y guardado
            const nuevaTarea = new Tarea(titulo, descripcion, estado.char, dificultad.char, fechaVencimiento, costo);
            this.gestor.agregarTarea(nuevaTarea);
            
            console.log('\n¡Datos guardados!'); // Requisito (Imagen 11)
            await pausar();

        } catch (error) {
            console.error(`\n[ERROR GRAVE] ${error.message}`);
            await pausar();
        }
    }

    // --- MENÚ VER MIS TAREAS (Opción 1) ---
    // SistemaToDo.js - Método menuVerTareas (¡CORREGIDO!)

    async menuVerTareas() {
        
        // 🚨 CÓDIGO FALTANTE: DEBES DEFINIR ESTE OBJETO
        const opciones = {
            1: 'Todas',
            2: 'Pendientes',
            3: 'En curso',
            4: 'Terminadas',
            // Opciones 5 a 9 se podrían usar para el BONUS de Ordenación
        };
        // ---------------------------------------------

        const opcionesFiltro = {
            1: null, // Todas
            2: EnumsTarea.ESTADO.PENDIENTE.char,
            3: EnumsTarea.ESTADO.EN_CURSO.char,
            4: EnumsTarea.ESTADO.TERMINADA.char,
        };

        const opcion = await mostrarMenu('Menú Ver Mis Tareas', opciones, true); 

        // La solución previa para el null es correcta, úsala:
        if (opcion !== null && opcionesFiltro.hasOwnProperty(opcion)) {
            await this.mostrarListadoTareas(opcionesFiltro[opcion]);
        }
    }
    
    // --- MENÚ BUSCAR TAREA (Opción 2) ---
    async menuBuscarTarea() {
        console.clear();
        console.log('--- Búsqueda de Tareas ---');

        const cadenaBusqueda = await preguntar('Introduce el título de una tarea para buscarla');

        const resultados = this.gestor.buscarTareasPorTitulo(cadenaBusqueda);

        if (resultados.length === 0) {
            console.log('\nNo hay tareas relacionadas con la búsqueda.'); // Requisito (Imagen 10)
            await pausar();
        } else {
            await this.mostrarListadoTareas(null, resultados);
        }
    }


    // --- LISTADO DE TAREAS Y SELECCIÓN (Imágenes 5, 10) ---
    async mostrarListadoTareas(filtroClave = null, tareasPreFiltradas = null) {
        let tareas = tareasPreFiltradas || this.gestor.filtrarTareas(filtroClave);

        if (tareas.length === 0) {
            console.clear();
            console.log('\nNo hay tareas para mostrar en este filtro.');
            await pausar();
            return;
        }

        while (true) {
            console.clear();
            console.log('--- Listado de Tareas ---');
            
            // BONUS: Ordenación (Simple, por defecto Título)
            console.log(`\nOrden: [T] Título | [V] Vencimiento | [C] Creación. (Actual: Título)`);
            const opcionOrden = await preguntar('Elige un criterio de ordenación (o ENTER para continuar)');
            
            let criterioOrden = 'titulo';
            if (opcionOrden === 'v' || opcionOrden === 'V') criterioOrden = 'vencimiento';
            if (opcionOrden === 'c' || opcionOrden === 'C') criterioOrden = 'creacion';

            tareas = this.gestor.ordenarTareas(tareas, criterioOrden);
            
            console.log('\nEstas son todas tus tareas:');
            tareas.forEach((t, index) => {
                console.log(`[${index + 1}] ${t.titulo} (Estado: ${t.estado.texto})`);
            });

            // Navegación (Imagen 5)
            const eleccion = await preguntar('\n¿Deseas ver los detalles de alguna? Introduce el número para verla o 0 para volver');

            if (eleccion === '0') {
                return; // Volver al menú anterior
            }

            const indice = parseInt(eleccion);
            const tareaSeleccionada = this.gestor.obtenerTareaPorIndice(indice, tareas);

            if (tareaSeleccionada) {
                await this.menuDetallesTarea(tareaSeleccionada);
            } else {
                console.log('\n[ERROR] El número de tarea no es válido.'); // Requisito de validación
                await pausar();
            }
        }
    }

    // --- MENÚ DETALLES DE TAREA (Imágenes 6, 7) ---
    async menuDetallesTarea(tarea) {
        while (true) {
            console.clear();
            console.log('--- Detalles de Tarea ---');
            
            // Mostrar todos los detalles requeridos (Imagen 6)
            console.log(tarea.aCadenaDeVisualizacion()); 

            const eleccion = await preguntar('\nSi deseas editarla, presiona E, o presiona 0 para volver'); // Requisito (Imagen 6)

            if (eleccion === '0') {
                return; // Volver al listado
            }

            if (eleccion.toUpperCase() === 'E') {
                await this.menuEdicionTarea(tarea);
                return; // Al editar y guardar, volvemos a mostrar el listado actualizado
            } else {
                console.log('\n[ERROR] Opción no válida.');
                await pausar();
            }
        }
    }

    // --- MENÚ EDICIÓN DE TAREA (Imágenes 8, 9) ---
    async menuEdicionTarea(tarea) {
        console.clear();
        console.log(`--- Editando la tarea: ${tarea.titulo} ---`);
        console.log(' - Si deseas mantener el valor, simplemente déjalo en blanco.');
        console.log(' - Si deseas dejar sin valor (vaciar), escribe un espacio ( " " ).');

        const actualizaciones = {};

        // 1. Título
        let tituloInput = await preguntar(`1. Título (Actual: ${tarea.titulo})`);
        if (tituloInput !== '') actualizaciones.titulo = tituloInput;

        // 2. Descripción
        const descripcionInput = await preguntar(`2. Descripción (Actual: ${tarea.descripcion || 'Sin Datos'})`);
        if (descripcionInput !== '') actualizaciones.descripcion = descripcionInput; // Si es ' ', se vacía en el gestor

        // 3. Estado
        const opcionesEstado = Object.values(EnumsTarea.ESTADO).map(e => `[${e.char}] ${e.texto}`).join(' / ');
        const estadoInput = await preguntar(`3. Estado (Actual: ${tarea.estado.texto}) (${opcionesEstado})`);
        if (estadoInput !== '') actualizaciones.estado = estadoInput;

        // 4. Dificultad
        const opcionesDificultad = Object.values(EnumsTarea.DIFICULTAD).map(e => `[${e.clave}] ${e.texto}`).join(' / ');
        const dificultadInput = await preguntar(`4. Dificultad (Actual: ${tarea.dificultad.texto}) (${opcionesDificultad})`);
        if (dificultadInput !== '') actualizaciones.dificultad = dificultadInput;

        // 5. Vencimiento (Editable)
        let vencimientoInput = await preguntar(`5. Vencimiento (Actual: ${tarea.fechaVencimiento ? tarea.fechaVencimiento.toLocaleDateString('es-AR') : 'Sin Datos'}) (dd/mm/aaaa para cambiar, " " para vaciar)`);
        
        if (vencimientoInput === ' ') {
            actualizaciones.fechaVencimiento = null;
        } else if (vencimientoInput !== '') {
            const parts = vencimientoInput.split('/');
            const tempDate = new Date(parts[2], parts[1] - 1, parts[0]);
            if (!isNaN(tempDate)) {
                actualizaciones.fechaVencimiento = tempDate;
            } else {
                console.log('\n[AVISO] Formato de fecha inválido. Se omite la actualización del vencimiento.');
            }
        }

        // 6. Costo (No se vio en la edición, pero lo incluimos por coherencia)
        let costoInput = await preguntar(`6. Costo (Actual: ${tarea.costo !== null ? tarea.costo : 'Sin Datos'})`);
        if (costoInput !== '') {
            const nuevoCosto = costoInput.trim() === ' ' ? null : parseFloat(costoInput);
            if (!isNaN(nuevoCosto)) {
                actualizaciones.costo = nuevoCosto;
            }
        }
        
        // Aplicar la edición
        this.gestor.editarTarea(tarea, actualizaciones);

        console.log('\n¡Datos guardados!'); // Requisito (Imagen 8)
        await pausar();
    }
}

module.exports = SistemaToDo;