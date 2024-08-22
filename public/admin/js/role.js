// Delete role
const buttonDelete = document.querySelectorAll("[button-delete ]")
if(buttonDelete.length > 0){
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonDelete.forEach(button => {
        button.addEventListener("click",() => {
            const isConfirm = confirm("Bạn có chắc muốn xóa nhóm quyền này?");
            if(isConfirm){
                const id = button.getAttribute("data-id");
                const action = `${path}/${id}?_method=DELETE`;
                formDeleteItem.action = action;
                formDeleteItem.submit();

            }
        })
    })
}
// End Delete role