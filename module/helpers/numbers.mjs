
const fns = {};

fns.bound = function bound(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export default fns;