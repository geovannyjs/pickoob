/*
const path = require('path');
const fs = require('fs');



const { exec } = require("child_process");
//criando caminho inicial
const directoryPath = path.join(__dirname, 'acessoteste\\epub');


//responsavel pela leitura dos documentos no diretorio
fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //lista arquivos
    files.forEach(function (folder) {
        //o dirAtual cria um caminho com cada documento lido uma vez que cada um representa uma pasta, o segundo argumento é o nome da pasta
        let dirAtual = path.join(directoryPath, folder)

        //novamente lemos os documentos do diretorio porem agora passando como parametro o dirAtual
        fs.readdir(dirAtual , function (err, rdffile) {
            
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            //agora para cada arquivo de cada pasta obtemos seu nome (mudar a \ para linux depois)
            rdffile.forEach(function (teste) {

                let rdfPath = directoryPath + '\\' + folder + '\\' + teste
                console.log(rdfPath)
                // console.log(teste)

                //executa o gutenberg_rdf passando cada .rdf
                exec('node C:\\Users\\Luke\\Desktop\\pickoob\\parser\\gutenberg_rdf.js '+ rdfPath, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(stdout);
                });

                
            })

        })
        console.log(folder);
        console.log(dirAtual); 
    });
});

*/

const fsPromises = require('fs').promises
const path = require('path')


//if(!process.argv[2]) throw new Error('You must pass the dir path as parameter')

// readdir function
const readFilesRecursively = (dirPath, fn) => fsPromises.readdir(dirPath)
  .then(files => 
    files.forEach(file => {
      let f = path.join(dirPath, file)
      fsPromises.stat(f).then(fst => fst.isDirectory() ? readFilesRecursively(f, fn) : fn(f))
    })
  )

module.exports = readFilesRecursively
//readFilesRecursively(process.argv[2], console.log)