class Timer {
    static get() {
        let time = process.hrtime();
        return time;
    }

    static diff(start) {
        let diff = process.hrtime(start);
        return (diff[0] * 1000 + diff[1] / 1000000) + " ms";
    }
}

module.exports = Timer;
