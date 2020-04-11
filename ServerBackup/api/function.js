module.exports = {
    ucwords: str => {
        return (str + '').replace(/^(.)|\s+(.)/g, $1 => {
            return $1.toUpperCase()
        })
    },

    isEmptyObject: obj => {
        if (!obj)
            return true;

        for (let key in obj)
            return false;

        return true;
    },

    hasOwnPropertyCase: (obj, key) => {
        if (!obj)
            return false;

        return Object.keys(obj).findIndex(v => v.toLowerCase() === key.toLowerCase()) > -1;
    }
};
