export const GRAVITY = 9.81;
export const BOARD_INERTIA = 14;
export const MAX_ANGLE = 0.42;

export function moment(objects) {
  return objects.reduce((sum, object) => {
    if (!object.placed) return sum;
    return sum + object.weight * object.s;
  }, 0);
}

export function torqueNewton(objects, angle) {
  const lever = Math.cos(angle);
  return objects.reduce((sum, object) => {
    if (!object.placed) return sum;
    return sum + object.weight * GRAVITY * object.s * lever;
  }, 0);
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
  state.omega *= Math.exp(-2.1 * step);
  state.angle += state.omega * step;
  if (state.angle > MAX_ANGLE) {
    state.angle = MAX_ANGLE;
    state.omega = 0;
  } else if (state.angle < -MAX_ANGLE) {
    state.angle = -MAX_ANGLE;
    state.omega = 0;
  }
  return { tau, alpha };
}

export function isSettled(state) {
  return Math.abs(state.omega) < 0.012 && Math.abs(state.angle) < MAX_ANGLE + 0.001;
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
