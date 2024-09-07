module.exports.newProductsPrice = (products) => {
    const newProducts = products.map(item =>{
        item.newPrice = (item.price*(100 - item.discountPercentage)/100).toFixed(0);
        return item;
    })

    return newProducts;
}