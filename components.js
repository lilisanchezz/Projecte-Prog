const { ObjectId } = require('mongodb');

class Component {
  static fromJson(json) {
    const arr = [];
    for(const c of json) {
      arr.push(new Component(c.id, c.type, c.outline, c.x, c.y, c.rotation, (c.flip === '1') ))
    }
    return arr;
  }
  static fromTxt(line) {
    const partes = line.split(/\s+/);
    const formatNumber = str => parseFloat(str.replace(/,/, '.'));
    const f = partes[5] === 'F';
    const r = parseFloat((f ? partes[6] : partes[5]));
    return new Component(
      partes[0],
      partes[1], 
      partes[2], 
      formatNumber(Component.dataOrError(partes[3])),
      formatNumber(Component.dataOrError(partes[4])),
      r,
      f
    )
  }
  static dataOrError(str) {
    if(str) return str;
    throw new Error('Invalid data');
  }
  static fromCsv(line){
    const partes = line.split(/,+/);
    const removeQuotes = str => str.replace(/^"/, '').replace(/"$/, '');
    const formatNumber = str => parseFloat(str.replace(/,/, '.'));
    return new Component(
      removeQuotes(Component.dataOrError(partes[0])),
      removeQuotes(Component.dataOrError(partes[1])),
      removeQuotes(Component.dataOrError(partes[2])),
      formatNumber(Component.dataOrError(partes[3])),
      formatNumber(Component.dataOrError(partes[4])),
      formatNumber(Component.dataOrError(partes[5])),
      partes[6]
    )
  }
  constructor(id, type, outline, x, y, rotation, flip) {
    this.id = id;
    this.type = type;
    this.outline = outline;
    this.x = x;
    this.y = y;
    /**
     * @type {number}
     */
    this.rotation = rotation;
    this.flip = flip;
  }
  toString() {
    return JSON.stringify(this);
  }
  static parse(str) {
    const obj = JSON.parse(str);
    return new Component(obj.id, obj.type, obj.outline, obj.x, obj.y, obj.rotation, obj.flip);
  }
}

/**
 * @param {string} file 
 */
function detectType(file) {
  return file.startsWith('.PARTS') ? 'txt' : 'csv';
}

async function saveData (db, name, components){
  const data = {
    name: name,
    components: components.map(v => v.toString())
  }

  await db.insertOne(data)
}

/**
 * @param {import('mongodb').Collection} db
 * @param {string} name 
 * @param {string} file 
 * @returns 
 */
exports.createPlaca = async (db, name, file) => {
  let data;
  const type = detectType(file);
  console.log('TYPE:', type);
  switch(type) {
    case "txt":
      data = parseTxt(file);
      break;
    case "csv":
      data = parseCsv(file);
      break;
  }
  await saveData(db, name, data);

}

exports.getComponentByName = async function (db, name) {
  const data = await db.findOne({ name: name })
  return {
    id: data._id,
    name: data.name,
    components: data.components.map(c => JSON.parse(c))
  } 
}

exports.getComponentById = async function (db, id) {
  const data = await db.findOne({ _id: new ObjectId(id) })
  if(data === null) return;
  return {
    id: data._id,
    name: data.name,
    components: data.components.map(c => JSON.parse(c))
  } 
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


function parseCsv(data){
  const components = [];
  let lineskip = 0;
  for(const line of data.split(/\r?\n/)){
    console.log(line);
    if(2 > lineskip++) continue;
    if(!line){
      break;
    }
    const component = Component.fromCsv(line);
    components.push(component);
  }
  return components;
}

const endline = '\r\n';
/**
 * @param {object[]} json 
 */
exports.toTxt = json => {
  const components = Component.fromJson(json);
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
    linea += space(7, component.id);
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
 * @param {object[]} components 
 */
exports.toASQ = json => {
  const components = Component.fromJson(json);
  let file = '';
  for(const component of components) {
    let line = '';
    line += `#${component.id}#,`;
    line += `${component.x}, `;
    line += `${component.y}, `;
    line += `${component.rotation},#PYX#,##,`;
    line += `#${component.type} ${component.outline} #,1,T,#1#,0,F,#TAPE#,#X#,#A#,##,##,F`;
    line += endline;//falta flip
    file += line;
  }
  file += endline
  return file;
}
/**
 * @param {object[]} components 
 */
exports.toCSV = json => {
  const components = Component.fromJson(json);
  let file = '';
  for(const component of components){
    let line = '';
    line += `${component.id},`;
    line += `1/2,1,`;
    line += `${component.x},`;
    line += `${component.y},`;
    line += `${component.rotation},0,100,不用,TRUE,`;
    line += `${component.type} ${component.outline}`;
    line += endline;
    file += line;
  }
  file+= endline;
  return file;
}