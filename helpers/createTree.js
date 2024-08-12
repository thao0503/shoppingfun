const createTree = (arr, parentId = "",status = "", search = null) => {
    const tree = [];
    arr.forEach((item) => {
        if(item.parent_id === parentId){
            const children = createTree(arr, item.id, status, search);

            // Lọc danh mục theo trạng thái và tìm kiếm danh mục
            const matchesSearch = !search || search.test(item.title);
            
            if((status === "" || item.status === status) && matchesSearch){
                const newItem = item;
                if(children.length > 0){
                    newItem.children = children;
                }
                tree.push(newItem);
            } else if (children.length > 0) {
                // Chỉ thêm children vào tree nếu có, không thêm item cha
                tree.push(...children);
              }
            // Kết thúc lọc danh mục theo trạng thái và tìm kiếm danh mục
        }
    });
    return tree;
}

module.exports.tree = (arr, parentId = "",status = "", search = null) => {
    const tree = createTree(arr, parentId,status, search);
    return tree;
}