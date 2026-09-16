import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  
  // GET - Listar todos los pagos
  if (req.method === "GET") {
    const pagos = await db.sql`SELECT * FROM pagos ORDER BY id DESC`;
    return Response.json({ pagos });
  }
  
  // POST - Registrar un pago nuevo
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const result = await db.sql`
        INSERT INTO pagos (
          cliente_id, cliente_nombre, monto, fecha, hora, nota, 
          saldo_anterior, saldo_restante
        )
        VALUES (
          ${body.clienteId}, ${body.clienteNombre}, ${body.monto}, 
          ${body.fecha}, ${body.hora}, ${body.nota}, 
          ${body.saldoAnterior}, ${body.saldoRestante}
        )
        RETURNING *
      `;
      return Response.json({ pago: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // PUT - Editar un pago
  if (req.method === "PUT") {
    try {
      const body = await req.json();
      const result = await db.sql`
        UPDATE pagos SET
          monto = ${body.monto},
          fecha = ${body.fecha},
          nota = ${body.nota},
          saldo_restante = ${body.saldoRestante},
          editado = TRUE,
          fecha_edicion = NOW()
        WHERE id = ${body.id}
        RETURNING *
      `;
      return Response.json({ pago: result[0] });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
  
  // DELETE - Eliminar un pago
  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    await db.sql`DELETE FROM pagos WHERE id = ${id}`;
    return Response.json({ success: true });
  }
  
  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/pagos"
};