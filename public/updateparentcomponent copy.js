let selectedParentComponentCode = null;

function createupdateForm(data, selectedParentComponent) {
    selectedParentComponentCode = selectedParentComponent.data.code;
    const editFormDiv = document.getElementById('edit-form');
    editFormDiv.innerHTML = ''; 

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

    const orderLabel = document.createElement('label');
    orderLabel.innerText = 'Order';
    const orderInput = document.createElement('input');
    orderInput.type = 'number';
    orderInput.id = 'newParentOrderInput';
    orderInput.name = 'newParentOrderInput';
    orderInput.value = selectedParentComponent.order;
    editFormDiv.appendChild(orderLabel);
    editFormDiv.appendChild(orderInput);

    editFormDiv.appendChild(dynamicForm);
    document.getElementById('edit-form-popup').style.display = 'block';
}

document.getElementById('updateParentDetailsBtn').addEventListener('click', () => {
    const formElement = document.getElementById('editDynamicForm');
    const formData = new FormData(formElement);
    const updatedParentData = {};

    formData.forEach((value, key) => {
        updatedParentData[key] = value;
    });

    if (isFormValid(formElement)) {
        const componentCode = updatedParentData['code'];

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
                if (component.data.code === componentCode && component.data.code !== selectedParentComponentCode) {
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
                    parentcode: selectedParentComponentCode,
                    Data: updatedParentData,
                }),
            })
            .then(response => response.json())
            .then(result => {
                console.log('Parent component updated:', result);
                alert('Parent component updated successfully.');
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

document.getElementById('updateParentOrderBtn').addEventListener('click', async () => {
    const newOrder = parseInt(document.getElementById('newParentOrderInput').value);
    if (!newOrder || isNaN(newOrder)) {
        alert('Please enter a valid order number.');
        return;
    }
    try {
        const response = await fetch(`/getAllComponents`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const parentComponent = await response.json();
        const parentComponentsLength = parentComponent.length; 

        if (newOrder < 1 || newOrder > parentComponentsLength) {
            alert(`Please enter an order between 1 and ${parentComponentsLength}.`);
            return;
        }

        const updateResponse = await fetch('/update-parent-component-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parentComponentCode: selectedParentComponentCode,
                updatedOrder: newOrder,
            })
        });

        const result = await updateResponse.json();

        if (updateResponse.ok) {
            alert('Parent component order updated successfully!');
            document.getElementById('edit-form-popup').style.display = 'none';
        } else {
            alert('Failed to update parent component order: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating parent component order:', error);
        alert('An error occurred while updating the order.');
    }
});

document.getElementById('closeeditFormBtn').addEventListener('click', () => {
    document.getElementById('edit-form-popup').style.display = 'none';
});