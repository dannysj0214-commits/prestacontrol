// ==========================================
// PRESTACONTROL - SISTEMA COMPLETO
// CON NETLIFY DATABASE (SINCRONIZADO)
// ==========================================

let clientes = [];
let cuotas = [];
let historialPagos = [];
let filtroPlazoActual = 'todos';
let filtroPeriodoActual = 'diario';

// ==========================================
// FORMATO COP
// ==========================================

function formatoCOP(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) return '$ 0';
    const numero = Math.round(valor);
    const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${conPuntos}`;
}

function formatoCOPCorto(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) return '$0';
    const numero = Math.round(valor);
    const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${conPuntos}`;
}

// ==========================================
// CÁLCULO DE INTERESES
// ==========================================

function calcularInteres(capital, tasa, plazo, tipoPlazo) {
    if (!tasa || tasa <= 0 || !plazo || plazo <= 0) {
        return {
            capital: capital,
            tasa: 0,
            interesTotal: 0,
            montoTotal: capital,
            cuotaMensual: capital / (plazo || 1)
        };
    }
    
    let periodos = plazo;
    if (tipoPlazo === 'diario') periodos = plazo / 30;
    else if (tipoPlazo === 'semanal') periodos = plazo / 4;
    else if (tipoPlazo === 'quincenal') periodos = plazo / 2;
    
    const interesTotal = capital * (tasa / 100) * periodos;
    const montoTotal = capital + interesTotal;
    
    return {
        capital: capital,
        tasa: tasa,
        periodos: periodos,
        interesTotal: interesTotal,
        montoTotal: montoTotal,
        cuotaMensual: montoTotal / plazo
    };
}

// ==========================================
// DATOS INICIALES
// ==========================================

function getClientesIniciales() {
    return [
        { nombre: 'Omar', telefono: '', email: '', monto: 3800000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 3800000, diasPago: '', diaFijo: '' },
        { nombre: 'Daniela', telefono: '', email: '', monto: 1400000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 1400000, diasPago: '', diaFijo: '' },
        { nombre: 'Juanchi', telefono: '', email: '', monto: 450000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'mensual', saldo: 450000, diasPago: '', diaFijo: '' },
        { nombre: 'Lorena Yanez', telefono: '', email: '', monto: 2000000, interes: 5, fechaInicio: '2026-01-01', plazo: 2, tipoPlazo: 'quincenal', saldo: 2000000, diasPago: '16,31', diaFijo: '' },
        { nombre: 'Charo Yanez', telefono: '', email: '', monto: 300000, interes: 3, fechaInicio: '2026-01-01', plazo: 180, tipoPlazo: 'quincenal', saldo: 300000, diasPago: '05,20', diaFijo: '' },
        { nombre: 'Edinzon', telefono: '', email: '', monto: 300000, interes: 20, fechaInicio: '2026-01-01', plazo: 60, tipoPlazo: 'mensual', saldo: 300000, diasPago: '', diaFijo: '28' },
        { nombre: 'Margarita Cotorra', telefono: '', email: '', monto: 500000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 500000, diasPago: '', diaFijo: '' },
        { nombre: 'Señor 26 Papi', telefono: '', email: '', monto: 300000, interes: 20, fechaInicio: '2026-01-01', plazo: 60, tipoPlazo: 'mensual', saldo: 300000, diasPago: '', diaFijo: '26' },
        { nombre: 'Señor Mecanico', telefono: '', email: '', monto: 200000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'semanal', saldo: 200000, diasPago: '', diaFijo: '' },
        { nombre: 'Primo Mecanico', telefono: '', email: '', monto: 150000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'semanal', saldo: 150000, diasPago: '', diaFijo: '' },
        { nombre: 'Claudia German', telefono: '', email: '', monto: 1000000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 1000000, diasPago: '', diaFijo: '' },
        { nombre: 'Rosmira', telefono: '', email: '', monto: 700000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 700000, diasPago: '', diaFijo: '' },
        { nombre: 'Juanchi Nequi', telefono: '', email: '', monto: 300000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 300000, diasPago: '', diaFijo: '' },
        { nombre: 'Yulieth', telefono: '', email: '', monto: 200000, interes: 0, fechaInicio: '2026-01-01', plazo: 0, tipoPlazo: 'sin_definir', saldo: 200000, diasPago: '', diaFijo: '' }
    ];
}

// ==========================================
// API - BASE DE DATOS
// ==========================================

async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text();
        console.error(`Error GET ${url}:`, res.status, text);
        throw new Error(`GET ${url} failed: ${res.status}`);
    }
    return await res.json();
}

async function apiPost(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Error POST ${url}:`, res.status, text);
        throw new Error(`POST ${url} failed: ${res.status}`);
    }
    return await res.json();
}

async function apiPut(url, data) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Error PUT ${url}:`, res.status, text);
        throw new Error(`PUT ${url} failed: ${res.status}`);
    }
    return await res.json();
}

async function apiDelete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
        console.error(`Error DELETE ${url}:`, res.status);
        throw new Error(`DELETE ${url} failed: ${res.status}`);
    }
    return await res.json();
}

// ==========================================
// CONVERSIÓN DE DATOS (BD <-> JS)
// ==========================================

function clienteDesdeBD(c) {
    return {
        id: parseInt(c.id),
        nombre: c.nombre,
        telefono: c.telefono || '',
        email: c.email || '',
        monto: parseFloat(c.monto) || 0,
        interes: parseFloat(c.interes) || 0,
        montoTotal: parseFloat(c.monto_total) || parseFloat(c.monto) || 0,
        interesTotal: parseFloat(c.interes_total) || 0,
        fechaInicio: c.fecha_inicio ? String(c.fecha_inicio).split('T')[0] : '',
        tipoPlazo: c.tipo_plazo || 'sin_definir',
        plazo: parseInt(c.plazo) || 0,
        saldo: parseFloat(c.saldo) || 0,
        diasPago: c.dias_pago || '',
        diaFijo: c.dia_fijo || ''
    };
}

function clienteParaBD(c) {
    return {
        nombre: c.nombre,
        telefono: c.telefono || '',
        email: c.email || '',
        monto: c.monto,
        interes: c.interes || 0,
        montoTotal: c.montoTotal || c.monto,
        interesTotal: c.interesTotal || 0,
        fechaInicio: c.fechaInicio,
        tipoPlazo: c.tipoPlazo,
        plazo: c.plazo || 0,
        saldo: c.saldo || c.monto,
        diasPago: c.diasPago || '',
        diaFijo: c.diaFijo || null
    };
}

function cuotaDesdeBD(c) {
    return {
        id: parseInt(c.id),
        clienteId: parseInt(c.cliente_id),
        clienteNombre: c.cliente_nombre,
        fecha: c.fecha ? String(c.fecha).split('T')[0] : '',
        monto: parseFloat(c.monto) || 0,
        estado: c.estado || 'pendiente',
        fechaPago: c.fecha_pago ? String(c.fecha_pago).split('T')[0] : null,
        montoPagado: parseFloat(c.monto_pagado) || 0
    };
}

function pagoDesdeBD(p) {
    return {
        id: parseInt(p.id),
        clienteId: parseInt(p.cliente_id),
        clienteNombre: p.cliente_nombre,
        monto: parseFloat(p.monto) || 0,
        fecha: p.fecha ? String(p.fecha).split('T')[0] : '',
        hora: p.hora || '',
        nota: p.nota || '',
        saldoAnterior: parseFloat(p.saldo_anterior) || 0,
        saldoRestante: parseFloat(p.saldo_restante) || 0,
        editado: p.editado || false
    };
}

// ==========================================
// CARGA DE DATOS DESDE LA NUBE
// ==========================================

async function cargarDatosLocales() {
    try {
        console.log('🔄 Cargando datos desde Netlify Database...');
        
        const dataClientes = await apiGet('/api/clientes');
        clientes = (dataClientes.clientes || []).map(clienteDesdeBD);
        
        const dataCuotas = await apiGet('/api/cuotas');
        cuotas = (dataCuotas.cuotas || []).map(cuotaDesdeBD);
        
        const dataPagos = await apiGet('/api/pagos');
        historialPagos = (dataPagos.pagos || []).map(pagoDesdeBD);
        
        if (clientes.length === 0) {
            console.log('⚠️ Base de datos vacía. Cargando clientes iniciales...');
            const iniciales = getClientesIniciales();
            for (const cli of iniciales) {
                try {
                    const resultado = await apiPost('/api/clientes', clienteParaBD(cli));
                    if (resultado.cliente) {
                        const nuevoCliente = clienteDesdeBD(resultado.cliente);
                        clientes.push(nuevoCliente);
                        
                        if (nuevoCliente.tipoPlazo !== 'sin_definir' && nuevoCliente.plazo > 0) {
                            await generarCuotasEnBD(nuevoCliente);
                        }
                    }
                } catch (e) {
                    console.error('Error creando cliente inicial:', e);
                }
            }
            const dataCuotas2 = await apiGet('/api/cuotas');
            cuotas = (dataCuotas2.cuotas || []).map(cuotaDesdeBD);
        }
        
        console.log(`✅ Datos cargados: ${clientes.length} clientes, ${cuotas.length} cuotas, ${historialPagos.length} pagos`);
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        mostrarNotificacion('Error al conectar con la base de datos', 'error');
    }
}

// ==========================================
// GENERAR CUOTAS EN BD
// ==========================================

async function generarCuotasEnBD(cliente) {
    if (cliente.tipoPlazo === 'sin_definir' || cliente.plazo <= 0) return;
    
    let montoTotal = cliente.monto;
    if (cliente.interes && cliente.interes > 0) {
        const resultado = calcularInteres(cliente.monto, cliente.interes, cliente.plazo, cliente.tipoPlazo);
        montoTotal = resultado.montoTotal;
    }
    
    const cuotaMensual = montoTotal / cliente.plazo;
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
                    if (i > 1 && diaIndex === 0) fechaCuota.setMonth(fechaCuota.getMonth() + 1);
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
                    if (i > 1 && diaIndex === 0) fechaCuota.setMonth(fechaCuota.getMonth() + 1);
                } else {
                    fechaCuota.setMonth(fechaCuota.getMonth() + i);
                }
                break;
        }
        
        const fechaCuotaStr = fechaCuota.toISOString().split('T')[0];
        
        try {
            await apiPost('/api/cuotas', {
                clienteId: cliente.id,
                clienteNombre: cliente.nombre,
                fecha: fechaCuotaStr,
                monto: parseFloat(cuotaMensual.toFixed(2)),
                estado: 'pendiente'
            });
        } catch (e) {
            console.error('Error creando cuota:', e);
        }
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    await cargarDatosLocales();
    renderizarTodo();
    
    const fechaInicio = document.getElementById('fechaInicio');
    if (fechaInicio) fechaInicio.value = new Date().toISOString().split('T')[0];
    
    const pagoFecha = document.getElementById('pagoFecha');
    if (pagoFecha) pagoFecha.value = new Date().toISOString().split('T')[0];
    
    const formCliente = document.getElementById('formCliente');
    if (formCliente) formCliente.addEventListener('submit', guardarCliente);
    
    const formPago = document.getElementById('formPago');
    if (formPago) formPago.addEventListener('submit', registrarPago);
    
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
                campoPersonalizado.style.display = 
                    (this.value === 'personalizado' || this.value === 'quincenal') ? 'grid' : 'none';
            }
        });
    }
    
    const montoInput = document.getElementById('monto');
    const interesInput = document.getElementById('interes');
    const plazoInput = document.getElementById('plazo');
    const tipoPlazoSelect = document.getElementById('tipoPlazo');
    
    function previsualizarInteres() {
        const capital = parseFloat(montoInput?.value) || 0;
        const tasa = parseFloat(interesInput?.value) || 0;
        const plazo = parseInt(plazoInput?.value) || 0;
        const tipo = tipoPlazoSelect?.value || 'mensual';
        
        const previewEl = document.getElementById('previewInteres');
        if (!previewEl) return;
        
        if (capital > 0 && tasa > 0 && plazo > 0) {
            const resultado = calcularInteres(capital, tasa, plazo, tipo);
            previewEl.innerHTML = `
                <div style="background:#e8f5e9;padding:8px 12px;border-radius:8px;font-size:12px;line-height:1.6;">
                    <strong style="color:#2e7d32;">Previsualización</strong><br>
                    <span>Capital: ${formatoCOP(capital)}</span><br>
                    <span>Interés: ${tasa}%</span><br>
                    <span style="color:#2e7d32;font-weight:600;">Ganancia: ${formatoCOP(resultado.interesTotal)}</span><br>
                    <span style="color:#1a237e;font-weight:700;">Total a cobrar: ${formatoCOP(resultado.montoTotal)}</span>
                </div>
            `;
        } else {
            previewEl.innerHTML = '';
        }
    }
    
    if (montoInput) montoInput.addEventListener('input', previsualizarInteres);
    if (interesInput) interesInput.addEventListener('input', previsualizarInteres);
    if (plazoInput) plazoInput.addEventListener('input', previsualizarInteres);
    if (tipoPlazoSelect) tipoPlazoSelect.addEventListener('change', previsualizarInteres);
    
    // Verificar atrasos UNA SOLA VEZ al cargar
    setTimeout(verificarAtrasos, 2000);
});

// ==========================================
// FUNCIONES DE GUARDADO (YA NO USAN LOCALSTORAGE)
// ==========================================

function guardarClientes() {
    actualizarEstadisticas();
    actualizarPlazos();
}

function guardarCuotas() {
    actualizarEstadisticas();
}

function guardarHistorial() {
    // Los pagos se guardan directamente
}

// ==========================================
// REGISTRAR PAGO
// ==========================================

async function registrarPago(event) {
    event.preventDefault();
    
    const clienteId = parseInt(document.getElementById('pagoCliente').value);
    const monto = parseFloat(document.getElementById('pagoMonto').value);
    const fecha = document.getElementById('pagoFecha').value;
    const nota = document.getElementById('pagoNota')?.value || '';
    
    if (!clienteId || !monto || !fecha) {
        mostrarNotificacion('Completa todos los campos', 'error');
        return;
    }
    
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        return;
    }
    
    if (monto > cliente.saldo) {
        mostrarNotificacion(`El monto (${formatoCOP(monto)}) supera el saldo (${formatoCOP(cliente.saldo)})`, 'error');
        return;
    }
    
    const saldoAnterior = cliente.saldo;
    const saldoRestante = cliente.saldo - monto;
    
    try {
        const resultado = await apiPost('/api/pagos', {
            clienteId: cliente.id,
            clienteNombre: cliente.nombre,
            monto: monto,
            fecha: fecha,
            hora: new Date().toLocaleTimeString('es-ES'),
            nota: nota,
            saldoAnterior: saldoAnterior,
            saldoRestante: saldoRestante
        });
        
        if (resultado.pago) {
            historialPagos.unshift(pagoDesdeBD(resultado.pago));
        }
        
        cliente.saldo = saldoRestante;
        await apiPut('/api/clientes', { ...clienteParaBD(cliente), id: cliente.id });
        
        const cuotaPendiente = cuotas
            .filter(c => c.clienteId === clienteId && c.estado !== 'pagada')
            .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
        
        if (cuotaPendiente) {
            try {
                await apiPut('/api/cuotas', {
                    id: cuotaPendiente.id,
                    estado: 'pagada',
                    fechaPago: fecha,
                    montoPagado: monto
                });
                cuotaPendiente.estado = 'pagada';
                cuotaPendiente.fechaPago = fecha;
                cuotaPendiente.montoPagado = monto;
            } catch (e) {
                console.error('Error marcando cuota:', e);
            }
        }
        
        const cuotasRestantes = cuotas.filter(c => c.clienteId === cliente.id && c.estado !== 'pagada').length;
        const cuotasPagadas = cuotas.filter(c => c.clienteId === cliente.id && c.estado === 'pagada').length;
        
        let mensaje = `Pago registrado\n`;
        mensaje += `Cliente: ${cliente.nombre}\n`;
        mensaje += `Monto: ${formatoCOP(monto)}\n`;
        mensaje += `Saldo restante: ${formatoCOP(cliente.saldo)}\n`;
        mensaje += `Cuotas: ${cuotasPagadas} pagadas, ${cuotasRestantes} restantes`;
        
        mostrarNotificacion(mensaje, 'success');
        
        if (cliente.saldo <= 0) {
            mostrarNotificacion(`¡${cliente.nombre} ha saldado su deuda!`, 'success');
        }
        
        document.getElementById('formPago').reset();
        document.getElementById('pagoFecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('infoPagoCliente').style.display = 'none';
        
        renderizarTodo();
        
    } catch (error) {
        console.error('Error registrando pago:', error);
        mostrarNotificacion('Error al registrar pago', 'error');
    }
}

// ==========================================
// ACTUALIZAR INFO DEL PAGO
// ==========================================

function actualizarInfoPago() {
    const clienteId = parseInt(document.getElementById('pagoCliente').value);
    const infoDiv = document.getElementById('infoPagoCliente');
    
    if (!clienteId || !infoDiv) {
        if (infoDiv) infoDiv.style.display = 'none';
        return;
    }
    
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
        infoDiv.style.display = 'none';
        return;
    }
    
    const cuotasCliente = cuotas.filter(c => c.clienteId === cliente.id);
    const pagadas = cuotasCliente.filter(c => c.estado === 'pagada').length;
    const restantes = cuotasCliente.length - pagadas;
    
    let ganancia = 0;
    let montoTotal = cliente.monto;
    if (cliente.interes > 0 && cliente.plazo > 0 && cliente.tipoPlazo !== 'sin_definir') {
        const resultado = calcularInteres(cliente.monto, cliente.interes, cliente.plazo, cliente.tipoPlazo);
        ganancia = resultado.interesTotal;
        montoTotal = resultado.montoTotal;
    }
    
    const pagado = montoTotal - cliente.saldo;
    const gananciaRealizada = montoTotal > 0 ? (pagado / montoTotal) * ganancia : 0;
    
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div style="font-weight:600;color:var(--primary);margin-bottom:10px;">
            <i class="fas fa-user"></i> ${cliente.nombre}
        </div>
        <div class="info-pago-grid">
            <div class="info-pago-item">
                <span class="info-pago-label">Capital</span>
                <span class="info-pago-valor">${formatoCOP(cliente.monto)}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Interés</span>
                <span class="info-pago-valor">${cliente.interes > 0 ? cliente.interes + '%' : '—'}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Total a Cobrar</span>
                <span class="info-pago-valor">${formatoCOP(montoTotal)}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Saldo Actual</span>
                <span class="info-pago-valor" style="color:var(--warning);">${formatoCOP(cliente.saldo)}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Cuotas Pagadas</span>
                <span class="info-pago-valor" style="color:var(--success);">${pagadas}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Cuotas Restantes</span>
                <span class="info-pago-valor" style="color:var(--danger);">${restantes}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Ganancia Total</span>
                <span class="info-pago-valor" style="color:var(--success);">${formatoCOP(ganancia)}</span>
            </div>
            <div class="info-pago-item">
                <span class="info-pago-label">Ganancia Realizada</span>
                <span class="info-pago-valor" style="color:#6a1b9a;">${formatoCOP(gananciaRealizada)}</span>
            </div>
        </div>
    `;
    
    const proximaCuota = cuotas
        .filter(c => c.clienteId === clienteId && c.estado !== 'pagada')
        .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    
    if (proximaCuota) {
        const montoInput = document.getElementById('pagoMonto');
        if (montoInput && !montoInput.value) {
            montoInput.value = Math.round(proximaCuota.monto);
        }
    }
}

// ==========================================
// RENDERIZAR RESUMEN POR CLIENTE
// ==========================================

function renderizarResumenPorCliente() {
    const container = document.getElementById('resumenPorCliente');
    if (!container) return;
    
    if (clientes.length === 0) {
        container.innerHTML = '<p class="texto-centrado">No hay clientes</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Total a Cobrar</th>
                    <th>Total Pagado</th>
                    <th>Saldo Actual</th>
                    <th>Ganancia Total</th>
                    <th>Ganancia Realizada</th>
                    <th>Cuotas</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    clientes.forEach(cliente => {
        const cuotasCliente = cuotas.filter(c => c.clienteId === cliente.id);
        const pagadas = cuotasCliente.filter(c => c.estado === 'pagada').length;
        const total = cuotasCliente.length;
        const restantes = total - pagadas;
        
        let ganancia = 0;
        let montoTotal = cliente.monto;
        if (cliente.interes > 0 && cliente.plazo > 0 && cliente.tipoPlazo !== 'sin_definir') {
            const resultado = calcularInteres(cliente.monto, cliente.interes, cliente.plazo, cliente.tipoPlazo);
            ganancia = resultado.interesTotal;
            montoTotal = resultado.montoTotal;
        }
        
        const pagado = montoTotal - cliente.saldo;
        const gananciaRealizada = montoTotal > 0 ? (pagado / montoTotal) * ganancia : 0;
        
        html += `
            <tr>
                <td><strong>${cliente.nombre}</strong></td>
                <td>${formatoCOP(cliente.monto)}</td>
                <td>
                    <span style="background:${cliente.interes > 0 ? '#e8f5e9' : '#f0f0f0'};color:${cliente.interes > 0 ? '#2e7d32' : '#999'};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">
                        ${cliente.interes > 0 ? cliente.interes + '%' : '—'}
                    </span>
                </td>
                <td><strong>${formatoCOP(montoTotal)}</strong></td>
                <td style="color:var(--success);font-weight:600;">${formatoCOP(pagado)}</td>
                <td style="color:var(--warning);font-weight:600;">${formatoCOP(cliente.saldo)}</td>
                <td style="color:#2e7d32;font-weight:600;">${formatoCOP(ganancia)}</td>
                <td style="color:#6a1b9a;font-weight:600;">${formatoCOP(gananciaRealizada)}</td>
                <td>
                    <div style="display:flex;flex-direction:column;align-items:center;font-size:12px;">
                        <span style="font-weight:600;color:var(--success);">${pagadas} pagadas</span>
                        <span style="color:var(--gray-400);">${restantes} restantes</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ==========================================
// RENDERIZAR HISTORIAL DE PAGOS
// ==========================================

function renderizarHistorialPagos() {
    const container = document.getElementById('historialPagos');
    if (!container) return;
    
    const filtroCliente = document.getElementById('filtroHistorialCliente');
    const clienteId = filtroCliente ? filtroCliente.value : 'todos';
    
    let pagos = [...historialPagos];
    if (clienteId !== 'todos') {
        pagos = pagos.filter(p => p.clienteId === parseInt(clienteId));
    }
    
    pagos.sort((a, b) => b.id - a.id);
    
    if (pagos.length === 0) {
        container.innerHTML = '<p class="texto-centrado">No hay pagos registrados</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto Pagado</th>
                    <th>Saldo Anterior</th>
                    <th>Saldo Restante</th>
                    <th>Nota</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    pagos.forEach(pago => {
        const editado = pago.editado ? 
            '<span style="font-size:10px;color:#e65100;background:#fff3e0;padding:2px 6px;border-radius:8px;margin-left:4px;">EDITADO</span>' : '';
        
        html += `
            <tr>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <strong>${formatearFecha(pago.fecha)}</strong>
                        <span style="font-size:11px;color:var(--gray-400);">${pago.hora || ''}</span>
                        ${editado}
                    </div>
                </td>
                <td><strong>${pago.clienteNombre}</strong></td>
                <td style="color:var(--success);font-weight:700;">+${formatoCOP(pago.monto)}</td>
                <td style="color:var(--gray-500);">${formatoCOP(pago.saldoAnterior || 0)}</td>
                <td style="color:var(--warning);font-weight:600;">${formatoCOP(pago.saldoRestante)}</td>
                <td style="font-size:12px;color:var(--gray-400);">${pago.nota || '—'}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button onclick="editarPago(${pago.id})" class="btn-accion" style="background:var(--info-light);color:var(--info);" title="Editar pago">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarPago(${pago.id})" class="btn-accion eliminar" title="Eliminar pago">
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

// ==========================================
// EDITAR PAGO
// ==========================================

async function editarPago(pagoId) {
    const pago = historialPagos.find(p => p.id === pagoId);
    if (!pago) {
        mostrarNotificacion('Pago no encontrado', 'error');
        return;
    }
    
    const cliente = clientes.find(c => c.id === pago.clienteId);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        return;
    }
    
    const nuevoMontoInput = prompt(
        `EDITAR PAGO\n\n` +
        `Cliente: ${pago.clienteNombre}\n` +
        `Monto actual: ${formatoCOP(pago.monto)}\n` +
        `Fecha: ${formatearFecha(pago.fecha)}\n\n` +
        `Ingresa el NUEVO monto:`,
        Math.round(pago.monto)
    );
    
    if (nuevoMontoInput === null) return;
    
    const nuevoMonto = parseFloat(nuevoMontoInput.replace(/[^0-9.]/g, ''));
    if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
        mostrarNotificacion('Monto inválido', 'error');
        return;
    }
    
    const nuevaFecha = prompt(`Nueva fecha (AAAA-MM-DD):`, pago.fecha);
    if (nuevaFecha === null) return;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) {
        mostrarNotificacion('Formato de fecha inválido', 'error');
        return;
    }
    
    const nuevaNota = prompt(`Nueva nota (opcional):`, pago.nota || '');
    if (nuevaNota === null) return;
    
    const diferenciaMonto = nuevoMonto - pago.monto;
    const saldoDisponible = cliente.saldo + pago.monto;
    
    if (nuevoMonto > saldoDisponible) {
        mostrarNotificacion(`El monto (${formatoCOP(nuevoMonto)}) supera el disponible (${formatoCOP(saldoDisponible)})`, 'error');
        return;
    }
    
    try {
        await apiPut('/api/pagos', {
            id: pago.id,
            monto: nuevoMonto,
            fecha: nuevaFecha,
            nota: nuevaNota,
            saldoRestante: pago.saldoAnterior - nuevoMonto
        });
        
        cliente.saldo = parseFloat((cliente.saldo - diferenciaMonto).toFixed(2));
        await apiPut('/api/clientes', { ...clienteParaBD(cliente), id: cliente.id });
        
        pago.monto = nuevoMonto;
        pago.fecha = nuevaFecha;
        pago.nota = nuevaNota;
        pago.saldoRestante = pago.saldoAnterior - nuevoMonto;
        pago.editado = true;
        
        mostrarNotificacion(`Pago actualizado correctamente`, 'success');
        renderizarTodo();
        
    } catch (error) {
        console.error('Error editando pago:', error);
        mostrarNotificacion('Error al editar pago', 'error');
    }
}

// ==========================================
// ELIMINAR PAGO
// ==========================================

async function eliminarPago(pagoId) {
    const pago = historialPagos.find(p => p.id === pagoId);
    if (!pago) {
        mostrarNotificacion('Pago no encontrado', 'error');
        return;
    }
    
    const cliente = clientes.find(c => c.id === pago.clienteId);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        return;
    }
    
    if (!confirm(
        `¿ELIMINAR ESTE PAGO?\n\n` +
        `Cliente: ${pago.clienteNombre}\n` +
        `Monto: ${formatoCOP(pago.monto)}\n` +
        `Fecha: ${formatearFecha(pago.fecha)}\n\n` +
        `El saldo del cliente se aumentará nuevamente.`
    )) return;
    
    try {
        cliente.saldo = parseFloat((cliente.saldo + pago.monto).toFixed(2));
        await apiPut('/api/clientes', { ...clienteParaBD(cliente), id: cliente.id });
        
        await apiDelete(`/api/pagos?id=${pagoId}`);
        
        historialPagos = historialPagos.filter(p => p.id !== pagoId);
        
        mostrarNotificacion(`Pago eliminado. Saldo actualizado: ${formatoCOP(cliente.saldo)}`, 'success');
        renderizarTodo();
        
    } catch (error) {
        console.error('Error eliminando pago:', error);
        mostrarNotificacion('Error al eliminar pago', 'error');
    }
}

// ==========================================
// ACTUALIZAR SELECTS
// ==========================================

function actualizarSelectsPago() {
    const pagoCliente = document.getElementById('pagoCliente');
    const filtroHistorial = document.getElementById('filtroHistorialCliente');
    
    if (pagoCliente) {
        const valorActual = pagoCliente.value;
        pagoCliente.innerHTML = '<option value="">-- Selecciona un cliente --</option>';
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.nombre} - Saldo: ${formatoCOP(c.saldo)}`;
            pagoCliente.appendChild(option);
        });
        if (valorActual) pagoCliente.value = valorActual;
    }
    
    if (filtroHistorial) {
        const valorActual = filtroHistorial.value;
        filtroHistorial.innerHTML = '<option value="todos">Todos los clientes</option>';
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            filtroHistorial.appendChild(option);
        });
        if (valorActual) filtroHistorial.value = valorActual;
    }
}

// ==========================================
// EDITAR CLIENTE
// ==========================================

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) {
        mostrarNotificacion('Cliente no encontrado', 'error');
        return;
    }
    
    let clienteIdField = document.getElementById('clienteId');
    if (!clienteIdField) {
        clienteIdField = document.createElement('input');
        clienteIdField.type = 'hidden';
        clienteIdField.id = 'clienteId';
        const form = document.getElementById('formCliente');
        if (form) form.appendChild(clienteIdField);
    }
    
    const campos = {
        clienteId: clienteIdField,
        nombre: document.getElementById('nombre'),
        telefono: document.getElementById('telefono'),
        monto: document.getElementById('monto'),
        interes: document.getElementById('interes'),
        fechaInicio: document.getElementById('fechaInicio'),
        tipoPlazo: document.getElementById('tipoPlazo'),
        plazo: document.getElementById('plazo'),
        diasPago: document.getElementById('diasPago'),
        diaFijo: document.getElementById('diaFijo'),
        campoDiasPago: document.getElementById('campoDiasPago'),
        formTitulo: document.getElementById('formTitulo'),
        btnSubmit: document.getElementById('btnSubmit'),
        btnCancelar: document.getElementById('btnCancelar')
    };
    
    if (!campos.nombre || !campos.monto) {
        mostrarNotificacion('Error: Formulario incompleto', 'error');
        return;
    }
    
    try {
        campos.clienteId.value = cliente.id;
        campos.nombre.value = cliente.nombre;
        campos.monto.value = cliente.monto;
        if (campos.interes) campos.interes.value = cliente.interes || 0;
        if (campos.fechaInicio) campos.fechaInicio.value = cliente.fechaInicio;
        if (campos.telefono) campos.telefono.value = cliente.telefono !== '—' ? cliente.telefono : '';
        if (campos.tipoPlazo) campos.tipoPlazo.value = cliente.tipoPlazo;
        if (campos.plazo) campos.plazo.value = cliente.plazo || '';
        if (campos.diasPago) campos.diasPago.value = cliente.diasPago || '';
        if (campos.diaFijo) campos.diaFijo.value = cliente.diaFijo || '';
        
        if (campos.campoDiasPago) {
            campos.campoDiasPago.style.display = 
                (cliente.tipoPlazo === 'personalizado' || cliente.tipoPlazo === 'quincenal') ? 'grid' : 'none';
        }
        
        if (campos.formTitulo) campos.formTitulo.textContent = 'Editar Cliente';
        if (campos.btnSubmit) campos.btnSubmit.innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
        if (campos.btnCancelar) campos.btnCancelar.style.display = 'inline-block';
        
        if (campos.monto) campos.monto.dispatchEvent(new Event('input'));
        
        document.getElementById('seccion-clientes').scrollIntoView({ behavior: 'smooth' });
        mostrarNotificacion(`Editando: ${cliente.nombre}`, 'warning');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar cliente', 'error');
    }
}

function cancelarEdicion() {
    const formCliente = document.getElementById('formCliente');
    const fechaInicio = document.getElementById('fechaInicio');
    const campoDiasPago = document.getElementById('campoDiasPago');
    const formTitulo = document.getElementById('formTitulo');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnCancelar = document.getElementById('btnCancelar');
    const previewInteres = document.getElementById('previewInteres');
    const clienteId = document.getElementById('clienteId');
    
    if (clienteId) clienteId.value = '';
    if (formCliente) formCliente.reset();
    if (fechaInicio) fechaInicio.value = new Date().toISOString().split('T')[0];
    if (campoDiasPago) campoDiasPago.style.display = 'none';
    if (formTitulo) formTitulo.textContent = 'Nuevo Cliente';
    if (btnSubmit) btnSubmit.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Cliente';
    if (btnCancelar) btnCancelar.style.display = 'none';
    if (previewInteres) previewInteres.innerHTML = '';
}

// ==========================================
// GUARDAR CLIENTE (CREAR O EDITAR)
// ==========================================

async function guardarCliente(event) {
    event.preventDefault();
    
    const clienteId = document.getElementById('clienteId');
    const id = clienteId ? clienteId.value : '';
    
    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const monto = document.getElementById('monto');
    const interes = document.getElementById('interes');
    const fechaInicio = document.getElementById('fechaInicio');
    const tipoPlazo = document.getElementById('tipoPlazo');
    const plazo = document.getElementById('plazo');
    const diasPago = document.getElementById('diasPago');
    const diaFijo = document.getElementById('diaFijo');
    const formCliente = document.getElementById('formCliente');
    const campoDiasPago = document.getElementById('campoDiasPago');
    const previewInteres = document.getElementById('previewInteres');
    
    if (!nombre || !monto || !fechaInicio) {
        mostrarNotificacion('Completa todos los campos', 'error');
        return;
    }
    
    const nombreVal = nombre.value.trim();
    const telefonoVal = telefono ? telefono.value.trim() : '';
    const montoVal = parseFloat(monto.value);
    const interesVal = interes ? parseFloat(interes.value) || 0 : 0;
    const fechaInicioVal = fechaInicio.value;
    const tipoPlazoVal = tipoPlazo ? tipoPlazo.value : 'sin_definir';
    const plazoVal = parseInt(plazo ? plazo.value : '0') || 0;
    const diasPagoVal = diasPago ? diasPago.value.trim() : '';
    const diaFijoVal = diaFijo ? diaFijo.value.trim() : '';
    
    if (!nombreVal || !montoVal || !fechaInicioVal) {
        mostrarNotificacion('Completa todos los campos', 'error');
        return;
    }
    
    let montoTotal = montoVal;
    let interesTotal = 0;
    if (interesVal > 0 && plazoVal > 0 && tipoPlazoVal !== 'sin_definir') {
        const resultado = calcularInteres(montoVal, interesVal, plazoVal, tipoPlazoVal);
        montoTotal = resultado.montoTotal;
        interesTotal = resultado.interesTotal;
    }
    
    try {
        if (id) {
            const clienteExistente = clientes.find(c => c.id === parseInt(id));
            if (!clienteExistente) {
                mostrarNotificacion('Cliente no encontrado', 'error');
                return;
            }
            
            const cuotasPagadas = cuotas.filter(c => c.clienteId === clienteExistente.id && c.estado === 'pagada');
            const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.monto, 0);
            
            const clienteActualizado = {
                ...clienteExistente,
                nombre: nombreVal,
                telefono: telefonoVal || '—',
                monto: montoVal,
                interes: interesVal,
                montoTotal: montoTotal,
                interesTotal: interesTotal,
                fechaInicio: fechaInicioVal,
                tipoPlazo: tipoPlazoVal,
                plazo: plazoVal,
                diasPago: diasPagoVal || '',
                diaFijo: diaFijoVal || '',
                saldo: montoTotal - totalPagado
            };
            
            await apiPut('/api/clientes', { ...clienteParaBD(clienteActualizado), id: clienteExistente.id });
            
            Object.assign(clienteExistente, clienteActualizado);
            
            await apiDelete(`/api/cuotas?clienteId=${clienteExistente.id}`);
            cuotas = cuotas.filter(c => c.clienteId !== clienteExistente.id);
            
            if (tipoPlazoVal !== 'sin_definir' && plazoVal > 0) {
                await generarCuotasEnBD(clienteExistente);
                const dataCuotas = await apiGet('/api/cuotas');
                cuotas = (dataCuotas.cuotas || []).map(cuotaDesdeBD);
            }
            
            mostrarNotificacion(`Cliente "${nombreVal}" actualizado`, 'success');
            cancelarEdicion();
            
        } else {
            const nuevoCliente = {
                nombre: nombreVal,
                telefono: telefonoVal || '—',
                email: '',
                monto: montoVal,
                interes: interesVal,
                montoTotal: montoTotal,
                interesTotal: interesTotal,
                fechaInicio: fechaInicioVal,
                tipoPlazo: tipoPlazoVal,
                plazo: plazoVal,
                saldo: montoTotal,
                diasPago: diasPagoVal || '',
                diaFijo: diaFijoVal || ''
            };
            
            const resultado = await apiPost('/api/clientes', clienteParaBD(nuevoCliente));
            
            if (resultado.cliente) {
                const clienteCreado = clienteDesdeBD(resultado.cliente);
                clientes.push(clienteCreado);
                
                if (tipoPlazoVal !== 'sin_definir' && plazoVal > 0) {
                    await generarCuotasEnBD(clienteCreado);
                    const dataCuotas = await apiGet('/api/cuotas');
                    cuotas = (dataCuotas.cuotas || []).map(cuotaDesdeBD);
                }
                
                if (formCliente) formCliente.reset();
                if (fechaInicio) fechaInicio.value = new Date().toISOString().split('T')[0];
                if (campoDiasPago) campoDiasPago.style.display = 'none';
                if (previewInteres) previewInteres.innerHTML = '';
                
                let mensaje = `"${nombreVal}" agregado con ${formatoCOP(montoVal)}`;
                if (interesVal > 0) {
                    mensaje += `\nGanancia: ${formatoCOP(interesTotal)}`;
                    mensaje += `\nTotal a cobrar: ${formatoCOP(montoTotal)}`;
                }
                mostrarNotificacion(mensaje, 'success');
            }
        }
        
        renderizarTodo();
        
    } catch (error) {
        console.error('Error guardando cliente:', error);
        mostrarNotificacion('Error al guardar cliente', 'error');
    }
}

// ==========================================
// REPORTAR CUOTA
// ==========================================

function reportarCuota(clienteId, montoPagar) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    mostrarSeccion('pagos');
    
    setTimeout(() => {
        const select = document.getElementById('pagoCliente');
        if (select) {
            select.value = clienteId;
            actualizarInfoPago();
        }
        if (montoPagar) {
            const montoInput = document.getElementById('pagoMonto');
            if (montoInput) montoInput.value = Math.round(montoPagar);
        }
    }, 100);
}

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
    
    mostrarSeccion('pagos');
    
    setTimeout(() => {
        const select = document.getElementById('pagoCliente');
        const montoField = document.getElementById('pagoMonto');
        if (select) {
            select.value = clienteId;
            actualizarInfoPago();
        }
        if (montoField) montoField.value = Math.round(monto);
    }, 100);
}

// ==========================================
// VER HISTORIAL
// ==========================================

function verHistorialCliente(clienteId) {
    mostrarSeccion('pagos');
    
    setTimeout(() => {
        const filtro = document.getElementById('filtroHistorialCliente');
        if (filtro) {
            filtro.value = clienteId;
            renderizarHistorialPagos();
        }
    }, 100);
}

// ==========================================
// ELIMINAR CLIENTE
// ==========================================

async function eliminarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    if (!confirm(`¿Eliminar a "${cliente.nombre}"?`)) return;
    
    try {
        await apiDelete(`/api/clientes?id=${id}`);
        
        clientes = clientes.filter(c => c.id !== id);
        cuotas = cuotas.filter(c => c.clienteId !== id);
        historialPagos = historialPagos.filter(h => h.clienteId !== id);
        
        renderizarTodo();
        mostrarNotificacion(`Cliente "${cliente.nombre}" eliminado`, 'success');
        
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        mostrarNotificacion('Error al eliminar cliente', 'error');
    }
}

// ==========================================
// VERIFICAR ATRASOS (CORREGIDO - SIN BUCLE)
// ==========================================

async function verificarAtrasos() {
    const hoy = new Date().toISOString().split('T')[0];
    let atrasados = [];
    let cuotasAActualizar = [];
    
    // Identificar cuáles necesitan actualización (SIN hacer PUT todavía)
    for (const cuota of cuotas) {
        if (cuota.estado === 'pendiente' && cuota.fecha < hoy) {
            cuota.estado = 'atrasada';
            atrasados.push(cuota.clienteNombre);
            cuotasAActualizar.push(cuota.id);
        }
    }
    
    // Solo hacer las llamadas a la API si hay algo que actualizar
    if (cuotasAActualizar.length > 0) {
        for (const id of cuotasAActualizar) {
            try {
                await apiPut('/api/cuotas', {
                    id: id,
                    estado: 'atrasada'
                });
            } catch (e) {
                console.error('Error actualizando cuota atrasada:', id, e);
            }
        }
        
        const badge = document.getElementById('badgeNotificaciones');
        const navBadge = document.getElementById('navBadge');
        if (badge) badge.textContent = atrasados.length;
        if (navBadge) navBadge.textContent = atrasados.length;
        
        // Actualizar solo lo necesario (NO renderizarTodo que causa bucle)
        renderizarClientes();
        renderizarCalendario();
        actualizarEstadisticas();
    }
}

// ==========================================
// GENERAR CUOTAS PENDIENTES
// ==========================================

async function generarCuotasPendientes() {
    if (clientes.length === 0) {
        mostrarNotificacion('No hay clientes', 'error');
        return;
    }
    
    if (!confirm('¿Regenerar todas las cuotas? Se perderán las cuotas pagadas.')) return;
    
    try {
        for (const cliente of clientes) {
            await apiDelete(`/api/cuotas?clienteId=${cliente.id}`);
        }
        
        cuotas = [];
        
        for (const cliente of clientes) {
            if (cliente.tipoPlazo !== 'sin_definir' && cliente.plazo > 0) {
                await generarCuotasEnBD(cliente);
            }
        }
        
        const dataCuotas = await apiGet('/api/cuotas');
        cuotas = (dataCuotas.cuotas || []).map(cuotaDesdeBD);
        
        renderizarTodo();
        mostrarNotificacion('Cuotas regeneradas', 'success');
        
    } catch (error) {
        console.error('Error regenerando cuotas:', error);
        mostrarNotificacion('Error al regenerar cuotas', 'error');
    }
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

async function sincronizarDatos() {
    mostrarNotificacion('Sincronizando con la nube...', 'warning');
    await cargarDatosLocales();
    renderizarTodo();
    mostrarNotificacion('Datos sincronizados', 'success');
}

// ==========================================
// RENDERIZADO
// ==========================================

function renderizarTodo() {
    renderizarClientes();
    renderizarCalendario();
    renderizarDashboard();
    renderizarProximosVencimientos();
    renderizarResumenPorCliente();
    renderizarHistorialPagos();
    actualizarEstadisticas();
    actualizarPlazos();
    actualizarFiltros();
    actualizarSelectsPago();
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
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Ganancia</th>
                    <th>Total a Cobrar</th>
                    <th>Saldo Actual</th>
                    <th>Cuotas</th>
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
        
        const tasa = cliente.interes || 0;
        let ganancia = cliente.interesTotal || 0;
        let montoTotal = cliente.montoTotal || cliente.monto;
        
        if (tasa > 0 && cliente.plazo > 0 && cliente.tipoPlazo !== 'sin_definir' && !cliente.interesTotal) {
            const resultado = calcularInteres(cliente.monto, tasa, cliente.plazo, cliente.tipoPlazo);
            ganancia = resultado.interesTotal;
            montoTotal = resultado.montoTotal;
        }
        
        const porcentajeSaldo = montoTotal > 0 ? Math.round((cliente.saldo / montoTotal) * 100) : 0;
        let saldoColor = 'var(--success)';
        if (porcentajeSaldo > 75) saldoColor = 'var(--danger)';
        else if (porcentajeSaldo > 40) saldoColor = 'var(--warning)';
        
        html += `
            <tr>
                <td><strong>${cliente.nombre}</strong></td>
                <td>${formatoCOP(cliente.monto)}</td>
                <td>
                    <span style="background:${tasa > 0 ? '#e8f5e9' : '#f0f0f0'};color:${tasa > 0 ? '#2e7d32' : '#999'};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">
                        ${tasa > 0 ? tasa + '%' : '—'}
                    </span>
                </td>
                <td style="color:#2e7d32;font-weight:600;">${ganancia > 0 ? '+' + formatoCOP(ganancia) : '—'}</td>
                <td><strong style="color:var(--primary);">${formatoCOP(montoTotal)}</strong></td>
                <td>
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:700;color:${saldoColor};">${formatoCOP(cliente.saldo)}</span>
                        <span style="font-size:10px;color:var(--gray-400);">${porcentajeSaldo}%</span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;flex-direction:column;align-items:center;font-size:12px;">
                        <span style="font-weight:600;color:var(--primary);">${restantes} restantes</span>
                        <span style="color:var(--gray-400);">${pagadas} pagadas</span>
                    </div>
                </td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button onclick="reportarCuota(${cliente.id})" class="btn-accion" style="background:var(--success-light);color:var(--success);" title="Reportar pago">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button onclick="verHistorialCliente(${cliente.id})" class="btn-accion" style="background:var(--warning-light);color:var(--warning);" title="Historial">
                            <i class="fas fa-history"></i>
                        </button>
                        <button onclick="editarCliente(${cliente.id})" class="btn-accion" style="background:var(--gray-200);color:var(--gray-600);" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarCliente(${cliente.id})" class="btn-accion eliminar" title="Eliminar">
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
            case 'diario': fechaLimite.setDate(hoy.getDate() + 1); break;
            case 'semanal': fechaLimite.setDate(hoy.getDate() + 7); break;
            case 'quincenal': fechaLimite.setDate(hoy.getDate() + 15); break;
            case 'mensual': fechaLimite.setMonth(hoy.getMonth() + 1); break;
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
        container.innerHTML = '<p class="texto-centrado">No hay cuotas</p>';
        return;
    }
    
    let html = '';
    cuotasFiltradas.forEach(cuota => {
        const estadoClass = cuota.estado;
        const estadoTexto = cuota.estado === 'pagada' ? 'Pagada' : 
                           cuota.estado === 'atrasada' ? 'Atrasada' : 'Pendiente';
        
        html += `
            <div class="cuota-item ${estadoClass}">
                <div class="cuota-info">
                    <div class="cuota-cliente">${cuota.clienteNombre}</div>
                    <div class="cuota-fecha">${formatearFecha(cuota.fecha)}</div>
                    <div class="cuota-monto">${formatoCOP(cuota.monto)}</div>
                    <span class="cuota-estado ${estadoClass}">${estadoTexto}</span>
                </div>
                ${cuota.estado !== 'pagada' ? `
                    <button onclick="reportarCuota(${cuota.clienteId}, ${cuota.monto})" class="btn-accion pagar">
                        <i class="fas fa-check"></i> Pagar
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
        const datosMensuales = meses.map(() => total * (0.2 + Math.random() * 0.4));
        
        new Chart(document.getElementById('chartCobros'), {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Cobros',
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
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => formatoCOPCorto(value) }
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
        
        return `
            <div class="vencimiento-item ${esUrgente ? 'urgente' : ''}">
                <span class="vencimiento-cliente">${c.clienteNombre}</span>
                <span class="vencimiento-fecha">${dias > 0 ? `en ${dias} días` : 'hoy'}</span>
                <span class="vencimiento-monto">${formatoCOP(c.monto)}</span>
            </div>
        `;
    }).join('');
}

// ==========================================
// ESTADÍSTICAS
// ==========================================

function actualizarEstadisticas() {
    const totalClientes = document.getElementById('totalClientes');
    const totalPrestado = document.getElementById('totalPrestado');
    const totalGanancias = document.getElementById('totalGanancias');
    const totalConGanancias = document.getElementById('totalConGanancias');
    const totalCobrado = document.getElementById('totalCobrado');
    const cuotasPendientes = document.getElementById('cuotasPendientes');
    const cuotasAtrasadas = document.getElementById('cuotasAtrasadas');
    
    if (totalClientes) totalClientes.textContent = clientes.length;
    
    const capitalPrestado = clientes.reduce((sum, c) => sum + c.monto, 0);
    
    let gananciasTotales = 0;
    clientes.forEach(cliente => {
        const tasa = cliente.interes || 0;
        if (tasa > 0 && cliente.plazo > 0 && cliente.tipoPlazo !== 'sin_definir') {
            const resultado = calcularInteres(cliente.monto, tasa, cliente.plazo, cliente.tipoPlazo);
            gananciasTotales += resultado.interesTotal;
        }
    });
    
    const capitalConGanancias = capitalPrestado + gananciasTotales;
    const cobrado = historialPagos.reduce((sum, p) => sum + p.monto, 0);
    
    if (totalPrestado) totalPrestado.textContent = formatoCOP(capitalPrestado);
    if (totalGanancias) totalGanancias.textContent = formatoCOP(gananciasTotales);
    if (totalConGanancias) totalConGanancias.textContent = formatoCOP(capitalConGanancias);
    if (totalCobrado) totalCobrado.textContent = formatoCOP(cobrado);
    
    if (cuotasPendientes) {
        cuotasPendientes.textContent = cuotas.filter(c => c.estado === 'pendiente').length;
    }
    
    if (cuotasAtrasadas) {
        cuotasAtrasadas.textContent = cuotas.filter(c => c.estado === 'atrasada').length;
    }
}

function actualizarPlazos() {
    const diarios = clientes.filter(c => c.tipoPlazo === 'diario' || c.tipoPlazo === 'sin_definir');
    const semanales = clientes.filter(c => c.tipoPlazo === 'semanal');
    const quincenales = clientes.filter(c => c.tipoPlazo === 'quincenal');
    const mensuales = clientes.filter(c => c.tipoPlazo === 'mensual' || c.tipoPlazo === 'personalizado');
    
    const elementos = {
        clientesDiario: diarios.length,
        clientesSemanal: semanales.length,
        clientesQuincenal: quincenales.length,
        clientesMensual: mensuales.length,
        montoDiario: formatoCOP(diarios.reduce((sum, c) => sum + c.monto, 0)),
        montoSemanal: formatoCOP(semanales.reduce((sum, c) => sum + c.monto, 0)),
        montoQuincenal: formatoCOP(quincenales.reduce((sum, c) => sum + c.monto, 0)),
        montoMensual: formatoCOP(mensuales.reduce((sum, c) => sum + c.monto, 0))
    };
    
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    });
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
        seccionActual.textContent = seccion === 'pagos' ? 'Registro de Pagos' : 
                                    seccion.charAt(0).toUpperCase() + seccion.slice(1);
    }
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
    
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

// ==========================================
// EXPORTAR
// ==========================================

function exportarCSV() {
    if (clientes.length === 0) {
        mostrarNotificacion('No hay datos', 'error');
        return;
    }
    
    const headers = ['id', 'nombre', 'telefono', 'monto', 'interes', 'montoTotal', 'interesTotal', 'fechaInicio', 'tipoPlazo', 'plazo', 'saldo'];
    const csvContent = [
        headers.join(','),
        ...clientes.map(c => headers.map(h => c[h] || '').join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('CSV exportado', 'success');
}

function exportarHistorialPagos() {
    if (historialPagos.length === 0) {
        mostrarNotificacion('No hay pagos', 'error');
        return;
    }
    
    const headers = ['id', 'clienteNombre', 'monto', 'fecha', 'hora', 'saldoAnterior', 'saldoRestante', 'nota'];
    const csvContent = [
        headers.join(','),
        ...historialPagos.map(p => headers.map(h => p[h] || '').join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_pagos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('Historial exportado', 'success');
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
    
    const capital = clientes.reduce((sum, c) => sum + c.monto, 0);
    let ganancias = 0;
    clientes.forEach(c => {
        if (c.interes > 0 && c.plazo > 0 && c.tipoPlazo !== 'sin_definir') {
            ganancias += calcularInteres(c.monto, c.interes, c.plazo, c.tipoPlazo).interesTotal;
        }
    });
    const cobrado = historialPagos.reduce((sum, p) => sum + p.monto, 0);
    
    let y = 65;
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Total Clientes: ${clientes.length}`, 14, y); y += 8;
    doc.text(`Capital Prestado: ${formatoCOP(capital)}`, 14, y); y += 8;
    doc.text(`Ganancias por Interés: ${formatoCOP(ganancias)}`, 14, y); y += 8;
    doc.text(`Total Cobrado: ${formatoCOP(cobrado)}`, 14, y); y += 8;
    doc.text(`Capital + Ganancias: ${formatoCOP(capital + ganancias)}`, 14, y); y += 8;
    
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 126);
    doc.text('Detalle de Clientes', 14, y); y += 10;
    
    const tableData = clientes.map(c => {
        const cuotasCliente = cuotas.filter(cu => cu.clienteId === c.id);
        const pagadas = cuotasCliente.filter(cu => cu.estado === 'pagada').length;
        let ganancia = 0;
        if (c.interes > 0 && c.plazo > 0 && c.tipoPlazo !== 'sin_definir') {
            ganancia = calcularInteres(c.monto, c.interes, c.plazo, c.tipoPlazo).interesTotal;
        }
        return [
            c.nombre,
            formatoCOP(c.monto),
            c.interes > 0 ? c.interes + '%' : '—',
            formatoCOP(ganancia),
            formatoCOP(c.saldo),
            `${pagadas}/${cuotasCliente.length}`
        ];
    });
    
    doc.autoTable({
        startY: y,
        head: [['Cliente', 'Capital', 'Interés', 'Ganancia', 'Saldo', 'Cuotas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`reporte_general_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
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
    
    const tableData = clientes.map(c => {
        const cuotasCliente = cuotas.filter(cu => cu.clienteId === c.id);
        const pagadas = cuotasCliente.filter(cu => cu.estado === 'pagada').length;
        return [
            c.nombre,
            c.telefono || '',
            formatoCOP(c.monto),
            c.interes > 0 ? c.interes + '%' : '—',
            formatoCOP(c.saldo),
            `${pagadas}/${cuotasCliente.length}`
        ];
    });
    
    doc.autoTable({
        startY: 58,
        head: [['Cliente', 'Teléfono', 'Capital', 'Interés', 'Saldo', 'Cuotas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`reporte_clientes_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
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
    
    const tableData = cuotas.map(c => [
        c.clienteNombre,
        formatearFecha(c.fecha),
        formatoCOP(c.monto),
        c.estado === 'pagada' ? 'Pagada' : c.estado === 'atrasada' ? 'Atrasada' : 'Pendiente'
    ]);
    
    doc.autoTable({
        startY: 58,
        head: [['Cliente', 'Fecha', 'Monto', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`reporte_cuotas_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
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
    
    const atrasadas = cuotas.filter(c => c.estado === 'atrasada');
    
    if (atrasadas.length === 0) {
        doc.setTextColor(46, 125, 50);
        doc.setFontSize(16);
        doc.text('No hay cuotas atrasadas', 14, 70);
    } else {
        const tableData = atrasadas.map(c => [
            c.clienteNombre,
            formatearFecha(c.fecha),
            formatoCOP(c.monto)
        ]);
        
        doc.autoTable({
            startY: 58,
            head: [['Cliente', 'Fecha', 'Monto']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [198, 40, 40] },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
        });
    }
    
    doc.save(`reporte_atrasos_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
}

function generarReporteIntereses() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte de Intereses', 14, 33);
    
    const clientesConInteres = clientes.filter(c => c.interes > 0);
    let gananciasTotales = 0;
    clientesConInteres.forEach(c => {
        gananciasTotales += calcularInteres(c.monto, c.interes, c.plazo, c.tipoPlazo).interesTotal;
    });
    
    doc.setTextColor(50);
    doc.setFontSize(12);
    doc.text(`Clientes con interés: ${clientesConInteres.length}`, 14, 55);
    doc.text(`Ganancias totales: ${formatoCOP(gananciasTotales)}`, 14, 63);
    
    const tableData = clientesConInteres.map(c => {
        const resultado = calcularInteres(c.monto, c.interes, c.plazo, c.tipoPlazo);
        return [
            c.nombre,
            formatoCOP(c.monto),
            c.interes + '%',
            formatoCOP(resultado.interesTotal),
            formatoCOP(resultado.montoTotal)
        ];
    });
    
    doc.autoTable({
        startY: 72,
        head: [['Cliente', 'Capital', 'Interés', 'Ganancia', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`reporte_intereses_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
}

function generarReportePagos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFillColor(106, 27, 154);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('PrestaControl', 14, 25);
    doc.setFontSize(14);
    doc.text('Reporte de Pagos', 14, 33);
    
    doc.setTextColor(100);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 50);
    
    const totalPagos = historialPagos.reduce((sum, p) => sum + p.monto, 0);
    doc.setTextColor(50);
    doc.setFontSize(12);
    doc.text(`Total de pagos: ${historialPagos.length}`, 14, 62);
    doc.text(`Total cobrado: ${formatoCOP(totalPagos)}`, 14, 70);
    
    const tableData = historialPagos.map(p => [
        formatearFecha(p.fecha),
        p.clienteNombre,
        formatoCOP(p.monto),
        formatoCOP(p.saldoRestante)
    ]);
    
    doc.autoTable({
        startY: 78,
        head: [['Fecha', 'Cliente', 'Monto', 'Saldo Restante']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [106, 27, 154] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`reporte_pagos_${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacion('PDF generado', 'success');
}

// ==========================================
// UTILIDADES
// ==========================================

function formatearFecha(fecha) {
    if (!fecha) return '—';
    const partes = String(fecha).split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(partes[2])} ${meses[parseInt(partes[1]) - 1]} ${partes[0]}`;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const container = document.getElementById('notificaciones');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

// ==========================================
// EXPORTAR GLOBALES
// ==========================================

window.guardarCliente = guardarCliente;
window.editarCliente = editarCliente;
window.cancelarEdicion = cancelarEdicion;
window.eliminarCliente = eliminarCliente;
window.reportarCuota = reportarCuota;
window.reportarCuotaPersonalizada = reportarCuotaPersonalizada;
window.verHistorialCliente = verHistorialCliente;
window.registrarPago = registrarPago;
window.actualizarInfoPago = actualizarInfoPago;
window.exportarHistorialPagos = exportarHistorialPagos;
window.renderizarHistorialPagos = renderizarHistorialPagos;
window.editarPago = editarPago;
window.eliminarPago = eliminarPago;
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
window.generarReporteIntereses = generarReporteIntereses;
window.generarReportePagos = generarReportePagos;

console.log('✅ PrestaControl con Netlify Database iniciado');