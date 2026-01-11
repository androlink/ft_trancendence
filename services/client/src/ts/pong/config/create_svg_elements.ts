

/**
 * craetes the SVG element of the human player, for the player selection
 * @returns the svg element all done (except tailwindcss class)
 */
export function createHumanSvg(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("version", "1.0");
  svg.setAttribute("width", "384pt");
  svg.setAttribute("height", "384pt");
  svg.setAttribute("viewBox", "0 0 384 384");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", "translate(0,384) scale(0.1,-0.1)");
  g.setAttribute("fill", "currentColor");
  g.setAttribute("stroke", "none");
  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute(
    "d",
    "M1695 3495 c-308 -65 -554 -227 -758 -497 -31 -42 -57 -80 -57 -83 0 -4 -9 -20 -20 -35 -26 -36 -90 -168 -117 -240 -35 -91 -61 -190 -78 -291 l-17 -97 -58 -25 c-44 -19 -65 -35 -84 -66 l-26 -41 0 -280 0 -280 25 -40 c29 -45 73 -73 129 -80 l38 -5 29 -100 c82 -289 219 -505 453 -714 94 -83 286 -189 420 -232 78 -25 287 -63 346 -63 58 0 268 38 345 63 290 92 548 301 712 576 77 130 119 224 159 360 l32 110 38 5 c56 7 101 35 129 80 l25 40 0 280 0 280 -26 41 c-19 31 -40 47 -84 66 l-58 25 -17 97 c-27 158 -63 267 -140 426 -58 118 -67 133 -152 245 -126 167 -267 286 -438 369 -136 67 -172 79 -305 107 -152 32 -294 31 -445 -1z m433 -325 c46 -12 95 -28 110 -36 15 -8 30 -14 34 -14 4 0 47 -25 95 -55 95 -58 213 -170 287 -270 62 -85 130 -215 118 -227 -6 -6 -85 -8 -204 -6 -234 6 -347 29 -473 95 -65 34 -132 83 -175 128 -112 117 -186 124 -293 28 -47 -42 -155 -112 -231 -149 -32 -16 -71 -44 -87 -63 -24 -30 -29 -45 -29 -91 0 -96 64 -160 160 -160 45 0 151 53 233 116 32 25 65 48 73 51 8 3 45 -18 87 -49 89 -68 179 -116 288 -156 162 -58 262 -72 526 -72 169 0 204 -3 217 -16 14 -13 15 -55 13 -327 -4 -334 -8 -370 -64 -542 -85 -263 -286 -508 -503 -615 -36 -17 -72 -35 -81 -40 -47 -25 -230 -60 -309 -60 -81 0 -262 35 -307 59 -10 5 -47 24 -83 41 -82 41 -147 89 -232 173 -152 151 -252 337 -310 577 -21 89 -23 115 -23 430 0 315 2 341 23 430 59 244 157 425 314 580 133 132 255 202 432 247 114 29 266 26 394 -7z"
  );
  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute(
    "d",
    "M1359 1895 c-105 -69 -102 -210 6 -274 132 -78 292 82 214 214 -48 81 -147 108 -220 60z"
  );
  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute(
    "d",
    "M2319 1895 c-105 -69 -102 -210 6 -274 132 -78 292 82 214 214 -48 81 -147 108 -220 60z"
  );
  g.appendChild(path1);
  g.appendChild(path2);
  g.appendChild(path3);
  svg.appendChild(g);
  return svg;
}

/**
 * craetes the SVG element of the bot, for the player selection
 * @returns the svg element all done (except tailwindcss class)
 */
export function createBotSvg(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("version", "1.0");
  svg.setAttribute("width", "384pt");
  svg.setAttribute("height", "384pt");
  svg.setAttribute("viewBox", "0 0 384 384");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", "translate(0,384) scale(0.1,-0.1)");
  g.setAttribute("fill", "currentColor");
  g.setAttribute("stroke", "none");
  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute(
    "d",
    "M1658 3802 c-47 -48 -58 -71 -58 -125 0 -62 32 -106 103 -140 l58 -28 -3 -152 -3 -152 -445 -6 c-488 -6 -488 -6 -594 -70 -68 -42 -151 -130 -181 -193 -49 -104 -55 -151 -55 -428 0 -238 -1 -259 -18 -264 -47 -14 -89 -43 -114 -79 l-27 -40 -1 -363 c0 -390 0 -391 53 -440 14 -13 42 -30 64 -37 l38 -13 5 -339 c6 -380 6 -381 80 -428 l40 -25 1320 0 1320 0 39 24 c21 14 48 41 60 61 20 35 21 47 21 371 0 310 1 335 18 340 47 14 89 43 114 79 l27 40 0 365 0 365 -27 40 c-25 36 -67 65 -114 79 -17 5 -18 26 -18 264 0 281 -6 328 -58 432 -30 61 -130 167 -183 194 -118 61 -107 60 -589 66 l-445 5 -3 152 -3 152 58 28 c71 34 103 78 103 140 0 54 -17 88 -65 131 l-37 32 -221 -1 -222 -1 -37 -36z m1299 -943 c19 -12 45 -39 59 -60 l24 -39 -2 -977 -3 -978 -1115 0 -1115 0 -3 981 -2 981 23 34 c12 18 38 44 56 56 l34 23 1005 0 1005 0 34 -21z"
  );
  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute(
    "d",
    "M1359 2055 c-105 -69 -102 -210 6 -274 132 -78 292 82 214 214 -48 81 -147 108 -220 60z"
  );
  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute(
    "d",
    "M2319 2055 c-105 -69 -102 -210 6 -274 132 -78 292 82 214 214 -48 81 -147 108 -220 60z"
  );
  const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path4.setAttribute(
    "d",
    "M1357 1414 c-51 -33 -77 -79 -77 -134 0 -56 26 -101 79 -135 l41 -25 520 0 520 0 41 25 c53 34 79 79 79 135 0 56 -26 101 -79 135 l-41 25 -522 -1 -523 0 -38 -25z"
  );
  g.appendChild(path1);
  g.appendChild(path2);
  g.appendChild(path3);
  g.appendChild(path4);
  svg.appendChild(g);
  return svg;
}