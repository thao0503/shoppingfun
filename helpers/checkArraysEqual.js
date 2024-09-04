module.exports = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    return sortedArr1.every((val, index) => val === sortedArr2[index]);
};


