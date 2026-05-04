let game = {
    count: 5,
    pegs: [[],[],[]],
    moves: 0,
    selected: null,
    autoPlaying: false
};

const diskCountInput = document.getElementById('diskCount');
const moveCountSpan = document.getElementById('moveCount');
const resetBtn = document.getElementById('resetBtn');
const autoBtn = document.getElementById('autoBtn');
const pegsDOM = document.querySelectorAll('.peg');
const tip = document.getElementById('tip');

init();
function init() {
    game.count = Number(diskCountInput.value);
    game.moves = 0;
    game.selected = null;
    game.pegs = [[],[],[]];
    for(let i=game.count; i>=1; i--) game.pegs[0].push(i);
    updateMove();
    render();
    bindEvents();
}

function render() {
    pegsDOM.forEach(p => p.innerHTML = '');
    game.pegs.forEach((peg, pIdx) => {
        peg.forEach((size) => {
            let d = document.createElement('div');
            d.className = 'disk';
            d.style.width = (size * 30 + 60) + 'px';
            d.style.background = `hsl(${size * 40}, 90%, 60%)`;
            d.dataset.size = size;
            pegsDOM[pIdx].appendChild(d);
        });
    });
}

function onPegClick(e) {
    if(game.autoPlaying) return;
    let idx = Number(e.currentTarget.dataset.idx);
    let peg = game.pegs[idx];
    
    if(game.selected === null) {
        if(peg.length === 0) return showTip('Please select a peg with disks.', true);
        game.selected = idx;
        highlightSelected();
        return;
    }

    let from = game.selected;
    let to = idx;
    if(from === to) return cancelSelect();

    let top = game.pegs[from].at(-1);
    let targetTop = game.pegs[to].at(-1) ?? 999;
    if(top >= targetTop) {
        showTip('You cannot place a larger disk on a smaller disk.', true);
        cancelSelect();
        return;
    }

    game.pegs[to].push(game.pegs[from].pop());
    game.moves++;
    updateMove();
    cancelSelect();
    render();
    checkWin();
}

function checkWin() {
    if(game.pegs[2].length === game.count) {
        tip.className = 'tip win';
        tip.textContent = '🎉Congratulations! You have completed the game!';
    }
}

async function autoPlay() {
    if(game.autoPlaying) return;
    game.autoPlaying = true;
    autoBtn.disabled = true;
    let steps = [];
    hanoi(game.count, 0, 2, 1, steps);
    for(let [f,t] of steps) {
        await sleep(600);
        game.pegs[t].push(game.pegs[f].pop());
        game.moves++;
        updateMove();
        render();
    }
    game.autoPlaying = false;
    autoBtn.disabled = false;
}

function hanoi(n, from, to, aux, arr) {
    if(n === 0) return;
    hanoi(n-1, from, aux, to, arr);
    arr.push([from, to]);
    hanoi(n-1, aux, to, from, arr);
}

function showTip(msg, warn) {
    tip.textContent = msg;
    tip.className = warn ? 'tip warning' : 'tip';
    setTimeout(()=>tip.textContent='', 1500);
}
function cancelSelect() { game.selected = null; render(); }
function updateMove() { moveCountSpan.textContent = game.moves; }
function highlightSelected() { render(); pegsDOM[game.selected].lastChild.classList.add('selected'); }
function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }
function bindEvents() {
    pegsDOM.forEach(p => p.onclick = onPegClick);
    resetBtn.onclick = init;
    autoBtn.onclick = autoPlay;
    diskCountInput.onchange = init;
}