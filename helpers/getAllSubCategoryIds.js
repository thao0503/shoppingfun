module.exports = function getAllSubCategoryIds(arr, parentId, status) {
    const allSubIds = [];
    
    arr.forEach((item) => {
        if (item.parent_id === parentId) {
            const childrenIds = getAllSubCategoryIds(arr, item.id, status);
            
            // Kiểm tra nếu trạng thái của mục hiện tại phù hợp, thêm id vào mảng
            if (item.status === status) {
                allSubIds.push(item.id);
            }
            
            // Thêm tất cả id của danh mục con cháu vào mảng
            allSubIds.push(...childrenIds);
        }
    });
    
    return allSubIds;
};
