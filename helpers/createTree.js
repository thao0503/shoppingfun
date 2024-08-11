const createTree = (arr, parentId = "",status = "") => {
    const tree = [];
    arr.forEach((item) => {
        if(item.parent_id === parentId){
            // const newItem = item;
            const children = createTree(arr, item.id, status);

            // Lọc danh mục theo trạng thái
            if(status === "" || item.status === status){
                const newItem = item;
                if(children.length > 0){
                    newItem.children = children;
                }
                tree.push(newItem);
            } else if (children.length > 0) {
                // Chỉ thêm children vào tree nếu có, không thêm item cha
                tree.push(...children);
              }
            // Kết thúc lọc danh mục theo trạng thái
        }
    });
    return tree;
}

module.exports.tree = (arr, parentId = "",status = "" ) => {
    const tree = createTree(arr, parentId,status);
    return tree;
}