// Form update status orders
const formUpdateStatusOrders = document.querySelector("[form-update-status-orders]");
if(formUpdateStatusOrders){
    formUpdateStatusOrders.addEventListener("submit", (e) => {
        e.preventDefault();

        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsIdChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

        // const statusChange = e.target.elements.status.value;


        if(inputsIdChecked.length > 0){
            let ids = [];
            const inputIds = formUpdateStatusOrders.querySelector("input[name='ids']");

            inputsIdChecked.forEach(input => {
                const id = input.value;
                ids.push(id);
            });

            inputIds.value = ids.join(", ");

            formUpdateStatusOrders.submit();

        }else{
            alert("Vui lòng chọn ít nhất 1 bản ghi!")
        }

    })
} 
// End Form change orders