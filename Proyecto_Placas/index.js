class LineaArchivo {
    constructor(line) {
      const partes = line.split(/\s+/);
      this.part = partes[0];
      this.type = partes[1];
      this.outline = partes[2];
      // Convertir las coordenadas a punto flotante sin usar replace
      this.posicionX = partes[3] ? parseFloat(partes[3].replaceAll(',', '.')) : null;
      this.posicionY = partes[4] ? parseFloat(partes[4].replaceAll(',', '.')) : null;
      this.rotation = partes[5] ? parseFloat(partes[5]) : null;
    }
  }
  
  const fs = require('fs');
  
  fs.readFile('production1.txt', 'utf-8', (err, data) => {
    if(err) {
      console.log('Error al leer el archivo:', err);
    } else {
      // Separar el contenido del archivo en líneas y recorrer cada línea
      data.split(/\r?\n/).forEach(line =>  {
        // Crear una instancia de la clase LineaArchivo para cada línea del archivo
        const lineaObjeto = new LineaArchivo(line);
        // Imprimir los atributos de la línea
        console.log(lineaObjeto);
      });
    }
  });
  