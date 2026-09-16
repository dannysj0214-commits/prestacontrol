import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  
  // GET - Listar todos los clientes
  if (req.method === "GET") {
    const clientes = await db.sql`SELECT * FROM clientes ORDER BY id DESC`;
    return Response.json({ clientes });
  }
  
  // POST - Crear un cliente nuevo
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const result = await db.sql`
        INSERT INTO clientes (
          nombre, telefono, email, monto, interes, monto_total, 
          interes_total, fecha_inicio, tipo_plazo, plazo, saldo, 
          dias_pago, dia_fijo
        )
        VALUES (
          ${body.nombre}, ${body.telefono}, ${body.email}, ${body.monto}, 
          ${body.interes}, ${body.montoTotal}, ${body.interesTotal}, 
          ${body.fechaInicio}, ${body.tipoPlazo}, ${body.plazo}, 
          ${body.saldo}, ${body.diasPago}, ${body.diaFijo}
        )
        RETURNING *
      `;
      return Response.json({ cliente: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // PUT - Editar un cliente
  if (req.method === "PUT") {
    try {
      const body = await req.json();
      const result = await db.sql`
        UPDATE clientes SET
          nombre = ${body.nombre},
          telefono = ${body.telefono},
          email = ${body.email},
          monto = ${body.monto},
          interes = ${body.interes},
          monto_total = ${body.montoTotal},
          interes_total = ${body.interesTotal},
          fecha_inicio = ${body.fechaInicio},
          tipo_plazo = ${body.tipoPlazo},
          plazo = ${body.plazo},
          saldo = ${body.saldo},
          dias_pago = ${body.diasPago},
          dia_fijo = ${body.diaFijo},
          updated_at = NOW()
        WHERE id = ${body.id}
        RETURNING *
      `;
      return Response.json({ cliente: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // DELETE - Eliminar un cliente
  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    await db.sql`DELETE FROM clientes WHERE id = ${id}`;
    return Response.json({ success: true });
  }
  
  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/clientes"
};