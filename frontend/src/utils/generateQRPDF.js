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

  // Modern gradient header with two-tone blue
  pdf.setFillColor(30, 64, 175); // Dark blue base
  pdf.rect(0, 0, pageWidth, 80, 'F');
  
  pdf.setFillColor(59, 130, 246); // Lighter blue overlay
  pdf.rect(0, 0, pageWidth, 60, 'F');

  // Company logo area (top left)
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(15, 15, 30, 30, 3, 3, 'F');
  pdf.setTextColor(59, 130, 246);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🏢', 22, 38);

  // AcessaAqui branding
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AcessaAqui', pageWidth / 2, 32, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Acesso rápido, seguro e digital.', pageWidth / 2, 42, { align: 'center' });

  // Título
  pdf.setTextColor(15, 23, 42); // #0F172A
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Faça seu check-in digital', pageWidth / 2, 95, { align: 'center' });

  // Nome do prédio
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(buildingName, pageWidth / 2, 110, { align: 'center' });
  
  if (buildingAddress) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105); // #475569
    pdf.text(buildingAddress, pageWidth / 2, 120, { align: 'center' });
  }

  // Instruções
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Como usar:', pageWidth / 2, 140, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  
  const steps = [
    '1. Aponte a câmera do celular para o QR Code abaixo',
    '2. Preencha seus dados no formulário que abrir',
    '3. Aguarde a liberação pela empresa visitada'
  ];

  let yPos = 152;
  steps.forEach(step => {
    pdf.text(step, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
  });

  // QR Code centralizado com design moderno
  const qrSize = 110;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 190;
  
  // Background box com sombra
  pdf.setFillColor(248, 250, 252); // #F8FAFC
  pdf.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 5, 5, 'F');
  
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Borda moderna ao redor do QR Code
  pdf.setDrawColor(59, 130, 246); // #3B82F6
  pdf.setLineWidth(2);
  pdf.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 5, 5);

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
