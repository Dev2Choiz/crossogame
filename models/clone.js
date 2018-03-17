class Clone {

    static deepClone(object)
    {
        return JSON.parse(JSON.stringify(object));
    }

    static shallowClone(object)
    {
        return Object.assign({}, object);
    }

    static cloneMatrix(matrix)
    {
        let copy = {};
        let move;
        for (move in matrix) {
            copy[move] = this.shallowClone(matrix[move]);
        }
        return copy;
    }
}

module.exports = Clone;
