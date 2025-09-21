let xbolinha = 300;
let ybolinha = 200;
let diametro = 15;
let velocidadeXBolinha = 4;
let velocidadeYBolinha = 4;
let xRaquete = 5;
let yRaquete = 150;
let raqueteComprimento = 10;
let raqueteAltura = 90;
let xRaquete_dir = 585;
let yRaquete_dir = 150;
let colidiu = false;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background('black');
  xbolinha += velocidadeXBolinha;
  ybolinha += velocidadeYBolinha;
  mostraBolinha();
  movimentaBolinha();
  mostraRaquete(xRaquete, yRaquete);
  mostraRaquete(xRaquete_dir, yRaquete_dir);
  movimentaRaqueteDireita();
  colidiuMinharaquete(xRaquete, yRaquete);
  colidiuMinharaquete(xRaquete_dir, yRaquete_dir);
}

function movimentaBolinha() {
  if (xbolinha + diametro / 2 > width || xbolinha - diametro / 2 < 0) {
    velocidadeXBolinha *= -1;
  }

  if (ybolinha + diametro / 2 > height || ybolinha - diametro / 2 < 0) {
    velocidadeYBolinha *= -1;
  }
}

function mostraRaquete(x, y) {
  rect(x, y, raqueteComprimento, raqueteAltura);
}

function mostraBolinha() {
  circle(xbolinha, ybolinha, diametro);
}

function movimentaRaqueteDireita() {
  if (keyIsDown(UP_ARROW)) {
    yRaquete_dir -= 5;
  }
  if (keyIsDown(DOWN_ARROW)) {
    yRaquete_dir += 5;
  }
}

function colidiuMinharaquete(x,y) {
    colidiu = collideRectCircle(
    x,
    y,
    raqueteComprimento,
    raqueteAltura,
    xbolinha,
    ybolinha,
    diametro / 2
  );
  if (colidiu) {
    velocidadeXBolinha *= -1;
  }
}
