window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://46.219.14.252:5000/merchants');
    const merchants = await response.json();

    const tableBody = document.querySelector('#merchants-table tbody');

    merchants.forEach(merchant => {
      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      const companyNameCell = document.createElement('td');
      const nameCell = document.createElement('td');
      const phoneNumberCell = document.createElement('td');
      const merchantsCell = document.createElement('td');

      idCell.textContent = merchant.id;
      companyNameCell.textContent = merchant.company_name;
      nameCell.textContent = merchant.full_name;
      phoneNumberCell.textContent = merchant.phone_number;
      merchantsCell.textContent = merchant.merchants.join('\n');

      row.appendChild(idCell);
      row.appendChild(companyNameCell);
      row.appendChild(nameCell);
      row.appendChild(phoneNumberCell);
      row.appendChild(merchantsCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error retrieving merchants:', error);
  }
});
