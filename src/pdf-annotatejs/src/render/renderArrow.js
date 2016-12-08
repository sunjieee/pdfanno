import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';
import renderCircle from './renderCircle';
import { findBezierControlPoint } from '../utils/relation.js';

/**
 * Create SVGGElements from an annotation definition.
 * This is used for anntations of type `arrow`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A group of an arrow to be rendered
 */
export default function renderArrow(a) {

    let arrow = createArrow(a);
    return arrow;
}

export function createArrow(a, id=null) {

// <svg viewBox="0 0 200 200">
//     <marker id="m_ar" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="strokeWidth" preserveAspectRatio="none" markerWidth="2" markerHeight="3" orient="auto-start-reverse">
//         <polygon points="0,0 0,10 10,5" fill="red" id="ms"/>
//     </marker>
//     <path d="M50,50 h100" fill="none" stroke="black" stroke-width="10" marker-start="url(#m_ar)" marker-end="url(#m_ar)"/>
// </svg>

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  setAttributes(group, {
    fill: normalizeColor(a.color || '#f00'),
    stroke: normalizeColor(a.color || '#f00'),
    'data-highlight1': a.highlight1,
    'data-highlight2': a.highlight2,
    'data-text': a.text
  });

  let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  setAttributes(marker, {
    viewBox: "0 0 10 10",
    markerWidth: 2,
    markerHeight: 3,
    fill: normalizeColor(a.color || '#f00'),
    id: 'arrowhead',
    orient: "auto-start-reverse"
  });
  marker.setAttribute('refX', 5);
  marker.setAttribute('refY', 5);
  group.appendChild(marker);

  let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  setAttributes(polygon, {
    points: "0,0 0,10 10,5"
  });
  marker.appendChild(polygon);

  // Find Control points.
  let control = findBezierControlPoint(a.x1, a.y1, a.x2, a.y2);



  // Create Outline.
  let outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  setAttributes(outline, {
    d     : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
    class : 'anno-arrow-outline'
  });
  group.appendChild(outline);


  /*
    <path d="M 25 25 Q 175 25 175 175" stroke="blue" fill="none"/>
  */
  let arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  setAttributes(arrow, {
    d: `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
    // stroke: normalizeColor(a.color || '#f00'),
    strokeWidth: 1,
    fill: 'none',
    markerEnd: 'url(#arrowhead)',
    class : 'anno-arrow'
  });

  if (a.direction === 'two-way') {
    arrow.setAttribute('marker-start', 'url(#arrowhead)');
  }

  if (id) {
    setAttributes(arrow, {
      id: id
    });
  }
  group.appendChild(arrow);


  return group;
}

function adjustStartEndPoint(annotation) {

  // TODO
  const RADIUS = 5;

  let x1 = annotation.x1;
  let y1 = annotation.y1;
  let x2 = annotation.x2;
  let y2 = annotation.y2;

  function sign(val) {
    return val >= 0 ? 1 : -1;
  }

  // Verticale.
  if (x1 === x2) {
    // annotation.y1 += RADIUS * sign(y2 - y1);
    annotation.y2 += RADIUS * sign(y1 - y2);
    return annotation;
  }

  // Horizonal.
  if (y1 === y2) {
    // annotation.x1 += RADIUS * sign(x2 - x1);
    annotation.x2 += RADIUS * sign(x1 - x2);
    return annotation;
  }

  let grad  = (y1-y2) / (x1-x2);
  let theta = Math.atan(grad);
  // annotation.x1 += RADIUS * Math.cos(theta) * sign(x2 - x1);
  annotation.x2 += RADIUS * Math.cos(theta) * sign(x1 - x2);
  // annotation.y1 += RADIUS * Math.sin(theta) * sign(y2 - y1);
  annotation.y2 += RADIUS * Math.sin(theta) * sign(y1 - y2);
  return annotation;

}