import { explain, formatMeters } from "./measure.js";

function svgEl(name, attrs) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function addText(svg, x, y, text, anchor = "middle") {
  const node = svgEl("text", { x, y, "text-anchor": anchor, fill: "#d5e2ee", "font-size": 12 });
  node.textContent = text;
  svg.append(node);
}

export function fillSolution(spec, svg, copy) {
  const info = explain(spec);
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const width = 360;
  const height = 210;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const padL = 28;
  const padR = 18;
  const padT = 18;
  const padB = 28;
  const worldW = Math.max(0.01, info.distance + info.shadowLength);
  const worldH = Math.max(info.lightHeight, info.height, info.sourceHeight);
  const scale = Math.min((width - padL - padR) / worldW, (height - padT - padB) / worldH);
  const groundY = padT + worldH * scale;
  const xOf = (along) => padL + along * scale;
  const yOf = (up) => groundY - up * scale;

  svg.append(svgEl("line", {
    x1: 16, y1: groundY, x2: width - 12, y2: groundY,
    stroke: "#8eabc4", "stroke-width": 2,
  }));

  const lightX = xOf(0);
  const baseX = xOf(info.distance);
  const tipX = xOf(info.distance + info.shadowLength);
  const sourceY = yOf(info.sourceHeight);

  svg.append(svgEl("line", {
    x1: lightX, y1: yOf(info.lightHeight), x2: tipX, y2: groundY,
    stroke: "#00edff", "stroke-width": 1.5, "stroke-dasharray": "4 4",
  }));
  svg.append(svgEl("line", {
    x1: baseX, y1: groundY, x2: baseX, y2: yOf(info.height),
    stroke: "#f4f7fb", "stroke-width": 4,
  }));
  if (spec.shape === "sphere") {
    const radius = spec.height / 2;
    const cx = xOf(info.distance);
    svg.append(svgEl("circle", {
      cx, cy: yOf(radius), r: radius * scale,
      fill: "none", stroke: "#d5e2ee", "stroke-width": 2,
    }));
  }
  svg.append(svgEl("circle", {
    cx: lightX, cy: yOf(info.lightHeight), r: 6, fill: "#00edff",
  }));
  svg.append(svgEl("line", {
    x1: baseX, y1: groundY + 8, x2: tipX, y2: groundY + 8,
    stroke: "#00edff", "stroke-width": 2,
  }));

  addText(svg, lightX, yOf(info.lightHeight) - 10, "Light");
  addText(svg, (lightX + baseX) / 2, groundY + 22, "D");
  addText(svg, (baseX + tipX) / 2, groundY + 22, "S");
  addText(svg, baseX + 8, (groundY + sourceY) / 2, formatMeters(info.topCastsTip ? info.height : info.sourceHeight), "start");

  const markerLine = `The 1 m post stands ${formatMeters(info.markerDistance)} from the light and casts a ${formatMeters(info.markerShadow)} shadow. Light height = 1 × (D + S) / S = ${formatMeters(info.lightFromMarker)}.`;
  if (info.kind === "tangent") {
    copy.textContent = `${markerLine} A sphere's outer shadow is the tangent from that light, not a line through the top. The height is the full diameter, ${formatMeters(info.height)}. Compare the globe with the post, then check the tangent in the diagram.`;
  } else {
    copy.textContent = `${markerLine} The shadow tip comes from the top of the object. Height = S × light height / (D + S) = ${formatMeters(info.recovered)}.`;
  }
}

export function shareText(total, max) {
  const score = `${Math.round(total).toLocaleString("en-US")} / ${Math.round(max).toLocaleString("en-US")}`;
  return `SHADOW\nYOUR SCORE\n${score}\nCan you beat my visual intuition?`;
}
