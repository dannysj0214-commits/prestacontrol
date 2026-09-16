import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  
  // GET - Listar todas las cuotas
  if (req.method === "GET") {
    const cuotas = await db.sql`SELECT * FROM cuotas ORDER BY fecha ASC`;
    return Response.json({ cuotas });
  }
  
  // POST - Crear cuota
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const result = await db.sql`
        INSERT INTO cuotas (cliente_id, cliente_nombre, fecha, monto, estado)
        VALUES (${body.clienteId}, ${body.clienteNombre}, ${body.fecha}, ${body.monto}, ${body.estado || 'pendiente'})
        RETURNING *
      `;
      return Response.json({ cuota: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // PUT - Actualizar cuota (marcar como pagada)
  if (req.method === "PUT") {
    try {
      const body = await req.json();
      const result = await db.sql`
        UPDATE cuotas SET
          estado = ${body.estado || 'pagada'},
          fecha_pago = ${body.fechaPago},
          monto_pagado = ${body.montoPagado}
        WHERE id = ${body.id}
        RETURNING *
      `;
      return Response.json({ cuota: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // DELETE - Eliminar cuotas de un cliente
  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const clienteId = url.searchParams.get("clienteId");
    await db.sql`DELETE FROM cuotas WHERE cliente_id = ${clienteId}`;
    return Response.json({ success: true });
  }
  
  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/cuotas"
};