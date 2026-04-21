import { useEffect } from 'react';

export function useStockStream(onStockUpdate) {
  useEffect(() => {
    const es = new EventSource('/api/stream/stock');

    es.addEventListener('stock', (event) => {
      const payload = JSON.parse(event.data);
      console.log("payload",payload)
      onStockUpdate?.(payload);
    });

    es.onerror = () => {
      console.log('SSE connection issue');
    };

    return () => {
      es.close();
    };
  }, [onStockUpdate]);
}