let musica;
let fft;
let espectro = [];
let grade = [];
let distCentro = [];
let num = 10;
let limiar = 80;
let tamanho = 25;
let fase = 64;
let corSelecionada = 0;

function setup() {
  let canvas = createCanvas(400, 400, WEBGL);
  canvas.parent("sketch-container");

  colorMode(HSB, 360, 100, 100);
  fft = new p5.FFT();

  document.getElementById("startBtn").addEventListener("click", startMusicVisualization);
  document.getElementById("stopBtn").addEventListener("click", stopMusic);
  document.getElementById("cubeColor").addEventListener("change", () => {
    corSelecionada = int(document.getElementById("cubeColor").value);
  });

  document.getElementById("numCubes").addEventListener("input", () => {
    num = int(document.getElementById("numCubes").value);
    atualizarGrade();
    redraw();
  });

  document.getElementById("cubeSize").addEventListener("input", () => {
    tamanho = int(document.getElementById("cubeSize").value);
    atualizarGrade();
    redraw();
  });

  atualizarGrade();
}

function atualizarGrade() {
  grade = [];
  distCentro = [];

  for (let i = 0; i < num; i++) {
    grade[i] = [];
    for (let j = 0; j < num; j++) {
      grade[i][j] = [];
      for (let k = 0; k < num; k++) {
        grade[i][j][k] = 0;
        let distancia = obterDistanciaDoCentro(i, j, k);
        distCentro.push({ i, j, k, distancia });
      }
    }
  }

  distCentro.sort(compararDistancias);
}

function startMusicVisualization() {
  let fileInput = document.getElementById("musicFile").files[0];

  if (fileInput) {
    let fileURL = URL.createObjectURL(fileInput);
    loadAndPlayMusic(fileURL);
  } else {
    document.getElementById("musicStatus").textContent = "Por favor, selecione um arquivo de áudio.";
  }
}

function loadAndPlayMusic(source) {
  if (musica) {
    musica.stop();
  }

  musica = loadSound(source, () => {
    musica.play();
    document.getElementById("musicStatus").textContent = "Música carregada e tocando!";
    document.getElementById("stopBtn").disabled = false;
  }, (error) => {
    console.error(error);
    document.getElementById("musicStatus").textContent = "Erro ao carregar a música!";
  });
}

function stopMusic() {
  if (musica && musica.isPlaying()) {
    musica.stop();
    document.getElementById("musicStatus").textContent = "Música parada.";
    document.getElementById("stopBtn").disabled = true;
  }
}

function obterDistanciaDoCentro(i, j, k) {
  let deslocamento = (1 - num) * tamanho / 2;
  let x = i * tamanho + deslocamento;
  let y = j * tamanho + deslocamento;
  let z = k * tamanho + deslocamento;
  return dist(x, y, z, 0, 0, 0);
}

function compararDistancias(a, b) {
  return a.distancia - b.distancia;
}

function draw() {
  background(40);
  orbitControl();
  
  espectro = fft.analyze();
  
  let totalCubos = num * num * num;
  for (let i = 0; i < totalCubos; i++) {
    let pos = distCentro[i];
    grade[pos.i][pos.j][pos.k] = espectro[i];
  }
  
  let deslocamento = (1 - num) * tamanho / 2;
  translate(deslocamento, deslocamento, deslocamento);
  
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      for (let k = 0; k < num; k++) {
        push();
        translate(i * tamanho, j * tamanho, k * tamanho);
        let volumeBanda = grade[i][j][k];

        let brilho = map(volumeBanda, limiar, 255, 20, 100);

        stroke(corSelecionada, 100, brilho / 2);
        fill(corSelecionada, 100, brilho);

        if (volumeBanda > limiar) {
          let tamanhoCaixa = map(volumeBanda, limiar, 255, 0, (3 / 4) * tamanho);
          box(tamanhoCaixa);
        }
        pop();
      }
    }
  } 
}
