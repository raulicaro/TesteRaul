var fs = require('fs');
var csv = require('fast-csv');

var stream = fs.createReadStream("input.csv");

// Profiles é um vetor de Student.
var Profiles = [];

// Student : construtor que cria objetos com as informações sobre o aluno.
function Student(fullname, eid, classes, addresses, invisible, see_all) {
  this.fullname = fullname;
  this.eid = eid;
  this.classes = classes;
  this.addresses = addresses;
  this.invisible = invisible;
  this.see_all = see_all;
}

// Addresses : construtor auxiliar que armazena as informações de contato.
function Addresses(type, tags, address) {
  this.type = type;
  this.tags = tags;
  this.address = address;
}

// TypeAndTags : construtor auxiliar que armazena o tipo e as tags  de cada contato.
function TypeAndTags(type, tags) {
  this.type = type;
  this.tags = tags;
}

/* makeClasses : recebe duas strings, class1 e class2, e retorna um vetor
(ou uma única string, dependendo do número de classes) cujas entradas correspondem
às salas especificadas nos argumentos. */
function makeClasses(class1, class2) {
  var classes1 = class1.match(/Sala [0-9]+/gi);
  var classes2 = class2.match(/Sala [0-9]+/gi);
  if (classes1 != null && classes2 != null) {
    return classes1.concat(classes2);
  }
  else if (classes1 != null) {
    if (classes1.length > 1)
      return classes1;
    return classes1[0];
  }
  else if (classes2 != null) {
    if (classes2.length > 1)
      return classes2;
    return classes2[0];
  }
}

/* makeTagsAndTypes : recebe a primeira linha (i.e. os headers) do input.csv e
itera apenas sobre as entradas que dizem respeito às informações de
contato, retornando um vetor de objetos do tipo TypeAndTags. */
function makeTagsAndTypes(data) {
  var type_tags = []; // vetor de objetos do tipo TypeAndTags
  for (var i = 4; i < 10; i++) {
    var header = data[i].match(/[A-Za-záàâãéèêíïóôõöúçñ]+/gi);
    var aux = [];
    for (var j = 1; j < header.length; j++) {
      aux.push(header[j]);
    }
    type_tags.push(new TypeAndTags(header[0], aux));
  }
  return type_tags;
}

/* isValidPhone : recebe uma entrada - data - do tipo "phone" e verifca se o número
inserido é válido. Retorna um vetor Phones de strings com o formatação correta dos
números. OBS:  números inválidos serão retornados com "55". */
function isValidPhone(data) {
  // d é um vetor com os números especificados na entrada 'data'.
  var d = data.match(/(\(?[0-9]{2}\)?) *([0-9]+)/gi);
  var err = data.match(/[A-Za-z]+/gi); // tratamento de erros ou caracteres inválidos
  var phone = "55";
  var Phones = [];

  // Casos em que há apenas um número de contato em d
  if (d != null && err == null && d.length == 1) {
    var auxData = d[0].match(/[0-9]+/g);
    auxData = auxData[0].concat(auxData[1]);
    if ((auxData.length == 10 && auxData[2] != 9) || (auxData.length == 11 && auxData[2] == 9)) {
      for (var i = 0; i < auxData.length; i++)
        phone += auxData[i];
    }
    Phones.push(phone);
  }

  // Casos em que há mais de um número de contato em d
  else if (d != null && err == null && d.length > 1) {
    var Phones = [];
    for (var i = 0; i < d.length; i++) {
      var auxData = d[i].match(/[0-9]+/g);
      auxData = auxData[0].concat(auxData[1]);
      var newPhone = "55";
      if ((auxData.length == 10 && auxData[2] != 9) || (auxData.length == 11 && auxData[2] == 9)) {
        for (var j = 0; j < auxData.length; j++)
          newPhone += auxData[j];
      }
      Phones.push(newPhone);
    }
  }

  return Phones;
}

/*isValidEmail : recebe uma string data que representa os emails de contato
e verifica se são válidos. Retorna o vetor emails com aqueles especificados
pelo argumento ou null se o email é inválido. */
function isValidEmail(data) {
  var err = data.match(/["!#$%&*()+=:^~{}´' `\t|><;?\[\]]/g);
  var emails = data.match(/[a-z0-9_]+@[a-z]+\.[a-z]+/gi); // pode ser um ou mais emails
  if (err == null)
    return emails;
  return null;
}

/*checkInvisible : recebe a entrada data correspondente ao campo Invisible e
retorna false se data é igual a zero, ou true, caso contrário.*/
function checkInvisible(data) {
  if (data == 0)
    return false;
  return true;
}

/*checkSeeAll : recebe a entrada data correspondente ao campo SeeAll e
retorna true se data é igual a 'yes', ou false, caso contrário. */
function checkSeeAll(data) {
  if (data == 'yes')
    return true;
  return false;
}

/*findEmail : recebe um vetor addresses de objetos do tipo Addresses e
verifica se o email já foi inserido. Se já existente, retorna o índice i corres-
pondente à posição do email no vetor. Se o email ainda não foi inserido,
retorna o tamanho do vetor. Se addresses for null, retorna 0. */
function findEmail(addresses, email) {
  if (addresses != null) {
    for (var x = 0; x < addresses.length; x++)
      for (var i = 0; i < addresses.length; i++) {
        if (email == addresses[i].address)
          return i;
      }
    return addresses.length;
  }
  else return -1;
}

/*findPhone : recebe um vetor addresses de objetos do tipo Addresses e
verifica se o phone já foi inserido. Se já existente, retorna o índice i corres-
pondente à posição do phone no vetor. Se o phone ainda não foi inserido,
retorna o tamanho do vetor. Se addresses for null, retorna 0. */
function findPhone(addresses, phone) {
  if (addresses != null) {
    for (var i = 0; i < addresses.length; i++) {
      if (phone == addresses[i].address)
        return i;
    }
    return addresses.length;
  }
  else return -1;
}

/* makeAddresses : recebe uma linha do input.csv - data - e o vetor type_tags de
objetos do tipo TypeAndTags e retorna o vetor addresses de objetos do tipo Addresses
com as informações de contato de cada estudante. */
function makeAddresses(data, type_tags) {
  var addresses = []; // vetor de Addresses
  for (var i = 4, j = 0; i < 10; i++, j++) { // itera apenas sobre as informações de contato
    if (type_tags[j].type == "phone") {
      var d = isValidPhone(data[i]);
      // se há apenas um número na entrada e ele é válido
      if (d != null && d.length == 1 && d[0] != "55") {
        var fp = findPhone(addresses, d[0]);
        // casos em que o número já existe, acrescenta-se apenas as tags
        if (fp > -1 && fp < addresses.length) {
          addresses[fp].tags = addresses[fp].tags.concat(type_tags[j].tags);
        }
        else
          addresses.push(new Addresses('phone', type_tags[j].tags, d[0]));
      }
      // se há mais de um número na entrada
      else if (d != null && d.length > 1) {
        for (var p = 0; p < d.length; p++) {
          // se o número é válido
          if (d[p] != "55" && d[p]) {
            var fp = findPhone(addresses, d[p]);
            if (fp > -1 && fp < addresses.length) {
              addresses[fp].tags = addresses[fp].tags.concat(type_tags[j].tags);
            }
            else
              addresses.push(new Addresses('phone', type_tags[j].tags, d[p]));
          }
        }
      }
    }
    else {
      var e = isValidEmail(data[i]);
      // se há apenas um email na entrada e ele é válido
      if (e != null && e.length == 1) {
        var fe = findEmail(addresses, e);
        // casos em que o email já existe, acrescenta-se apenas as tags
        if (fe > -1 && fe < addresses.length) {
          addresses[fe].tags = addresses[fe].tags.concat(type_tags[j].tags);
        }
        else
          addresses.push(new Addresses('email', type_tags[j].tags, e[0]));
      }
      // se há mais de um email na entrada e eles são válidos
      else if (e != null && e.length > 1) {
        for (var p = 0; p < e.length; p++) {
          var fe = findEmail(addresses, e);
          if (fe > -1 && fe < addresses.length) {
            addresses[fe].tags = addresses[fe].tags.concat(type_tags[j].tags);
          }
          else
            addresses.push(new Addresses('email', type_tags[j].tags, e[p]));
        }
      }
    }
  }
  return addresses;
}

/* findStudentProfile : recebe um objeto student do tipo Student e verifica se ele já
foi inserido. Em caso positivo, junta-se as informações do perfil e retorna-se true;
caso contrário, retorna false. */
function findStudentProfile(student) {
  for (var i = 0; i < Profiles.length; i++) {
    if (student.fullname == Profiles[i].fullname && student.eid == Profiles[i].eid) {
      Profiles[i].classes = Profiles[i].classes.concat(student.classes);
      Profiles[i].addresses = Profiles[i].addresses.concat(student.addresses);
      Profiles[i].invisible = (Profiles[i].invisible || student.invisible);
      Profiles[i].see_all = (Profiles[i].see_all || student.see_all);
      return true;
    }
  }
  return false;
}

// type_tagsFlags : flag que muda de valor quando makeTagsAndTypes é invocado
// (i.e. quando computa-se a primeira linha do input.csv - os headers).
var type_tagsFlags = 0;

// typeTags : vetor de objetos do tipo TypeAndTags
var typeTags;

// leitura do input.csv
csv
  .fromStream(stream, {objectMode : true})
  .on("data", function(data){
    if (type_tagsFlags == 0) {
      tags = makeTagsAndTypes(data);
      type_tagsFlags = 1;
    }
    else {
      var addrs = makeAddresses(data, tags);
      var student = new Student(data[0], data[1], makeClasses(data[2], data[3]), addrs, checkInvisible(data[10]), checkSeeAll(data[11]));
      if (findStudentProfile(student) == false)
        Profiles.push(student);
    }
  })
  .on("end", function(){
    var str = JSON.stringify(Profiles, null, 1);
    fs.appendFile("output.json", str, null)
  });