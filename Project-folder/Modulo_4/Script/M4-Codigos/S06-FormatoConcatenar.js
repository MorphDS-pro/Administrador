const referenceInput = document.getElementById('registerReference');
const detailsInput = document.getElementById('registerDetails');
const descriptionSpan = document.getElementById('registerDescription');

function formatConcatenation(reference, details) {
    const formattedReference = reference.trim();
    const formattedDetails = details.trim();
    return `${formattedReference} ${formattedDetails}`.trim();
}

function updateDescription() {
    const referenceValue = referenceInput.value;
    const detailsValue = detailsInput.value;
    descriptionSpan.textContent = formatConcatenation(referenceValue, detailsValue);
}

referenceInput.addEventListener('input', updateDescription);
detailsInput.addEventListener('input', updateDescription);

const costInput = document.getElementById('registerCost');
const priceSpan = document.getElementById('registerPrice');

function formatChileanPrice(value) {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (!isNaN(numericValue)) {
        const limitedValue = Math.min(numericValue, 9999999);
        return limitedValue.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '';
}

function updateCost() {
    let costValue = costInput.value;
    costValue = formatChileanPrice(costValue);
    costInput.value = costValue;
    priceSpan.textContent = costValue;
}

costInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    costInput.value = formatChileanPrice(value);
    priceSpan.textContent = costInput.value;
});

