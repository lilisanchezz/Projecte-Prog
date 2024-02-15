
class Component {
  static fromTxt(line) {
    const partes = line.split(/\s+/);
    const f = partes[5] === 'F';
    const r = parseFloat((f ? partes[6] : partes[5]));
    return new Component(
      partes[0],
      partes[1], 
      partes[2], 
      partes[3] ? parseFloat(partes[3].replaceAll(',', '.')) : null,
      partes[4] ? parseFloat(partes[4].replaceAll(',', '.')) : null,
      f,
      r
    )
  }
  constructor(part, type, outline, x, y, flip, rotation) {
    this.part = part;
    this.type = type;
    this.outline = outline;
    this.x = x;
    this.y = y;
    this.flip = flip;
    /**
     * @type {number}
     */
    this.rotation = rotation;
  }
}

const fs = require('fs');


try {
  const dades = parseTxt(fs.readFileSync('production1.txt').toString())
  console.log(toTxt(dades))
} catch(e) {
  console.log('error al leer el archivo');
  console.log(e);
}


function parseTxt(data) {
  const components = [];
  let init = false;
  for(const line of data.split(/\r?\n/)) {
    if(line === '.PARTS'){
      init = true; 
      continue;
    }
    if(!init) continue;
    if(line === '.ENDPARTS'){
      break;
    }
    const component = Component.fromTxt(line); 
    components.push(component);
  }
  return components;
}

const endline = '\r\n';
/**
 * @param {Component[]} components 
 */
function toTxt(components) {
  let fitxer = '';
  fitxer = '.PARTS' + endline;
  function space(num, txt) {
    const len = txt.length;
    const nspace = num - len;
    let str = txt;
    for(let i = 0; i < nspace; i++) str+= ' ';
    return str;
  }
  for(const component of components){
    let linea = '';
    linea += space(7, component.part);
    linea += space(29, component.type);
    linea += space(24, component.outline);
    linea += space(10, component.x + '');
    linea += space(8, component.y + '');
    linea += space(2, component.flip ? 'F' : '');
    linea += component.rotation.toFixed(2) + endline;
    fitxer += linea;
  }
  fitxer += '.ENDPARTS' + endline;
  return fitxer;
}
/**
 * @param {Component[]} components 
 */
function toASQ(components) {
  let file = '';
  for(const component of components) {
    let line = '';
    

  }
}