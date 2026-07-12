document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('zakat-form');
    const resultDiv = document.getElementById('zakat-result');
    const amountDiv = document.getElementById('zakat-amount');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const gold = parseFloat(document.getElementById('gold').value) || 0;
            const cash = parseFloat(document.getElementById('cash').value) || 0;
            const investments = parseFloat(document.getElementById('investments').value) || 0;
            const business = parseFloat(document.getElementById('business').value) || 0;
            const liabilities = parseFloat(document.getElementById('liabilities').value) || 0;

            const totalAssets = gold + cash + investments + business;
            const netWealth = totalAssets - liabilities;

            if (netWealth > 0) {
                const zakat = netWealth * 0.025;
                amountDiv.textContent = zakat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else {
                amountDiv.textContent = '0.00';
            }
            
            resultDiv.style.display = 'block';
        });
    }
});
