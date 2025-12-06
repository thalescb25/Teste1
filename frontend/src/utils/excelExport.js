import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportVisitorsToExcel = (visitors, companies = []) => {
  const data = visitors.map(v => {
    const company = companies.find(c => c.id === v.companyId);
    return {
      'Nome': v.fullName,
      'Email': v.email || '',
      'Telefone': v.phone || '',
      'Documento': v.document || '',
      'Anfitrião': v.hostName,
      'Empresa Visitada': company?.name || '',
      'Conjunto': company?.suite || '',
      'Empresa Representa': v.representingCompany || '',
      'Motivo': v.reason || '',
      'Prestador de Serviço': v.serviceProvider ? 'Sim' : 'Não',
      'Acompanhantes': v.companions || 0,
      'Status': v.status === 'approved' ? 'Aprovado' : v.status === 'denied' ? 'Recusado' : v.status === 'checked_out' ? 'Finalizado' : 'Pendente',
      'Check-in': v.checkInTime ? new Date(v.checkInTime).toLocaleString('pt-BR') : '',
      'Check-out': v.checkOutTime ? new Date(v.checkOutTime).toLocaleString('pt-BR') : '',
      'Observações': v.notes || ''
    };
  });
  
  exportToExcel(data, 'historico_visitantes');
};
