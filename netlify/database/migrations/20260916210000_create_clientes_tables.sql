-- Tabla de Clientes 
CREATE TABLE IF NOT EXISTS clientes ( 
    id BIGSERIAL PRIMARY KEY, 
    nombre VARCHAR(255) NOT NULL, 
    telefono VARCHAR(50), 
    email VARCHAR(255), 
    monto DECIMAL(15, 2) NOT NULL, 
    interes DECIMAL(5, 2) DEFAULT 0, 
    monto_total DECIMAL(15, 2), 
    interes_total DECIMAL(15, 2), 
    fecha_inicio DATE NOT NULL, 
    tipo_plazo VARCHAR(50), 
    plazo INTEGER DEFAULT 0, 
    saldo DECIMAL(15, 2), 
    dias_pago VARCHAR(100), 
    dia_fijo INTEGER, 
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW() 
); 
 
CREATE TABLE IF NOT EXISTS cuotas ( 
    id BIGSERIAL PRIMARY KEY, 
    cliente_id BIGINT REFERENCES clientes(id) ON DELETE CASCADE, 
    cliente_nombre VARCHAR(255), 
    fecha DATE NOT NULL, 
    monto DECIMAL(15, 2) NOT NULL, 
    estado VARCHAR(50) DEFAULT 'pendiente', 
    fecha_pago DATE, 
    monto_pagado DECIMAL(15, 2), 
    created_at TIMESTAMP DEFAULT NOW() 
); 
 
CREATE TABLE IF NOT EXISTS pagos ( 
    id BIGSERIAL PRIMARY KEY, 
    cliente_id BIGINT REFERENCES clientes(id) ON DELETE CASCADE, 
    cliente_nombre VARCHAR(255), 
    monto DECIMAL(15, 2) NOT NULL, 
    fecha DATE NOT NULL, 
    hora VARCHAR(20), 
    nota TEXT, 
    saldo_anterior DECIMAL(15, 2), 
    saldo_restante DECIMAL(15, 2), 
    editado BOOLEAN DEFAULT FALSE, 
    fecha_edicion TIMESTAMP, 
    created_at TIMESTAMP DEFAULT NOW() 
); 
