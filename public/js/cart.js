// Cập nhật số lượng trong giỏ hàng
const inputsQuantity = document.querySelectorAll("input[name='quantity']");
if(inputsQuantity.length > 0){
    inputsQuantity.forEach(input => {
        input.addEventListener("change",()=>{
            let quantity = parseInt(input.value);
            const productId = input.getAttribute("product-id");
            const min = parseInt(input.getAttribute("min"));
            const max = parseInt(input.getAttribute("max"));
            
            // Đảm bảo giá trị nằm trong khoảng cho phép
            if (quantity < min) quantity = min;
            if (quantity > max) quantity = max;
            
            window.location.href = `/cart/update/${productId}/${quantity}`
        })
    })
}
// Kết thúc cập nhật số lượng trong giỏ hàng