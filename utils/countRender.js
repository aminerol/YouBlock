const DO_LOG = true;
let counts     = {};

export default function countRenders(func) {
    if (DO_LOG) {
        console.count(`${func.name} render`)
    }
}



console.count = console.count || ((label) => {
    if (!counts[label]) {
      counts[label] = 0;
    }
    counts[label]++;
    console.log(`${label}: ${counts[label]}`);
});