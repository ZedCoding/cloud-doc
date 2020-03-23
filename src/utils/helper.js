const flattenArr = arr => {
  return arr.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
};

const objToArr = obj => {
  return Object.keys(obj).map(key => obj[key]);
};

const getParentNode = (node, parentClassName) => {
  let current = node;
  while (current !== null) {
    if (current.classList.contains(parentClassName)) {
      return current;
    }
    current = current.parentNode;
  }
  return false;
};

export { flattenArr, objToArr, getParentNode };
