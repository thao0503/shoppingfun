// Show alert 
const showAlert = document.querySelector("[ show-alert]");
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    },time);

    closeAlert.addEventListener("click",() => {
        showAlert.classList.add("alert-hidden");
    })
}
// End Show alert 

// Search
const formSearch = document.getElementById('form-search');
if(formSearch){
    keywordInput = formSearch.querySelector('input[name="keyword"]');
    formSearch.addEventListener("submit", (event) => {
        if (!keywordInput.value.trim()) { 
            event.preventDefault();

            history.replaceState(null, '', window.location.href);
        };
    });
};
// End seatch

// Pagination
const buttonPagination = document.querySelectorAll("[button-pagination]");
if (buttonPagination) {
    let url = new URL(window.location.href);
    buttonPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");

            url.searchParams.set("page", page);

            window.location.href = url;
        });
    });
};
// End Pagination