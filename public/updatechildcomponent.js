let selectedChildupdateComponent = null;
let selectedChildparentupdateComponent = null;

function createChildUpdateForm(childComponent, code) {
    selectedChildupdateComponent = childComponent;
    selectedChildparentupdateComponent = code;
    const editChildFormDiv = document.getElementById('edit-child-form');
    editChildFormDiv.innerHTML = '';

    const dynamicChildForm = document.createElement('form');
    dynamicChildForm.id = 'editChildDynamicForm';

    for (let key in childComponent.data) {
        const value = childComponent.data[key];
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
        dynamicChildForm.appendChild(label);
        dynamicChildForm.appendChild(inputElement);
    }

    const orderLabel = document.createElement('label');
    orderLabel.innerText = 'Order';
    const orderInput = document.createElement('input');
    orderInput.type = 'number';
    orderInput.id = 'newOrderInput';
    orderInput.name = 'newOrderInput';
    orderInput.value = childComponent.order;
    editChildFormDiv.appendChild(orderLabel);
    editChildFormDiv.appendChild(orderInput);

    editChildFormDiv.appendChild(dynamicChildForm);
    document.getElementById('edit-child-form-popup').style.display = 'block';
}

document.getElementById('updateChildDetailsBtn').addEventListener('click', () => {
    const formElement = document.getElementById('editChildDynamicForm');
    const formData = new FormData(formElement);
    const updatedChildData = {};

    formData.forEach((value, key) => {
        updatedChildData[key] = value;
    });

    if (isFormValid(formElement)) {
        const componentCode = updatedChildData['code'];

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
                if (component.data.code === componentCode) {
                    codeUnique = false;
                }
                component.childcomponent.forEach(child => {
                    if (child.data.code === componentCode && child.data.code !== selectedChildupdateComponent.data.code) {
                        codeUnique = false;
                    }
                });
            });

            if (!codeUnique) {
                alert('The code already exists. Please enter a unique code.');
                return;
            }

            fetch('/update-child-component', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    parentCode: selectedChildparentupdateComponent,
                    childComponentCode: selectedChildupdateComponent.data.code,
                    childData: updatedChildData,
                }),
            })
            .then(response => response.json())
            .then(result => {
                console.log('Child component updated:', result);
                alert('Child component updated successfully.');
                document.getElementById('edit-child-form-popup').style.display = 'none';
            })
            .catch(error => {
                console.error('Error updating child component:', error);
            });
        })
        .catch(error => {
            console.error('Error fetching components:', error);
        });
    } else {
        alert('Please fill out all required fields.');
    }
});

document.getElementById('updatechildorder').addEventListener('click', async () => {
    const newOrder = parseInt(document.getElementById('newOrderInput').value);
    if (!newOrder || isNaN(newOrder)) {
        alert('Please enter a valid order number.');
        return;
    }
    try {
        const response = await fetch(`/getComponent?parentCode=${selectedChildparentupdateComponent}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const parentComponent = await response.json();
        const childComponentsLength = parentComponent.childcomponent.length;

        if (newOrder < 1 || newOrder > childComponentsLength) {
            alert(`Please enter an order between 1 and ${childComponentsLength}.`);
            return;
        }

        const updateResponse = await fetch('/update-child-component-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parentCode: selectedChildparentupdateComponent,
                childComponentCode: selectedChildupdateComponent.data.code,
                updatedOrder: newOrder,
            })
        });

        const result = await updateResponse.json();

        if (updateResponse.ok) {
            alert('Child component order updated successfully!');
            document.getElementById('edit-child-form-popup').style.display = 'none';
        } else {
            alert('Failed to update child component order: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating child component order:', error);
        alert('An error occurred while updating the order.');
    }
});

