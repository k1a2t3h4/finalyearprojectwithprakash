let code1=null;
function showDeletePopup(DeleteComponent) {
    document.getElementById('delete-confirm-popup').style.display = 'block';
    code1=DeleteComponent;
}

function closeDeletePopup() {
    document.getElementById('delete-confirm-popup').style.display = 'none';
}

function deleteComponent() {
    const componentcode = code1.data.code; 

    fetch(`/delete-component`, {
        method: 'DELETE', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            componentCode:componentcode 
        }),
    })
    .then(response => response.json()) 
    .then(result => {
            selectedDeleteComponent.parentNode.removeChild(selectedDeleteComponent);
            alert('Component deleted!'+result);
            closeDeletePopup();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting component!');
        closeDeletePopup();
    });
}

document.getElementById('deleteConfirmBtn').addEventListener('click', deleteComponent);
document.getElementById('closeDeletePopupBtn').addEventListener('click', closeDeletePopup);