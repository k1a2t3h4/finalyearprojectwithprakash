let selectedDeleteChildComponent = null; 
let selectedDeleteChildparentComponent =null;
function showChildDeletePopup(childComponent,code) { 
    selectedDeleteChildComponent = childComponent; 
    selectedDeleteChildparentComponent=code;
    document.getElementById('delete-child-confirm-popup').style.display = 'block'; 
}

function closeChildDeletePopup() {
    document.getElementById('delete-child-confirm-popup').style.display = 'none'; 
}

function deleteChildComponent() {
    const childComponentCode = selectedDeleteChildComponent.data.code; 

    fetch(`/delete-child-component`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            parentCode:selectedDeleteChildparentComponent,
            childComponentCode: childComponentCode 
        }),
    })
    .then(response => response.json())
    .then(result => {
        selectedDeleteChildComponent.parentNode.removeChild(selectedDeleteChildComponent); 
        alert('Child component deleted successfully!');
        closeChildDeletePopup(); 
    })
    .catch(error => {
        console.error('Error deleting child component:', error);
        alert('Error deleting child component.');
        closeChildDeletePopup();
    });
}

document.getElementById('deleteChildConfirmBtn').addEventListener('click', deleteChildComponent);
document.getElementById('closeChildDeletePopupBtn').addEventListener('click', closeChildDeletePopup);