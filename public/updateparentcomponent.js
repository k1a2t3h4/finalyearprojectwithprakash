let code=null;
function createupdateForm(data,selectedParentComponent) {
    const editFormDiv = document.getElementById('edit-form');
    editFormDiv.innerHTML = ''; 
    code=selectedParentComponent.data.code;
    const dynamicForm = document.createElement('form');
    dynamicForm.id = 'editDynamicForm';

    for (let key in data) {
        const value = data[key];
        let inputElement;

        switch (key) {
            case 'title':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter title';
                inputElement.name = key;
                inputElement.required = true; 
                inputElement.value = value || ''; 
                break;
            case 'code':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter code';
                inputElement.name = key;
                inputElement.required = true; 
                inputElement.value = value || '';
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = `Enter ${key}`;
                inputElement.name = key;
                inputElement.value = value || '';
        }

        const label = document.createElement('label');
        label.innerText = key.charAt(0).toUpperCase() + key.slice(1);
        dynamicForm.appendChild(label);
        dynamicForm.appendChild(inputElement);
    }

    editFormDiv.appendChild(dynamicForm); 
}
document.getElementById('updatedetailsBtn').addEventListener('click', () => {
    const formElement = document.getElementById('editDynamicForm');
    const formData = new FormData(formElement);
    const updatedData = {};

    formData.forEach((value, key) => {
        updatedData[key] = value;
    });
       
    if (isFormValid(formElement)) {
        const componentCode = updatedData['code'];

        fetch('/getAllComponents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(components => {
                let codeUnique = true;

                components.forEach(component => {
                    if (component.data.code === componentCode && component.data.code !== code) {
                        codeUnique = false;
                    }
                    component.childcomponent.forEach(child => {
                        if (child.data.code === componentCode) {
                            codeUnique = false;
                        }
                    });
                });
                if (!codeUnique) {
                    alert('The code already exists. Please enter a unique code.');
                    return;
                }

                fetch('/updateParentComponent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parentcode: code,
                        Data: updatedData, 
                    }),
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log('Parent component updated:', result);
                        alert('Component updated successfully.');
                        document.getElementById('edit-form-popup').style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error updating parent component:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching components:', error);
            });
    } else {
        alert('Please fill out all required fields.');
    }
});

document.getElementById('closeeditFormBtn').addEventListener('click', () => {
document.getElementById('edit-form-popup').style.display = 'none'; 
});