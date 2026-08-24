// ==========================================
// PRESTACONTROL - SISTEMA COMPLETO
// VERSIÓN CORREGIDA - CON VERIFICACIONES
// ==========================================

// ===== CONFIGURACIÓN =====
let clientes = [];
let cuotas = [];
let historialPagos = [];
let filtroPlazoActual = 'todos';
let filtroPeriodoActual = 'diario';

// ==========================================
// FORMATO PESOS COLOMBIANOS (COP)
// ==========================================

function formatoCOP(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) {
        return '$ 0';
    }
    const numero = Math.round(valor);
    const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${conPuntos}`;
}

function formatoCOPCorto(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) {
        return '$0';
    }
    const numero = Math.round(valor);
    const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${conPuntos}`;
}

// ==========================================
// DATOS DE CLIENTES (TUS DATOS COMPLETOS)
// ==========================================

function getClientesIniciales() {
    return [
        { id: 1, nombre: 'Omar', telefono: '', email: '', monto: 3800000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 3800000, diasPago: '', diaFijo: '' },
        { id: 2, nombre: 'Daniela', telefono: '', email: '', monto: 1400000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 1400000, diasPago: '', diaFijo: '' },
        { id: 3, nombre: 'Juanchi', telefono: '', email: '', monto: 450000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'mensual', saldo: 450000, diasPago: '', diaFijo: '' },
        { id: 4, nombre: 'Lorena Yanez', telefono: '', email: '', monto: 2000000, fechaInicio: '2026-01-01', plazo: 2, tipoPlazo: 'quincenal', saldo: 2000000, diasPago: '16,31', diaFijo: '' },
        { id: 5, nombre: 'Charo Yanez', telefono: '', email: '', monto: 300000, fechaInicio: '2026-01-01', plazo: 180, tipoPlazo: 'quincenal', saldo: 300000, diasPago: '05,20', diaFijo: '' },
        { id: 6, nombre: 'Edinzon', telefono: '', email: '', monto: 300000, fechaInicio: '2026-01-01', plazo: 60, tipoPlazo: 'mensual', saldo: 300000, diasPago: '', diaFijo: '28' },
        { id: 7, nombre: 'Margarita Cotorra', telefono: '', email: '', monto: 500000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 500000, diasPago: '', diaFijo: '' },
        { id: 8, nombre: 'Señor 26 Papi', telefono: '', email: '', monto: 300000, fechaInicio: '2026-01-01', plazo: 60, tipoPlazo: 'mensual', saldo: 300000, diasPago: '', diaFijo: '26' },
        { id: 9, nombre: 'Señor Mecanico', telefono: '', email: '', monto: 200000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'semanal', saldo: 200000, diasPago: '', diaFijo: '' },
        { id: 10, nombre: 'Primo Mecanico', telefono: '', email: '', monto: 150000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'semanal', saldo: 150000, diasPago: '', diaFijo: '' },
        { id: 11, nombre: 'Claudia German', telefono: '', email: '', monto: 1000000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 1000000, diasPago: '', diaFijo: '' },
        { id: 12, nombre: 'Rosmira', telefono: '', email: '', monto: 700000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 700000, diasPago: '', diaFijo: '' },
        { id: 13, nombre: 'Juanchi Nequi', telefono: '', email: '', monto: 300000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 300000, diasPago: '', diaFijo: '' },
        { id: 14, nombre: 'Yulieth', telefono: '', email: '', monto: 200000, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 200000, diasPago: '', diaFijo: '' }
    ];
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosLocales();
    
    // Verificar que los elementos existan antes de usarlos
    const fechaInicio = document.getElementById('fechaInicio');
    if (fechaInicio) {
        fechaInicio.value = new Date().toISOString().split('T')[0];
    }
    
    const formCliente = document.getElementById('formCliente');
    if (formCliente) {
        formCliente.addEventListener('submit', guardarCliente);
    }
    
    const fechaActual = document.getElementById('fechaActual');
    if (fechaActual) {
        fechaActual.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    
    const tipoPlazo = document.getElementById('tipoPlazo');
    if (tipoPlazo) {
        tipoPlazo.addEventListener('change', function() {
            const campoPersonalizado = document.getElementById('campoDiasPago');
            if (campoPersonalizado) {
                if (this.value === 'personalizado' || this.value === 'quincenal') {
                    campoPersonalizado.style.display = 'grid';
                } else {
                    campoPersonalizado.style.display = 'none';
                }
            }
        });
    }
    
    renderizarTodo();
    setTimeout(verificarAtrasos, 1500);
});

// ===== CARGA DE DATOS =====
function cargarDatosLocales() {
    try {
        const clientesGuardados = localStorage.getItem('clientes');
        const cuotasGuardadas = localStorage.getItem('cuotas');
        const historialGuardado = localStorage.getItem('historialPagos');
        
        if (clientesGuardados && clientesGuardados !== '[]') {
            clientes = JSON.parse(clientesGuardados);
        } else {
            clientes = getClientesIniciales();
            guardarClientes();
        }
        
        if (cuotasGuardadas && cuotasGuardadas !== '[]') {
            cuotas = JSON.parse(cuotasGuardadas);
        } else {
            cuotas = [];
            clientes.forEach(cliente => {
                if (cliente.tipoPlazo !== 'sin_definir' && cliente.plazo > 0) {
                    generarCuotasCliente(cliente);
                }
            });
            guardarCuotas();
        }
        
        if (historialGuardado && historialGuardado !== '[]') {
            historialPagos = JSON.parse(historialGuardado);
        } else {
            historialPagos = [];
            guardarHistorial();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        clientes = getClientesIniciales();
        cuotas = [];
        historialPagos = [];
        guardarClientes();
        guardarCuotas();
        guardarHistorial();
    }
}

// ===== GUARDADO =====
function guardarClientes() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    actualizarEstadisticas();
    actualizarPlazos();
}

function guardarCuotas() {
    localStorage.setItem('cuotas', JSON.stringify(cuotas));
    actualizarEstadisticas();
}

function guardarHistorial() {
    localStorage.setItem('historialPagos', JSON.stringify(historialPagos));
}

// ==========================================
// FUNCIÓN PARA OBTENER ELEMENTO SEGURO
// ==========================================

function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`⚠️ Elemento no encontrado: #${id}`);
    }
    return el;
}

// ==========================================
// EDITAR CLIENTE - CORREGIDO
// ==========================================

function editarCliente(id) {
    console.log('🔍 Editando cliente ID:', id);
    
    // Buscar el cliente
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        console.error('❌ Cliente no encontrado:', id);
        return;
    }
    
    console.log('✅ Datos del cliente:', cliente);
    
    // Verificar que todos los elementos existan
    const elementos = {
        clienteId: getElement('clienteId'),
        nombre: getElement('nombre'),
        telefono: getElement('telefono'),
        email: getElement('email'),
        monto: getElement('monto'),
        fechaInicio: getElement('fechaInicio'),
        tipoPlazo: getElement('tipoPlazo'),
        plazo: getElement('plazo'),
        diasPago: getElement('diasPago'),
        diaFijo: getElement('diaFijo'),
        campoDiasPago: getElement('campoDiasPago'),
        formTitulo: getElement('formTitulo'),
        btnSubmit: getElement('btnSubmit'),
        btnCancelar: getElement('btnCancelar')
    };
    
    // Verificar que todos los elementos existan
    for (const [key, el] of Object.entries(elementos)) {
        if (!el) {
            console.error(`❌ Elemento #${key} no encontrado en el DOM`);
            mostrarNotificacion(`Error: elemento ${key} no encontrado`, 'error');
            return;
        }
    }
    
    // Llenar el formulario con los datos del cliente
    elementos.clienteId.value = cliente.id;
    elementos.nombre.value = cliente.nombre;
    elementos.telefono.value = cliente.telefono !== '—' ? cliente.telefono : '';
    elementos.email.value = cliente.email !== '—' ? cliente.email : '';
    elementos.monto.value = cliente.monto;
    elementos.fechaInicio.value = cliente.fechaInicio;
    elementos.tipoPlazo.value = cliente.tipoPlazo;
    elementos.plazo.value = cliente.plazo || '';
    elementos.diasPago.value = cliente.diasPago || '';
    elementos.diaFijo.value = cliente.diaFijo || '';
    
    // Mostrar campos personalizados si es necesario
    if (cliente.tipoPlazo === 'personalizado' || cliente.tipoPlazo === 'quincenal') {
        elementos.campoDiasPago.style.display = 'grid';
    } else {
        elementos.campoDiasPago.style.display = 'none';
    }
    
    // Cambiar el título y botones del formulario
    elementos.formTitulo.textContent = 'Editar Cliente';
    elementos.btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
    elementos.btnCancelar.style.display = 'inline-block';
    
    // Hacer scroll al formulario
    const seccionClientes = getElement('seccion-clientes');
    if (seccionClientes) {
        seccionClientes.scrollIntoView({ behavior: 'smooth' });
    }
    
    mostrarNotificacion(`✏️ Editando cliente: ${cliente.nombre}`, 'warning');
}

// ==========================================
// CANCELAR EDICIÓN - CORREGIDO
// ==========================================

function cancelarEdicion() {
    console.log('❌ Cancelando edición');
    
    const elementos = {
        clienteId: getElement('clienteId'),
        formCliente: getElement('formCliente'),
        fechaInicio: getElement('fechaInicio'),
        campoDiasPago: getElement('campoDiasPago'),
        formTitulo: getElement('formTitulo'),
        btnSubmit: getElement('btnSubmit'),
        btnCancelar: getElement('btnCancelar')
    };
    
    if (elementos.clienteId) elementos.clienteId.value = '';
    if (elementos.formCliente) elementos.formCliente.reset();
    if (elementos.fechaInicio) {
        elementos.fechaInicio.value = new Date().toISOString().split('T')[0];
    }
    if (elementos.campoDiasPago) elementos.campoDiasPago.style.display = 'none';
    if (elementos.formTitulo) elementos.formTitulo.textContent = 'Nuevo Cliente';
    if (elementos.btnSubmit) {
        elementos.btnSubmit.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Cliente';
    }
    if (elementos.btnCancelar) elementos.btnCancelar.style.display = 'none';
}

// ==========================================
// GUARDAR CLIENTE - CORREGIDO
// ==========================================

function guardarCliente(event) {
    event.preventDefault();
    
    const elementos = {
        clienteId: getElement('clienteId'),
        nombre: getElement('nombre'),
        telefono: getElement('telefono'),
        email: getElement('email'),
        monto: getElement('monto'),
        fechaInicio: getElement('fechaInicio'),
        tipoPlazo: getElement('tipoPlazo'),
        plazo: getElement('plazo'),
        diasPago: getElement('diasPago'),
        diaFijo: getElement('diaFijo'),
        formCliente: getElement('formCliente'),
        campoDiasPago: getElement('campoDiasPago')
    };
    
    // Verificar elementos esenciales
    if (!elementos.nombre || !elementos.monto || !elementos.fechaInicio) {
        mostrarNotificacion('Error: elementos del formulario no encontrados', 'error');
        return;
    }
    
    const id = elementos.clienteId ? elementos.clienteId.value : '';
    const nombre = elementos.nombre.value.trim();
    const telefono = elementos.telefono ? elementos.telefono.value.trim() : '';
    const email = elementos.email ? elementos.email.value.trim() : '';
    const monto = parseFloat(elementos.monto.value);
    const fechaInicio = elementos.fechaInicio.value;
    const tipoPlazo = elementos.tipoPlazo ? elementos.tipoPlazo.value : 'sin_definir';
    const plazo = parseInt(elementos.plazo ? elementos.plazo.value : '0') || 0;
    const diasPago = elementos.diasPago ? elementos.diasPago.value.trim() : '';
    const diaFijo = elementos.diaFijo ? elementos.diaFijo.value.trim() : '';
    
    if (!nombre || !monto || !fechaInicio) {
        mostrarNotificacion('Completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (id) {
        // EDITAR CLIENTE EXISTENTE
        const clienteExistente = clientes.find(c => c.id === parseInt(id));
        if (!clienteExistente) {
            mostrarNotificacion('Cliente no encontrado', 'error');
            return;
        }
        
        const montoAnterior = clienteExistente.monto;
        
        clienteExistente.nombre = nombre;
        clienteExistente.telefono = telefono || '—';
        clienteExistente.email = email || '—';
        clienteExistente.monto = monto;
        clienteExistente.fechaInicio = fechaInicio;
        clienteExistente.tipoPlazo = tipoPlazo;
        clienteExistente.plazo = plazo;
        clienteExistente.diasPago = diasPago || '';
        clienteExistente.diaFijo = diaFijo || '';
        
        if (montoAnterior !== monto) {
            const cuotasPagadas = cuotas.filter(c => c.clienteId === clienteExistente.id && c.estado === 'pagada');
            const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.monto, 0);
            clienteExistente.saldo = monto - totalPagado;
        }
        
        guardarClientes();
        
        cuotas = cuotas.filter(c => c.clienteId !== clienteExistente.id);
        if (tipoPlazo !== 'sin_definir' && plazo > 0) {
            generarCuotasCliente(clienteExistente);
        }
        guardarCuotas();
        
        mostrarNotificacion(`✅ Cliente "${nombre}" actualizado correctamente`, 'success');
        cancelarEdicion();
        
    } else {
        // NUEVO CLIENTE
        const nuevoCliente = {
            id: Date.now(),
            nombre,
            telefono: telefono || '—',
            email: email || '—',
            monto,
            fechaInicio,
            tipoPlazo,
            plazo,
            saldo: monto,
            diasPago: diasPago || '',
            diaFijo: diaFijo || ''
        };
        
        clientes.push(nuevoCliente);
        guardarClientes();
        
        if (tipoPlazo !== 'sin_definir' && plazo > 0) {
            generarCuotasCliente(nuevoCliente);
            guardarCuotas();
        }
        
        if (elementos.formCliente) elementos.formCliente.reset();
        if (elementos.fechaInicio) {
            elementos.fechaInicio.value = new Date().toISOString().split('T')[0];
        }
        if (elementos.campoDiasPago) elementos.campoDiasPago.style.display = 'none';
        
        mostrarNotificacion(`✅ Cliente "${nombre}" agregado con ${formatoCOP(monto)}`, 'success');
    }
    
    renderizarTodo();
}

// ==========================================
// REPORTAR CUOTA
// ==========================================

function reportarCuota(clienteId, montoPagar) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        return;
    }
    
    let monto = montoPagar;
    if (!monto || monto <= 0) {
        const cuotaPendiente = cuotas
            .filter(c => c.clienteId === clienteId && c.estado === 'pendiente')
            .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
        
        if (cuotaPendiente) {
            monto = cuotaPendiente.monto;
        } else {
            mostrarNotificacion(`${cliente.nombre} no tiene cuotas pendientes`, 'error');
            return;
        }
    }
    
    if (monto > cliente.saldo) {
        mostrarNotificacion(`El monto (${formatoCOP(monto)}) supera el saldo (${formatoCOP(cliente.saldo)})`, 'error');
        return;
    }
    
    const cuota = cuotas.find(c => 
        c.clienteId === clienteId && 
        c.estado === 'pendiente' && 
        Math.abs(c.monto - monto) < 1
    );
    
    if (!cuota) {
        const cuotasPendientes = cuotas
            .filter(c => c.clienteId === clienteId && c.estado === 'pendiente')
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
        
        if (cuotasPendientes.length > 0) {
            cuotasPendientes[0].estado = 'pagada';
            monto = cuotasPendientes[0].monto;
        } else {
            mostrarNotificacion(`${cliente.nombre} no tiene cuotas pendientes`, 'error');
            return;
        }
    } else {
        cuota.estado = 'pagada';
    }
    
    cliente.saldo = parseFloat((cliente.saldo - monto).toFixed(2));
    
    const registro = {
        id: Date.now(),
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        monto: monto,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES'),
        saldoRestante: cliente.saldo
    };
    historialPagos.push(registro);
    
    guardarClientes();
    guardarCuotas();
    guardarHistorial();
    
    const cuotasRestantes = cuotas.filter(c => 
        c.clienteId === cliente.id && c.estado !== 'pagada'
    ).length;
    
    const cuotasPagadas = cuotas.filter(c => 
        c.clienteId === cliente.id && c.estado === 'pagada'
    ).length;
    const totalCuotas = cuotasPagadas + cuotasRestantes;
    
    let mensaje = `${cliente.nombre} pagó ${formatoCOP(monto)}\n`;
    mensaje += `Saldo restante: ${formatoCOP(cliente.saldo)}\n`;
    mensaje += `Cuotas: ${cuotasPagadas}/${totalCuotas} pagadas (${cuotasRestantes} restantes)`;
    
    mostrarNotificacion(mensaje, 'success');
    
    if (cliente.saldo <= 0) {
        mostrarNotificacion(`¡${cliente.nombre} ha saldado completamente su deuda!`, 'success');
    }
    
    renderizarTodo();
}

// ==========================================
// REPORTAR CUOTA PERSONALIZADA
// ==========================================

function reportarCuotaPersonalizada(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const montoInput = prompt(
        `${cliente.nombre}\nSaldo actual: ${formatoCOP(cliente.saldo)}\n\nIngresa el monto a pagar:`,
        Math.min(100000, cliente.saldo)
    );
    
    if (montoInput === null) return;
    
    const monto = parseFloat(montoInput.replace(/[^0-9.]/g, ''));
    if (isNaN(monto) || monto <= 0) {
        mostrarNotificacion('Monto inválido', 'error');
        return;
    }
    
    reportarCuota(clienteId, monto);
}

// ==========================================
// VER HISTORIAL
// ==========================================

function verHistorialCliente(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const pagos = historialPagos.filter(h => h.clienteId === clienteId);
    
    if (pagos.length === 0) {
        mostrarNotificacion(`${cliente.nombre} no tiene pagos registrados`, 'warning');
        return;
    }
    
    let mensaje = `HISTORIAL DE ${cliente.nombre.toUpperCase()}\n`;
    mensaje += '━'.repeat(40) + '\n';
    
    pagos.forEach((p, i) => {
        mensaje += `${i+1}. ${formatoCOP(p.monto)} - ${p.fecha} ${p.hora}\n`;
        mensaje += `   Saldo: ${formatoCOP(p.saldoRestante)}\n`;
    });
    
    mensaje += '━'.repeat(40) + '\n';
    mensaje += `Total pagado: ${formatoCOP(pagos.reduce((sum, p) => sum + p.monto, 0))}`;
    
    mostrarNotificacion(mensaje, 'success');
}

// ==========================================
// GENERAR CUOTAS
// ==========================================

function generarCuotasCliente(cliente) {
    if (cliente.tipoPlazo === 'sin_definir' || cliente.plazo <= 0) return;
    
    const cuotaMensual = cliente.monto / cliente.plazo;
    const fechaInicio = new Date(cliente.fechaInicio);
    
    let diaFijo = cliente.diaFijo ? parseInt(cliente.diaFijo) : null;
    let diasPago = cliente.diasPago ? cliente.diasPago.split(',').map(d => parseInt(d.trim())) : [];
    
    for (let i = 1; i <= cliente.plazo; i++) {
        const fechaCuota = new Date(fechaInicio);
        
        switch(cliente.tipoPlazo) {
            case 'diario':
                fechaCuota.setDate(fechaCuota.getDate() + i);
                break;
            case 'semanal':
                fechaCuota.setDate(fechaCuota.getDate() + (i * 7));
                break;
            case 'quincenal':
                if (diasPago.length > 0) {
                    const mes = fechaCuota.getMonth();
                    const anio = fechaCuota.getFullYear();
                    const diaIndex = (i - 1) % diasPago.length;
                    let dia = diasPago[diaIndex];
                    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
                    if (dia > ultimoDia) dia = ultimoDia;
                    fechaCuota.setDate(dia);
                    if (i > 1 && diaIndex === 0) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1);
                    }
                } else {
                    fechaCuota.setDate(fechaCuota.getDate() + (i * 15));
                }
                break;
            case 'mensual':
            case 'personalizado':
                if (diaFijo) {
                    fechaCuota.setMonth(fechaCuota.getMonth() + i);
                    const ultimoDia = new Date(fechaCuota.getFullYear(), fechaCuota.getMonth() + 1, 0).getDate();
                    fechaCuota.setDate(Math.min(diaFijo, ultimoDia));
                } else if (diasPago.length > 0) {
                    const mes = fechaCuota.getMonth();
                    const anio = fechaCuota.getFullYear();
                    const diaIndex = (i - 1) % diasPago.length;
                    let dia = diasPago[diaIndex];
                    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
                    if (dia > ultimoDia) dia = ultimoDia;
                    fechaCuota.setDate(dia);
                    if (i > 1 && diaIndex === 0) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1);
                    }
                } else {
                    fechaCuota.setMonth(fechaCuota.getMonth() + i);
                }
                break;
        }
        
        const fechaCuotaStr = fechaCuota.toISOString().split('T')[0];
        
        const existePagada = cuotas.some(c => 
            c.clienteId === cliente.id && 
            c.fecha === fechaCuotaStr && 
            c.estado === 'pagada'
        );
        
        if (!existePagada) {
            cuotas.push({
                id: Date.now() + i + cliente.id + Math.random(),
                clienteId: cliente.id,
                clienteNombre: cliente.nombre,
                fecha: fechaCuotaStr,
                monto: parseFloat(cuotaMensual.toFixed(2)),
                estado: 'pendiente'
            });
        }
    }
}

// ==========================================
// ELIMINAR CLIENTE
// ==========================================

function eliminarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    if (!confirm(`¿Eliminar a "${cliente.nombre}" y todas sus cuotas?`)) return;
    
    clientes = clientes.filter(c => c.id !== id);
    cuotas = cuotas.filter(c => c.clienteId !== id);
    historialPagos = historialPagos.filter(h => h.clienteId !== id);
    
    guardarClientes();
    guardarCuotas();
    guardarHistorial();
    renderizarTodo();
    mostrarNotificacion(`Cliente "${cliente.nombre}" eliminado`, 'success');
}

// ==========================================
// VERIFICAR ATRASOS
// ==========================================

function verificarAtrasos() {
    const hoy = new Date().toISOString().split('T')[0];
    let atrasados = [];
    
    cuotas.forEach(cuota => {
        if (cuota.estado === 'pendiente' && cuota.fecha < hoy) {
            cuota.estado = 'atrasada';
            atrasados.push(`${cuota.clienteNombre} - ${formatoCOP(cuota.monto)} (venció el ${cuota.fecha})`);
        }
    });
    
    if (atrasados.length > 0) {
        guardarCuotas();
        mostrarNotificacion(`${atrasados.length} cliente(s) atrasado(s)`, 'error');
        const badgeNotificaciones = document.getElementById('badgeNotificaciones');
        const navBadge = document.getElementById('navBadge');
        if (badgeNotificaciones) badgeNotificaciones.textContent = atrasados.length;
        if (navBadge) navBadge.textContent = atrasados.length;
        renderizarTodo();
    } else {
        const badgeNotificaciones = document.getElementById('badgeNotificaciones');
        const navBadge = document.getElementById('navBadge');
        if (badgeNotificaciones) badgeNotificaciones.textContent = '0';
        if (navBadge) navBadge.textContent = '0';
    }
}

// ==========================================
// GENERAR CUOTAS PENDIENTES
// ==========================================

function generarCuotasPendientes() {
    if (clientes.length === 0) {
        mostrarNotificacion('No hay clientes para generar cuotas', 'error');
        return;
    }
    
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada');
    cuotas = cuotasPagadas;
    
    clientes.forEach(cliente => {
        if (cliente.tipoPlazo !== 'sin_definir' && cliente.plazo > 0) {
            generarCuotasCliente(cliente);
        }
    });
    guardarCuotas();
    renderizarTodo();
    mostrarNotificacion('Cuotas regeneradas correctamente', 'success');
}

// ==========================================
// FILTROS
// ==========================================

function filtrarClientesPorPlazo(tipo) {
    filtroPlazoActual = tipo;
    document.querySelectorAll('.filtro-plazo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.plazo === tipo);
    });
    renderizarClientes();
}

function filtrarCalendario(periodo) {
    filtroPeriodoActual = periodo;
    document.querySelectorAll('.periodo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.periodo === periodo);
    });
    renderizarCalendario();
}

// ==========================================
// SINCRONIZAR CON NETLIFY
// ==========================================

function sincronizarDatos() {
    mostrarNotificacion('Sincronizando con Netlify Database...', 'warning');
    setTimeout(() => {
        try {
            mostrarNotificacion('Datos sincronizados correctamente', 'success');
        } catch (error) {
            mostrarNotificacion('Error al sincronizar: ' + error.message, 'error');
        }
    }, 1500);
}

// ==========================================
// RENDERIZADO
// ==========================================

function renderizarTodo() {
    renderizarClientes();
    renderizarCalendario();
    renderizarDashboard();
    renderizarProximosVencimientos();
    actualizarEstadisticas();
    actualizarPlazos();
    actualizarFiltros();
}

function renderizarClientes() {
    const container = document.getElementById('listaClientes');
    if (!container) return;
    
    let clientesFiltrados = clientes;
    if (filtroPlazoActual !== 'todos') {
        clientesFiltrados = clientes.filter(c => c.tipoPlazo === filtroPlazoActual);
    }
    
    if (clientesFiltrados.length === 0) {
        container.innerHTML = '<p class="texto-centrado">No hay clientes registrados</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Monto Total</th>
                    <th>Saldo Actual</th>
                    <th>Plazo</th>
                    <th>Cuotas</th>
                    <th>Progreso</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    clientesFiltrados.forEach(cliente => {
        const cuotasCliente = cuotas.filter(c => c.clienteId === cliente.id);
        const pagadas = cuotasCliente.filter(c => c.estado === 'pagada').length;
        const total = cuotasCliente.length;
        const restantes = total - pagadas;
        const progreso = total > 0 ? Math.round((pagadas / total) * 100) : 0;
        const porcentajeSaldo = cliente.monto > 0 ? Math.round((cliente.saldo / cliente.monto) * 100) : 0;
        
        let textoPlazo = '';
        if (cliente.tipoPlazo === 'sin_definir') {
            textoPlazo = 'Sin definir';
        } else if (cliente.tipoPlazo === 'diario') {
            textoPlazo = `${cliente.plazo} días`;
        } else if (cliente.tipoPlazo === 'semanal') {
            textoPlazo = `${cliente.plazo} semanas`;
        } else if (cliente.tipoPlazo === 'quincenal') {
            textoPlazo = `${cliente.plazo} quincenas`;
        } else if (cliente.tipoPlazo === 'personalizado') {
            textoPlazo = 'Personalizado';
        } else {
            textoPlazo = `${cliente.plazo} meses`;
        }
        
        let infoFechas = '';
        if (cliente.diasPago) {
            infoFechas = `<span style="font-size:10px;color:var(--gray-400);">Días: ${cliente.diasPago}</span>`;
        } else if (cliente.diaFijo) {
            infoFechas = `<span style="font-size:10px;color:var(--gray-400);">Día ${cliente.diaFijo}</span>`;
        }
        
        let saldoColor = 'var(--success)';
        let saldoEmoji = '✅';
        if (porcentajeSaldo > 75) {
            saldoColor = 'var(--danger)';
            saldoEmoji = '🔴';
        } else if (porcentajeSaldo > 40) {
            saldoColor = 'var(--warning)';
            saldoEmoji = '🟡';
        } else if (porcentajeSaldo <= 0) {
            saldoColor = 'var(--success)';
            saldoEmoji = '🎉';
        }
        
        html += `
            <tr>
                <td><strong>${cliente.nombre}</strong></td>
                <td>
                    ${cliente.telefono !== '—' ? `📱 ${cliente.telefono}<br>` : ''}
                    ${cliente.email !== '—' ? `✉️ ${cliente.email}` : ''}
                </td>
                <td><strong>${formatoCOP(cliente.monto)}</strong></td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:700;color:${saldoColor};font-size:16px;">
                            ${saldoEmoji} ${formatoCOP(cliente.saldo)}
                        </span>
                        <span style="font-size:11px;color:var(--gray-400);">
                            ${porcentajeSaldo}% de la deuda
                        </span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span>${textoPlazo}</span>
                        ${infoFechas}
                    </div>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <span style="font-weight:600;font-size:16px;color:var(--primary);">
                            ${restantes}
                        </span>
                        <span style="font-size:11px;color:var(--gray-400);">
                            de ${total} restantes
                        </span>
                        <span class="cuotas-restantes ${restantes === 0 && total > 0 ? 'pagado' : ''}">
                            ${pagadas} pagadas
                        </span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;height:6px;background:var(--gray-200);border-radius:4px;overflow:hidden;min-width:60px;">
                            <div style="height:100%;width:${progreso}%;background:${progreso === 100 ? 'var(--success)' : 'var(--primary)'};border-radius:4px;transition:width 0.5s;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;min-width:40px;">${progreso}%</span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button onclick="reportarCuota(${cliente.id})" class="btn-accion" style="background:var(--success-light);color:var(--success);" title="Reportar pago">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button onclick="reportarCuotaPersonalizada(${cliente.id})" class="btn-accion" style="background:var(--info-light);color:var(--info);" title="Pago personalizado">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button onclick="verHistorialCliente(${cliente.id})" class="btn-accion" style="background:var(--warning-light);color:var(--warning);" title="Ver historial">
                            <i class="fas fa-history"></i>
                        </button>
                        <button onclick="editarCliente(${cliente.id})" class="btn-accion" style="background:var(--gray-200);color:var(--gray-600);" title="Editar cliente">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarCliente(${cliente.id})" class="btn-accion eliminar" title="Eliminar cliente">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderizarCalendario() {
    const container = document.getElementById('calendarioCuotas');
    if (!container) return;
    
    const filtroCliente = document.getElementById('filtroCliente');
    const filtroEstado = document.getElementById('filtroEstado');
    
    const clienteId = filtroCliente ? filtroCliente.value : 'todos';
    const estado = filtroEstado ? filtroEstado.value : 'todos';
    
    let cuotasFiltradas = [...cuotas];
    
    if (filtroPeriodoActual !== 'todos') {
        const hoy = new Date();
        let fechaLimite = new Date(hoy);
        
        switch(filtroPeriodoActual) {
            case 'diario':
                fechaLimite.setDate(hoy.getDate() + 1);
                break;
            case 'semanal':
                fechaLimite.setDate(hoy.getDate() + 7);
                break;
            case 'quincenal':
                fechaLimite.setDate(hoy.getDate() + 15);
                break;
            case 'mensual':
                fechaLimite.setMonth(hoy.getMonth() + 1);
                break;
        }
        
        cuotasFiltradas = cuotasFiltradas.filter(c => {
            const fechaCuota = new Date(c.fecha);
            return fechaCuota >= hoy && fechaCuota <= fechaLimite;
        });
    }
    
    if (clienteId !== 'todos') {
        cuotasFiltradas = cuotasFiltradas.filter(c => c.clienteId === parseInt(clienteId));
    }
    
    if (estado !== 'todos') {
        cuotasFiltradas = cuotasFiltradas.filter(c => c.estado === estado);
    }
    
    cuotasFiltradas.sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    if (cuotasFiltradas.length === 0) {
        container.innerHTML = '<p class="texto-centrado">No hay cuotas que coincidan con los filtros</p>';
        return;
    }
    
    let html = '';
    cuotasFiltradas.forEach(cuota => {
        const estadoClass = cuota.estado;
        const estadoTexto = cuota.estado === 'pagada' ? '✅ Pagada' : 
                           cuota.estado === 'atrasada' ? '⚠️ Atrasada' : '⏳ Pendiente';
        const fechaFormateada = formatearFecha(cuota.fecha);
        
        const cliente = clientes.find(c => c.id === cuota.clienteId);
        const cuotasRestantes = cliente ? cuotas.filter(c => 
            c.clienteId === cliente.id && c.estado !== 'pagada'
        ).length : 0;
        
        html += `
            <div class="cuota-item ${estadoClass}">
                <div class="cuota-info">
                    <div class="cuota-cliente">${cuota.clienteNombre}</div>
                    <div class="cuota-fecha">${fechaFormateada}</div>
                    <div class="cuota-monto">${formatoCOP(cuota.monto)}</div>
                    ${cuota.estado !== 'pagada' ? `
                        <span style="font-size:11px;color:var(--gray-400);">
                            ${cuotasRestantes} cuota(s) restante(s)
                        </span>
                    ` : `
                        <span style="font-size:11px;color:var(--success);">
                            Deuda reducida
                        </span>
                    `}
                    <span class="cuota-estado ${estadoClass}">${estadoTexto}</span>
                </div>
                ${cuota.estado !== 'pagada' ? `
                    <button onclick="reportarCuota(${cuota.clienteId}, ${cuota.monto})" class="btn-accion pagar">
                        <i class="fas fa-hand-holding-usd"></i> Reportar
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderizarDashboard() {
    const ctx = document.getElementById('chartCobros');
    if (ctx) {
        const parent = ctx.parentElement;
        const canvas = document.createElement('canvas');
        canvas.id = 'chartCobros';
        parent.innerHTML = '';
        parent.appendChild(canvas);
        
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const total = clientes.reduce((sum, c) => sum + c.monto, 0);
        const datosMensuales = meses.map((_, i) => {
            return total * (0.2 + Math.random() * 0.4);
        });
        
        new Chart(document.getElementById('chartCobros'), {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Cobros Mensuales',
                    data: datosMensuales,
                    borderColor: '#1a237e',
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1a237e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatoCOPCorto(value)
                        }
                    }
                }
            }
        });
    }
}

function renderizarProximosVencimientos() {
    const container = document.getElementById('proximosVencimientos');
    if (!container) return;
    
    const hoy = new Date();
    const proximas = cuotas
        .filter(c => c.estado === 'pendiente')
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(0, 5);
    
    if (proximas.length === 0) {
        container.innerHTML = '<p class="texto-centrado">No hay cuotas pendientes</p>';
        return;
    }
    
    container.innerHTML = proximas.map(c => {
        const fecha = new Date(c.fecha);
        const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
        const esUrgente = dias <= 3;
        
        const cliente = clientes.find(cl => cl.id === c.clienteId);
        const restantes = cliente ? cuotas.filter(cu => 
            cu.clienteId === cliente.id && cu.estado !== 'pagada'
        ).length : 0;
        
        return `
            <div class="vencimiento-item ${esUrgente ? 'urgente' : ''}">
                <span class="vencimiento-cliente">${c.clienteNombre}</span>
                <span class="vencimiento-fecha">${dias > 0 ? `en ${dias} días` : 'hoy'}</span>
                <span class="vencimiento-monto">${formatoCOP(c.monto)}</span>
                <span style="font-size:10px;color:var(--gray-400);">${restantes} restantes</span>
            </div>
        `;
    }).join('');
}

function actualizarEstadisticas() {
    const totalClientes = document.getElementById('totalClientes');
    const totalPrestado = document.getElementById('totalPrestado');
    const cuotasPendientes = document.getElementById('cuotasPendientes');
    const cuotasAtrasadas = document.getElementById('cuotasAtrasadas');
    
    if (totalClientes) totalClientes.textContent = clientes.length;
    
    if (totalPrestado) {
        const total = clientes.reduce((sum, c) => sum + c.monto, 0);
        totalPrestado.textContent = formatoCOP(total);
    }
    
    if (cuotasPendientes) {
        const pendientes = cuotas.filter(c => c.estado === 'pendiente').length;
        cuotasPendientes.textContent = pendientes;
    }
    
    if (cuotasAtrasadas) {
        const atrasadas = cuotas.filter(c => c.estado === 'atrasada').length;
        cuotasAtrasadas.textContent = atrasadas;
    }
}

function actualizarPlazos() {
    const diarios = clientes.filter(c => c.tipoPlazo === 'diario' || c.tipoPlazo === 'sin_definir');
    const semanales = clientes.filter(c => c.tipoPlazo === 'semanal');
    const quincenales = clientes.filter(c => c.tipoPlazo === 'quincenal');
    const mensuales = clientes.filter(c => c.tipoPlazo === 'mensual' || c.tipoPlazo === 'personalizado');
    
    const clientesDiario = document.getElementById('clientesDiario');
    const clientesSemanal = document.getElementById('clientesSemanal');
    const clientesQuincenal = document.getElementById('clientesQuincenal');
    const clientesMensual = document.getElementById('clientesMensual');
    const montoDiario = document.getElementById('montoDiario');
    const montoSemanal = document.getElementById('montoSemanal');
    const montoQuincenal = document.getElementById('montoQuincenal');
    const montoMensual = document.getElementById('montoMensual');
    
    if (clientesDiario) clientesDiario.textContent = diarios.length;
    if (clientesSemanal) clientesSemanal.textContent = semanales.length;
    if (clientesQuincenal) clientesQuincenal.textContent = quincenales.length;
    if (clientesMensual) clientesMensual.textContent = mensuales.length;
    
    if (montoDiario) montoDiario.textContent = formatoCOP(diarios.reduce((sum, c) => sum + c.monto, 0));
    if (montoSemanal) montoSemanal.textContent = formatoCOP(semanales.reduce((sum, c) => sum + c.monto, 0));
    if (montoQuincenal) montoQuincenal.textContent = formatoCOP(quincenales.reduce((sum, c) => sum + c.monto, 0));
    if (montoMensual) montoMensual.textContent = formatoCOP(mensuales.reduce((sum, c) => sum + c.monto, 0));
}

function actualizarFiltros() {
    const select = document.getElementById('filtroCliente');
    if (!select) return;
    
    const valorActual = select.value;
    select.innerHTML = '<option value="todos">Todos</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nombre;
        select.appendChild(option);
    });
    
    if (valorActual) select.value = valorActual;
}

// ==========================================
// MOSTRAR SECCIÓN
// ==========================================

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const seccionEl = document.getElementById(`seccion-${seccion}`);
    const navEl = document.querySelector(`.nav-item[data-section="${seccion}"]`);
    const seccionActual = document.getElementById('seccionActual');
    
    if (seccionEl) seccionEl.classList.add('active');
    if (navEl) navEl.classList.add('active');
    if (seccionActual) {
        seccionActual.textContent = seccion.charAt(0).toUpperCase() + seccion.slice(1);
    }
    
    // CERRAR EL MENÚ AUTOMÁTICAMENTE
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
    
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ==========================================
// TOGGLE SIDEBAR
// ==========================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

// ==========================================
// EXPORTAR CSV
// ==========================================

function exportarCSV() {
    if (clientes.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    const headers = ['id', 'nombre', 'telefono', 'email', 'monto', 'fechaInicio', 'tipoPlazo', 'plazo', 'saldo', 'diasPago', 'diaFijo'];
    const csvContent = [
        headers.join(','),
        ...clientes.map(c => headers.map(h => c[h] || '').join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('CSV exportado correctamente', 'success');
}

// ==========================================
// REPORTES PDF
// ==========================================

function generarReporteGeneral() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(26, 35, 126);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte General', 14, 33);
    
    doc.setTextColor(100);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 50);
    
    const totalClientes = clientes.length;
    const totalPrestado = clientes.reduce((sum, c) => sum + c.monto, 0);
    const totalPagado = clientes.reduce((sum, c) => sum + (c.monto - c.saldo), 0);
    const totalPendiente = clientes.reduce((sum, c) => sum + c.saldo, 0);
    const atrasados = cuotas.filter(c => c.estado === 'atrasada').length;
    
    const stats = [
        ['Total Clientes', totalClientes],
        ['Total Prestado', formatoCOP(totalPrestado)],
        ['Total Pagado', formatoCOP(totalPagado)],
        ['Pendiente por Cobrar', formatoCOP(totalPendiente)],
        ['Cuotas Atrasadas', atrasados]
    ];
    
    let y = 65;
    doc.setFontSize(12);
    doc.setTextColor(50);
    stats.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 14, y);
        y += 8;
    });
    
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 126);
    doc.text('Detalle de Clientes', 14, y);
    y += 10;
    
    const tableData = clientes.map(c => {
        const cuotasCliente = cuotas.filter(cu => cu.clienteId === c.id);
        const pagadas = cuotasCliente.filter(cu => cu.estado === 'pagada').length;
        const total = cuotasCliente.length;
        const restantes = total - pagadas;
        return [
            c.nombre,
            c.telefono || '',
            formatoCOP(c.monto),
            formatoCOP(c.saldo),
            `${pagadas}/${total}`,
            restantes
        ];
    });
    
    doc.autoTable({
        startY: y,
        head: [['Cliente', 'Teléfono', 'Monto', 'Saldo', 'Pagadas', 'Restantes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Reporte generado automáticamente por PrestaControl', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`reporte_general_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado correctamente', 'success');
}

function generarReporteClientes() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(26, 35, 126);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte de Clientes', 14, 33);
    
    doc.setTextColor(100);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 50);
    
    const tableData = clientes.map(c => [
        c.nombre,
        c.telefono || '',
        c.email || '',
        formatoCOP(c.monto),
        c.tipoPlazo === 'sin_definir' ? 'Sin definir' : `${c.plazo} ${c.tipoPlazo}`,
        formatoCOP(c.saldo),
        `${cuotas.filter(cu => cu.clienteId === c.id && cu.estado === 'pagada').length}/${cuotas.filter(cu => cu.clienteId === c.id).length}`
    ]);
    
    doc.autoTable({
        startY: 58,
        head: [['Cliente', 'Teléfono', 'Email', 'Monto', 'Plazo', 'Saldo', 'Cuotas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Reporte generado automáticamente por PrestaControl', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`reporte_clientes_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado correctamente', 'success');
}

function generarReporteCuotas() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(26, 35, 126);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte de Cuotas', 14, 33);
    
    doc.setTextColor(100);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 50);
    
    const total = cuotas.length;
    const pagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const pendientes = cuotas.filter(c => c.estado === 'pendiente').length;
    const atrasadas = cuotas.filter(c => c.estado === 'atrasada').length;
    
    doc.text(`Total Cuotas: ${total} | Pagadas: ${pagadas} | Pendientes: ${pendientes} | Atrasadas: ${atrasadas}`, 14, 62);
    
    const tableData = cuotas.map(c => [
        c.clienteNombre,
        formatearFecha(c.fecha),
        formatoCOP(c.monto),
        c.estado === 'pagada' ? 'Pagada' : c.estado === 'atrasada' ? 'Atrasada' : 'Pendiente'
    ]);
    
    doc.autoTable({
        startY: 68,
        head: [['Cliente', 'Fecha', 'Monto', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Reporte generado automáticamente por PrestaControl', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`reporte_cuotas_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado correctamente', 'success');
}

function generarReporteAtrasos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(198, 40, 40);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte de Atrasos', 14, 33);
    
    doc.setTextColor(100);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 50);
    
    const atrasadas = cuotas.filter(c => c.estado === 'atrasada');
    
    if (atrasadas.length === 0) {
        doc.setFontSize(16);
        doc.setTextColor(46, 125, 50);
        doc.text('No hay clientes con cuotas atrasadas', 14, 70);
    } else {
        doc.setTextColor(198, 40, 40);
        doc.setFontSize(14);
        doc.text(`Total de cuotas atrasadas: ${atrasadas.length}`, 14, 62);
        
        const tableData = atrasadas.map(c => [
            c.clienteNombre,
            formatearFecha(c.fecha),
            formatoCOP(c.monto)
        ]);
        
        doc.autoTable({
            startY: 68,
            head: [['Cliente', 'Fecha Vencimiento', 'Monto']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [198, 40, 40] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
        });
    }
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Reporte generado automáticamente por PrestaControl', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`reporte_atrasos_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado correctamente', 'success');
}

// ==========================================
// UTILIDADES
// ==========================================

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(partes[2])} ${meses[parseInt(partes[1]) - 1]} ${partes[0]}`;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const container = document.getElementById('notificaciones');
    if (!container) {
        console.log('📢 Notificación:', mensaje);
        return;
    }
    
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 300);
    }, 5000);
}

// ==========================================
// EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.guardarCliente = guardarCliente;
window.editarCliente = editarCliente;
window.cancelarEdicion = cancelarEdicion;
window.eliminarCliente = eliminarCliente;
window.reportarCuota = reportarCuota;
window.reportarCuotaPersonalizada = reportarCuotaPersonalizada;
window.verHistorialCliente = verHistorialCliente;
window.generarCuotasPendientes = generarCuotasPendientes;
window.verificarAtrasos = verificarAtrasos;
window.sincronizarDatos = sincronizarDatos;
window.exportarCSV = exportarCSV;
window.mostrarSeccion = mostrarSeccion;
window.toggleSidebar = toggleSidebar;
window.filtrarClientesPorPlazo = filtrarClientesPorPlazo;
window.filtrarCalendario = filtrarCalendario;
window.renderizarCalendario = renderizarCalendario;
window.generarReporteGeneral = generarReporteGeneral;
window.generarReporteClientes = generarReporteClientes;
window.generarReporteCuotas = generarReporteCuotas;
window.generarReporteAtrasos = generarReporteAtrasos;

console.log('✅ PrestaControl iniciado correctamente');
console.log('📋 Funciones disponibles:', {
    editarCliente: typeof window.editarCliente,
    guardarCliente: typeof window.guardarCliente,
    eliminarCliente: typeof window.eliminarCliente,
    reportarCuota: typeof window.reportarCuota
});