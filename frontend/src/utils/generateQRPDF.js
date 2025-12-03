import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateQROnePage = async (buildingName, buildingId, buildingAddress) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  
  // URL do visitante
  const visitorUrl = `${window.location.origin}/visitor/${buildingId}`;
  
  // Gerar QR Code como data URL
  const qrDataUrl = await QRCode.toDataURL(visitorUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#1E293B',
      light: '#FFFFFF'
    }
  });

  // Background azul no topo
  pdf.setFillColor(59, 130, 246); // #3B82F6
  pdf.rect(0, 0, pageWidth, 60, 'F');

  // Logo (simulado com texto estilizado)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AcessaAqui', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Acesso rápido, seguro e digital. Aqui.', pageWidth / 2, 35, { align: 'center' });

  // Título
  pdf.setTextColor(15, 23, 42); // #0F172A
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Faça seu check-in digital', pageWidth / 2, 75, { align: 'center' });

  // Nome do prédio
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(buildingName, pageWidth / 2, 90, { align: 'center' });
  
  if (buildingAddress) {
    pdf.setFontSize(12);
    pdf.setTextColor(71, 85, 105); // #475569
    pdf.text(buildingAddress, pageWidth / 2, 100, { align: 'center' });
  }

  // Instruções
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Como usar:', 30, 120);

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  const steps = [
    '1. Aponte a câmera do celular para o QR Code',
    '2. Preencha seus dados no formulário',
    '3. Aguarde a liberação da empresa'
  ];

  let yPos = 135;
  steps.forEach(step => {
    pdf.text(step, 30, yPos);
    yPos += 12;
  });

  // QR Code centralizado
  const qrSize = 120;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 170;
  
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Box ao redor do QR Code
  pdf.setDrawColor(203, 213, 225); // #CBD5E1
  pdf.setLineWidth(1);
  pdf.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Suporte: neuraone.ai@gmail.com', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.text('Conforme LGPD - Seus dados serão usados apenas para controle de acesso', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Salvar PDF
  pdf.save(`AcessaAqui-QRCode-${buildingName.replace(/\s+/g, '-')}.pdf`);
  
  return true;
};
