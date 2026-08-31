const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const puerto = 3000;

// Configuración de middlewares
app.use(cors()); // Permite que tu HTML se comunique con este servidor
app.use(express.json()); // Permite leer los datos enviados en formato JSON

// --- 1. CONEXIÓN A LA BASE DE DATOS SQLITE ---
const db = new sqlite3.Database('./cafeteria.db', (err) => {
    if (err) {
        console.error("Error conectando a SQLite:", err.message);
    } else {
        console.log('Conectado exitosamente a la base de datos SQLite.');
    }
});

// --- 2. CREACIÓN DE LA TABLA (SI NO EXISTE) ---
db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    cliente TEXT,
    destino TEXT,
    pago TEXT,
    productos TEXT,
    total REAL
)`, (err) => {
    if (err) {
        console.error("Error creando la tabla:", err.message);
    }
});

// --- 3. RUTAS DEL SERVIDOR (API) ---

// GET: Obtener todos los pedidos para el historial
app.get('/api/pedidos', (req, res) => {
    const sql = "SELECT * FROM pedidos";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST: Guardar un pedido nuevo cuando el cliente finaliza la compra
app.post('/api/pedidos', (req, res) => {
    const { id, cliente, destino, pago, productos, total } = req.body;
    
    const sql = `INSERT INTO pedidos (id, cliente, destino, pago, productos, total) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [id, cliente, destino, pago, productos, total], function(err) {
        if (err) {
            console.error("Error al guardar:", err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ mensaje: "Pedido guardado con éxito", idPedido: id });
    });
});

// DELETE: Eliminar un pedido usando el botón del historial
app.delete('/api/pedidos/:id', (req, res) => {
    const idPedido = req.params.id; 

    const sql = `DELETE FROM pedidos WHERE id = ?`;

    db.run(sql, [idPedido], function(err) {
        if (err) {
            console.error("Error al eliminar en la BD:", err.message);
            return res.status(500).json({ error: "Error al borrar el pedido" });
        }
        
        if (this.changes > 0) {
            res.json({ mensaje: "Pedido eliminado con éxito" });
        } else {
            res.status(404).json({ error: "No se encontró un pedido con ese ID" });
        }
    });
});

// --- 4. INICIAR EL SERVIDOR ---
app.listen(puerto, () => {
    console.log(`🚀 Servidor de Cafetería corriendo en http://localhost:${puerto}`);
});