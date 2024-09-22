document.getElementById('avatar').addEventListener('change', function(event) {
    const input = event.target;
    const previewImage = document.querySelector('.profile-image img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            previewImage.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
});
