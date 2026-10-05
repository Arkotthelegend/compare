export const GRAVITY = 9.81;
export const BOARD_INERTIA = 14;
export const BOARD_RESTORE = 110;
export const MAX_ANGLE = 0.42;

export function moment(objects) {
  return objects.reduce((sum, object) => {
    if (!object.placed) return sum;
    return sum + object.weight * object.s;
  }, 0);
}

export function sizeForWeight(weight) {
  return Math.round(Math.min(1.15, 0.4 * Math.sqrt(weight)) * 100) / 100;
}

export function torqueNewton(objects, angle) {
  const lever = Math.cos(angle);
  const load = objects.reduce((sum, object) => {
    if (!object.placed) return sum;
    return sum + object.weight * object.s;
  }, 0);
  return load * GRAVITY * lever - BOARD_RESTORE * Math.sin(angle);
}

export function equilibriumAngle(objects) {
  const target = Math.atan2(moment(objects) * GRAVITY, BOARD_RESTORE);
  return Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, target));
}

export function inertia(objects) {
  return objects.reduce((sum, object) => {
    if (!object.placed) return sum;
    return sum + object.weight * object.s * object.s;
  }, BOARD_INERTIA);
}

export function stepRotation(state, dt) {
  const step = Math.min(Math.max(dt, 0), 0.033);
  const tau = torqueNewton(state.objects, state.angle);
  const alpha = tau / inertia(state.objects);
  state.omega += alpha * step;
  state.omega *= Math.exp(-4.2 * step);
  state.angle += state.omega * step;
  if (state.angle > MAX_ANGLE) {
    state.angle = MAX_ANGLE;
    if (state.omega > 0) state.omega = 0;
  } else if (state.angle < -MAX_ANGLE) {
    state.angle = -MAX_ANGLE;
    if (state.omega < 0) state.omega = 0;
  }
  return { tau, alpha };
}

export function isSettled(state) {
  return Math.abs(state.omega) < 0.03 && Math.abs(state.angle - equilibriumAngle(state.objects)) < 0.03;
}

export function sideLoads(objects) {
  let left = 0;
  let right = 0;
  objects.forEach((object) => {
    if (!object.placed) return;
    const load = object.weight * object.s;
    if (load < 0) left += -load;
    else right += load;
  });
  return { left, right };
}
