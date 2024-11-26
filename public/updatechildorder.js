document.addEventListener('DOMContentLoaded', function() {
    const updateChildOrderBtn = document.getElementById('updatechildorder');
    const newOrderInput = document.getElementById('newOrderInput');

    // Assuming these variables will be set when a child component is selected for editing
    let parentCode = ''; // You should populate this dynamically
    let childComponentCode = ''; // You should populate this dynamically

    // Function to open the child edit popup and populate the form
    function openEditChildForm(parent, childCode, currentOrder) {
        parentCode = parent;
        childComponentCode = childCode;
        newOrderInput.value = currentOrder; // Pre-fill the input with the current order

        document.getElementById('edit-child-form-popup').style.display = 'block';
    }

    // Function to update the child component order
    async function updateChildOrder() {
        const updatedOrder = newOrderInput.value;

        if (!updatedOrder) {
            alert('Please enter a new order.');
            return;
        }

        try {
            const response = await fetch('/edit-child-component-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    parentCode: parentCode,
                    childComponentCode: childComponentCode,
                    updatedorder: updatedOrder
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Child component order updated successfully!');
                // Optionally, refresh the component list or close the popup
                document.getElementById('edit-child-form-popup').style.display = 'none';
            } else {
                alert('Failed to update child component order: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating child component order:', error);
            alert('An error occurred while updating the order.');
        }
    }

    // Attach event listener to the "UPDATECHILDORDER" button
    updateChildOrderBtn.addEventListener('click', updateChildOrder);

    // Function to close the form
    document.getElementById('closeChildEditFormBtn').addEventListener('click', function() {
        document.getElementById('edit-child-form-popup').style.display = 'none';
    });
});
