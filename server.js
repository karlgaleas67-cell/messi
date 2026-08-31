const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const puerto = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors()); // Permite que tu HTML se comunique con este servidor
app.use(express.json()); // Permite leer los datos enviados en formato JSON

// --- 1. CONEXIÓN A LA BASE DE DATOS SQLITE ---
const db = new Database('./cafeteria.db');
console.log('Conectado exitosamente a la base de datos SQLite.');

// --- 2. CREACIÓN DE LA TABLA (SI NO EXISTE) ---
db.exec(`CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    cliente TEXT,
    destino TEXT,
    pago TEXT,
    productos TEXT,
    total REAL
)`);

// --- 3. RUTAS DEL SERVIDOR (API) ---

// GET: Obtener todos los pedidos para el historial
app.get('/api/pedidos', (req, res) => {
    try {
        const sql = "SELECT * FROM pedidos";
        const rows = db.prepare(sql).all();
        res.json(rows);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST: Guardar un pedido nuevo cuando el cliente finaliza la compra
app.post('/api/pedidos', (req, res) => {
    const { id, cliente, destino, pago, productos, total } = req.body;
    
    try {
        const sql = `INSERT INTO pedidos (id, cliente, destino, pago, productos, total) VALUES (?, ?, ?, ?, ?, ?)`;
        db.prepare(sql).run(id, cliente, destino, pago, productos, total);
        res.json({ mensaje: "Pedido guardado con éxito", idPedido: id });
    } catch (err) {
        console.error("Error al guardar:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// DELETE: Eliminar un pedido usando el botón del historial
app.delete('/api/pedidos/:id', (req, res) => {
    const idPedido = req.params.id; 

    try {
        const sql = `DELETE FROM pedidos WHERE id = ?`;
        const resultado = db.prepare(sql).run(idPedido);

        if (resultado.changes > 0) {
            res.json({ mensaje: "Pedido eliminado con éxito" });
        } else {
            res.status(404).json({ error: "No se encontró un pedido con ese ID" });
        }
    } catch (err) {
        console.error("Error al eliminar en la BD:", err.message);
        res.status(500).json({ error: "Error al borrar el pedido" });
    }
});

// --- 4. INICIAR EL SERVIDOR ---
app.listen(puerto, () => {
    console.log(`🚀 Servidor de Cafetería corriendo en el puerto ${puerto}`);
});
