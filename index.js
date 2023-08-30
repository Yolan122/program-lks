window.onload = () => {
    const
        background = document.getElementById("background"),
        scoreLbl = document.getElementById("score"),
        linesLbl = document.getElementById("lines"),
        canvas = document.getElementById("game-canvas"),
        ctx = canvas.getContext("2d");

    class Tetromino {
        static COLORS = ["blue", "green", "yellow", "red", "orange", "light-blue", "purple"];
        static UKURAN_BLOK = 28;
        static JEDA = 400;
        static JEDA_DITAMBAH = 5;

        constructor(xs, ys, warna = null) {
            this.x = xs;
            this.y = ys;
            this.panjang = xs.length;
            if (warna !== null) {
                this.warna = warna;
                this.img = new Image();
                this.img.src = `resources/${Tetromino.COLORS[warna]}.jpg`;
            }
        }

        perbarui(updFunc) {
            for (let i = 0; i < this.panjang; ++i) {
                ctx.clearRect(
                    this.x[i] * Tetromino.UKURAN_BLOK,
                    this.y[i] * Tetromino.UKURAN_BLOK,
                    Tetromino.UKURAN_BLOK,
                    Tetromino.UKURAN_BLOK
                );

                updFunc(i);
            }

            this.gambar();
        }

        gambar() {
            if (!this.img.complete) {
                this.img.onload = () => this.gambar();
                return;
            }

            for (let i = 0; i < this.panjang; ++i) {
                ctx.drawImage(
                    this.img,
                    this.x[i] * Tetromino.UKURAN_BLOK,
                    this.y[i] * Tetromino.UKURAN_BLOK,
                    Tetromino.UKURAN_BLOK,
                    Tetromino.UKURAN_BLOK
                );
            }
        }

        bertabrakan(checkFunc) {
            for (let i = 0; i < this.panjang; ++i) {
                const { x, y } = checkFunc(i);
                if (x < 0 || x >= LEBAR_LAPANGAN || y < 0 || y >= TINGGI_LAPANGAN || LAPANGAN[y][x] !== false)
                    return true;
            }
            return false;
        }

        gabung() {
            for (let i = 0; i < this.panjang; ++i) {
                LAPANGAN[this.y[i]][this.x[i]] = this.warna;
            }
        }

        putar() {
            const
                maxX = Math.max(...this.x),
                minX = Math.min(...this.x),
                minY = Math.min(...this.y),
                nx = [],
                ny = [];

            if (!this.bertabrakan(i => {
                    nx.push(maxX + minY - tetromino.y[i]);
                    ny.push(tetromino.x[i] - minX + minY);
                    return { x: nx[i], y: ny[i] };
                })) {
                this.perbarui(i => {
                    this.x[i] = nx[i];
                    this.y[i] = ny[i];
                });
            }
        }
    }

    const
        LEBAR_LAPANGAN = 10,
        TINGGI_LAPANGAN = 20,
        LAPANGAN = Array.from({ length: TINGGI_LAPANGAN }),
        BARIS_VALID_MIN = 4,
        TETROMINOES = [
            new Tetromino([0, 0, 0, 0], [0, 1, 2, 3]),
            new Tetromino([0, 0, 1, 1], [0, 1, 0, 1]),
            new Tetromino([0, 1, 1, 1], [0, 0, 1, 2]),
            new Tetromino([0, 0, 0, 1], [0, 1, 2, 0]),
            new Tetromino([0, 1, 1, 2], [0, 0, 1, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 0])
        ];

    let tetromino = null,
        jeda,
        skor,
        baris;

    (function setup() {
        canvas.style.top = Tetromino.UKURAN_BLOK;
        canvas.style.left = Tetromino.UKURAN_BLOK;

        ctx.canvas.width = LEBAR_LAPANGAN * Tetromino.UKURAN_BLOK;
        ctx.canvas.height = TINGGI_LAPANGAN * Tetromino.UKURAN_BLOK;

        const skala = Tetromino.UKURAN_BLOK / 13.83333333333;
        background.style.width = skala * 166;
        background.style.height = skala * 304;

        const tengah = Math.floor(LEBAR_LAPANGAN / 2);
        for (const t of TETROMINOES) t.x = t.x.map(x => x + tengah);

        reset();
        gambar();
    })();

    function reset() {
        LAPANGAN.forEach((_, y) => LAPANGAN[y] = Array.from({ length: LEBAR_LAPANGAN }).map(_ => false));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        jeda = Tetromino.JEDA;
        skor = 0;
        baris = 0;
    }

    function gambar() {
        if (tetromino) {
            if (tetromino.bertabrakan(i => ({ x: tetromino.x[i], y: tetromino.y[i] + 1 }))) {
                tetromino.gabung();
                tetromino = null;

                let barisSelesai = 0;
                for (let y = TINGGI_LAPANGAN - 1; y >= BARIS_VALID_MIN; --y) {
                    if (LAPANGAN[y].every(e => e !== false)) {
                        for (let ay = y; ay >= BARIS_VALID_MIN; --ay)
                            LAPANGAN[ay] = [...LAPANGAN[ay - 1]];

                        ++barisSelesai;
                        ++y;
                    }
                }

                if (barisSelesai) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let y = BARIS_VALID_MIN; y < TINGGI_LAPANGAN; ++y) {
                        for (let x = 0; x < LEBAR_LAPANGAN; ++x) {
                            if (LAPANGAN[y][x] !== false) new Tetromino([x], [y], LAPANGAN[y][x]).gambar();
                        }
                    }

                    skor += [40, 100, 300, 1200][barisSelesai - 1];
                    baris += barisSelesai;
                } else {
                    if (LAPANGAN[BARIS_VALID_MIN - 1].some(blok => blok !== false)) {
                        alert("Anda kalah!");
                        reset();
                    }
                }

            } else
                tetromino.perbarui(i => ++tetromino.y[i]);
        } else {
            scoreLbl.innerText = skor;
            linesLbl.innerText = baris;

            tetromino = (({ x, y }, warna) =>
                new Tetromino([...x], [...y], warna)
            )(
                TETROMINOES[Math.floor(Math.random() * (TETROMINOES.length - 1))],
                Math.floor(Math.random() * (Tetromino.COLORS.length - 1))
            );

            tetromino.gambar();
        }

        setTimeout(gambar, jeda);
    }

    window.onkeydown = event => {
        switch (event.key) {
            case "ArrowLeft":
                if (!tetromino.bertabrakan(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                    tetromino.perbarui(i => --tetromino.x[i]);
                break;
            case "ArrowRight":
                if (!tetromino.bertabrakan(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                    tetromino.perbarui(i => ++tetromino.x[i]);
                break;
            case "ArrowDown":
                jeda = Tetromino.JEDA / Tetromino.JEDA_DITAMBAH;
                break;
            case " ":
                tetromino.putar();
                break;
        }
    }

    window.onkeyup = event => {
        if (event.key === "ArrowDown")
            jeda = Tetromino.JEDA;
    }
}