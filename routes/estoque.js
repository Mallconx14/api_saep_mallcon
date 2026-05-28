const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
}); 

router.get('/categoria', (req, res) => {
    db.query('SELECT categoria, SUM(quantidade * valor_unidade) AS total_categoria FROM produtos GROUP BY categoria', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
}); 

router.get('/decrescente', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY dt DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
}); 

router.post('/cadastrar', (req, res) => {
    const { nome, quantidade, valor_unidade, categoria } = req.body;
    db.query('INSERT INTO produtos (nome, quantidade, valor_unidade, categoria) VALUES (?, ?, ?, ?)', [nome, quantidade, valor_unidade, categoria], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao inserir informações', err});
        } else {
            res.json(results);
        }
    });
});

router.post('/porcentagem', (req, res) => {
    
    const limiteMaximo = req.body.limite_maximo || 100;
    
    const limiteMinimo = req.body.limite_minimo ?? 0;

    const sql = `
        SELECT 
            id, 
            nome, 
            quantidade, 
            categoria,
            ROUND((quantidade / ?) * 100, 2) AS percentual_atingido
        FROM produtos
        WHERE quantidade <= ? 
           OR quantidade >= ?
    `;

    // A execução no banco também continua idêntica
    db.query(sql, [limiteMaximo, limiteMinimo, limiteMaximo], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar o relatório de estoque' });
        } else {
            res.json({
                filtros_aplicados: {
                    minimo: limiteMinimo,
                    maximo: limiteMaximo
                },
                produtos_no_limite: results
            });
        }
    });
});

router.post('/registro', (req, res) => {
    const { dt, tipo, quantidade, id_produtos } = req.body;
    db.query('INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos) VALUES (?, ?, ?, ?)', [dt, tipo, quantidade, id_produtos], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao inserir informações', err});
        } else {
            res.json(results);
        }
    });
});


module.exports = router;