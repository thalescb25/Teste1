import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const validateCompaniesCSV = (data) => {
  const errors = [];
  const validCompanies = [];
  
  data.forEach((row, index) => {
    const lineNumber = index + 2; // +2 because index starts at 0 and we have header
    
    if (!row['Nome da Empresa'] || !row['Número do Conjunto']) {
      errors.push(`Linha ${lineNumber}: Nome da Empresa e Número do Conjunto são obrigatórios`);
    } else {
      validCompanies.push({
        name: row['Nome da Empresa'],
        suite: row['Número do Conjunto'],
        phone: row['Telefone'] || '',
        cnpj: row['CNPJ'] || '',
        receptionistEmail: row['Email da Recepcionista'] || '',
        receptionistName: row['Nome da Recepcionista'] || ''
      });
    }
  });
  
  return { validCompanies, errors };
};
