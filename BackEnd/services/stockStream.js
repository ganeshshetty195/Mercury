const clients = new Set();

function stockStreamHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
    res.end();
  });
}

function broadcastStockUpdate(payload) {
  const data = `event: stock\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const res of clients) {
    res.write(data);
  }
}

module.exports = {
  stockStreamHandler,
  broadcastStockUpdate,
};

